/**
 * End-to-end check of registration and the OnlinePay flow against a LOCAL server, a throwaway
 * database and an in-process mock gateway. Never point it at production.
 *
 *   1. docker run -d --name invent-paytest-pg -e POSTGRES_USER=invent \
 *        -e POSTGRES_PASSWORD=invent -e POSTGRES_DB=invent_paytest -p 55432:5432 postgres:16
 *   2. export DATABASE_URL=postgresql://invent:invent@127.0.0.1:55432/invent_paytest
 *      export ONLINEPAY_APP_ID=99999 ONLINEPAY_GATEWAY_URL=http://127.0.0.1:8099/
 *      export AUTH_SECRET=local-only
 *      export AWS_ACCESS_KEY_ID=invalid AWS_SECRET_ACCESS_KEY=invalid  # no real mail
 *   3. npx prisma migrate deploy && npm run build && npx next start -p 3100
 *   4. APP_URL=http://127.0.0.1:3100 npx tsx scripts/verify-payments.ts
 *
 * The mock gateway listens on 127.0.0.1:8099. Its access point asks our
 * validator, then redirects to /api/onlinepay/payack; its ACK servlet answers OK only
 * for transactions it issued, and FAIL otherwise (as the real one does).
 */
import http from "node:http";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const APP_URL = (process.env.APP_URL || "http://127.0.0.1:3100").replace(/\/$/, "");
const APP_ID = process.env.ONLINEPAY_APP_ID || "";
const MOCK_PORT = 8099;
/** Transaction ids unique to this run, so re-runs against the same database stay independent. */
const RUN = randomBytes(3).toString("hex").toUpperCase();

function assertLocal(url: string, what: string) {
  const host = new URL(url).hostname;
  if (host !== "127.0.0.1" && host !== "localhost") {
    throw new Error(`${what} must be local (got ${host}); refusing to run.`);
  }
}
assertLocal(APP_URL, "APP_URL");
assertLocal(process.env.DATABASE_URL || "postgresql://none", "DATABASE_URL");
if (!APP_ID) throw new Error("Set ONLINEPAY_APP_ID as the server has it.");
if (process.env.ONLINEPAY_GATEWAY_URL !== `http://127.0.0.1:${MOCK_PORT}/`) {
  throw new Error(`Set ONLINEPAY_GATEWAY_URL=http://127.0.0.1:${MOCK_PORT}/ for both the server and this script.`);
}

const prisma = new PrismaClient();
const CALLBACK = `${APP_URL}/api/onlinepay/payack`;

// ─── mock gateway ────────────────────────────────────────────────────────────

const known = new Set<string>();
const flaky = new Set<string>();
const acks: string[] = [];
let nextOutcome = "S";
let nextAmountOverride: string | null = null;

function noticeUrl(fields: Record<string, string>) {
  return `${CALLBACK}?sMsg=${encodeURIComponent(new URLSearchParams(fields).toString())}`;
}

const mock = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${MOCK_PORT}`);
  if (url.pathname === "/commJsp/v2_accessPoint.jsp") {
    const m = Object.fromEntries(new URLSearchParams(url.searchParams.get("sMsg") || ""));
    const v = await fetch(`${APP_URL}/api/onlinepay/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Records: {
          input_APPID: m.sAppId,
          input_RequestID: m.sReqId,
          input_UserID: m.sUserId,
          input_Amount: m.sAmountDue,
        },
      }),
    }).then((r) => r.json() as Promise<{ Records: Record<string, string> }>);
    const valid = v.Records.output_Validation_Status === "VALID";
    const transId = `MOCK${randomBytes(5).toString("hex").toUpperCase()}`;
    if (valid) known.add(transId);
    res.writeHead(302, {
      Location: noticeUrl({
        requestType: "I",
        userId: m.sUserId ?? "",
        provId: "PAYU",
        reqId: m.sReqId ?? "",
        totalAmt: nextAmountOverride ?? m.sAmountDue ?? "",
        refNo: `REF${transId.slice(4)}`,
        transId,
        status: valid ? nextOutcome : "F",
        msg: valid ? "ok" : "validation failed",
        transDate: "11-10-2026",
        transTime: "12:00:00",
      }),
      "X-Mock-Valid": String(valid),
      "X-Mock-Sent": JSON.stringify(m),
    });
    res.end();
    return;
  }
  if (url.pathname === "/OnlinePayAckServlet") {
    const t = url.searchParams.get("transId") || "";
    acks.push(`${t}:${url.searchParams.get("requestType")}`);
    if (flaky.delete(t)) {
      res.writeHead(500).end("down");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/plain" }).end(known.has(t) ? "OK" : "FAIL");
    return;
  }
  res.writeHead(404).end("mock gateway");
});

// ─── helpers ─────────────────────────────────────────────────────────────────

let failures = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || detail === undefined ? "" : `  → ${JSON.stringify(detail)}`}`);
  if (!ok) failures++;
}

async function get(url: string, headers: Record<string, string> = {}) {
  return fetch(url, { redirect: "manual", headers });
}

async function validate(records: Record<string, string>) {
  const r = await fetch(`${APP_URL}/api/onlinepay/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Records: records }),
  });
  const body = (await r.json()) as { Records: Record<string, string> };
  return body.Records.output_Validation_Status;
}

/** The gateway link on the pay page, decoded back into its sMsg fields. */
async function payLink(token: string) {
  const html = await (await get(`${APP_URL}/conference/pay/${token}`)).text();
  const href = html.match(/href="([^"]*v2_accessPoint\.jsp[^"]*)"/)?.[1]?.replace(/&amp;/g, "&");
  if (!href) return null;
  const fields = Object.fromEntries(new URLSearchParams(new URL(href).searchParams.get("sMsg") || ""));
  return { href, fields, html };
}

/** Follow the hand-off exactly as a browser would: access point → callback. */
async function payThroughMock(token: string) {
  const link = await payLink(token);
  if (!link) throw new Error("no gateway link on the pay page");
  const gw = await get(link.href);
  const callback = gw.headers.get("location")!;
  const transId = new URLSearchParams(new URL(callback).searchParams.get("sMsg")!).get("transId")!;
  const back = await get(callback);
  return { link, valid: gw.headers.get("x-mock-valid") === "true", transId, back };
}

/** Credentials login through Auth.js; returns the Cookie header for later requests. */
async function login(email: string, password: string): Promise<Record<string, string>> {
  const csrfRes = await fetch(`${APP_URL}/api/auth/csrf`);
  const jar = (csrfRes.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  const res = await fetch(`${APP_URL}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: jar.join("; ") },
    body: new URLSearchParams({ csrfToken, email, password, callbackUrl: APP_URL }),
  });
  jar.push(...(res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]));
  return { Cookie: jar.join("; ") };
}

async function newUser(name: string, role: "ATTENDEE" | "ADMIN" = "ATTENDEE") {
  const email = `${role.toLowerCase()}-${randomBytes(4).toString("hex")}@example.invalid`;
  await prisma.user.create({ data: { email, name, role, passwordHash: await bcrypt.hash("local-pass", 4) } });
  return { email, cookie: await login(email, "local-pass") };
}

/** POST the registration form exactly as the multi-step form does. */
async function register(cookie: Record<string, string>, fields: Record<string, string>, pdf?: boolean) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  if (pdf) form.set("abstract", new Blob(["%PDF-1.4\n% test abstract\n"], { type: "application/pdf" }), "abstract.pdf");
  const res = await fetch(`${APP_URL}/api/conference/apply`, { method: "POST", body: form, headers: { ...cookie, Accept: "application/json" } });
  return { status: res.status, body: (await res.json()) as { ok?: boolean; error?: string; paymentToken?: string; feeDue?: boolean } };
}

async function emailAttempted(action: string, entityId: string) {
  const rows = await prisma.auditLog.count({
    where: { entityId, action: { in: [action, `${action}.failed`] } },
  });
  return rows > 0;
}

async function seedApplication(edition: { id: string }, opts: { name: string; status?: "ATTENDEE" | "RECEIVED"; amountPaise?: number; withUser?: boolean }) {
  const email = `pay-${randomBytes(4).toString("hex")}@example.invalid`;
  const user = opts.withUser === false
    ? null
    : await prisma.user.create({ data: { email, name: opts.name } });
  return prisma.conferenceApplication.create({
    data: {
      editionId: edition.id,
      userId: user?.id,
      email,
      name: opts.name,
      phone: "9999999999",
      institution: "Test Institute",
      professionalCategory: "STUDENT",
      participationCategory: "ATTENDEE",
      status: opts.status ?? "ATTENDEE",
      paymentStatus: (opts.status ?? "ATTENDEE") === "ATTENDEE" ? "UNPAID" : "NOT_REQUIRED",
      paymentAmountPaise: opts.amountPaise ?? 500_000,
      paymentToken: randomBytes(24).toString("hex"),
      abstractViewToken: randomBytes(24).toString("hex"),
    },
  });
}

// ─── scenarios ───────────────────────────────────────────────────────────────

async function main() {
  await new Promise<void>((resolve) => mock.listen(MOCK_PORT, "127.0.0.1", resolve));

  await prisma.edition.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
  const edition = await prisma.edition.upsert({
    where: { year: 2027 },
    update: { isCurrent: true },
    create: {
      year: 2027,
      slug: "2027",
      name: "INV.ENT 2027",
      startsAt: new Date("2027-01-30T03:30:00Z"),
      endsAt: new Date("2027-01-31T12:30:00Z"),
      venueName: "DSSE Building",
      venueAddress: "IIT Bombay",
      status: "ANNOUNCED",
      isCurrent: true,
    },
  });

  // 1. Happy path: pay page → validator → immediate success → ACK → PAID.
  const a = await seedApplication(edition, { name: "Asha Rao" });
  const link = await payLink(a.paymentToken);
  const minted = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: a.id } });
  check("pay page mints a registration ID", /^AR_inv27_\d{6}$/.test(minted.payerId ?? ""), minted.payerId);
  check("pay page shows the registration ID", !!link && link.html.includes(minted.payerId!));
  check("gateway link carries the reference sMsg fields", !!link &&
    link.fields.sAppId === APP_ID && link.fields.sUserId === minted.payerId &&
    link.fields.sAmountDue === "5000" && link.fields.sCurrency === "INR" &&
    /^[0-9a-f]{24}$/.test(link.fields.sReqId ?? "") && link.fields.sUserName === "Asha Rao", link?.fields);
  const second = await payLink(a.paymentToken);
  check("each page load gets a fresh request id", second?.fields.sReqId !== link?.fields.sReqId);
  check("registration ID is stable across loads", second?.fields.sUserId === minted.payerId);

  check("validator: VALID for the exact request", (await validate({ input_APPID: APP_ID, input_RequestID: "r1", input_UserID: minted.payerId!, input_Amount: "5000.00" })) === "VALID");
  check("validator: INVALID for a different amount", (await validate({ input_APPID: APP_ID, input_RequestID: "r1", input_UserID: minted.payerId!, input_Amount: "50" })) === "INVALID");
  check("validator: INVALID for another app id", (await validate({ input_APPID: "12345", input_RequestID: "r1", input_UserID: minted.payerId!, input_Amount: "5000" })) === "INVALID");
  check("validator: INVALID for an unknown registration", (await validate({ input_APPID: APP_ID, input_RequestID: "r1", input_UserID: "ZZ_inv27_000000", input_Amount: "5000" })) === "INVALID");
  check("validator: INVALID for a missing field", (await validate({ input_APPID: APP_ID, input_UserID: minted.payerId!, input_Amount: "5000" })) === "INVALID");
  const garbage = await fetch(`${APP_URL}/api/onlinepay/validate`, { method: "POST", body: "not json" });
  check("validator: non-JSON gets the JSON envelope, INVALID", ((await garbage.json()) as { Records: Record<string, string> }).Records.output_Validation_Status === "INVALID");

  const paid = await payThroughMock(a.paymentToken);
  check("mock gateway got VALID from our validator", paid.valid);
  const loc = paid.back.headers.get("location") ?? "";
  check("immediate callback returns the payer to their pay page with result=S",
    paid.back.status === 303 && loc.includes(`/conference/pay/${a.paymentToken}`) && loc.includes("result=S"), { status: paid.back.status, loc });
  const rowA = await prisma.gatewayPayment.findUnique({ where: { transId: paid.transId } });
  check("transaction recorded and verified by ACK", !!rowA?.verified && rowA.imtStatus === "S" && rowA.imtAck === "I_ACK_OK", rowA);
  const appA = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: a.id } });
  check("registration marked PAID with the transaction as reference", appA.paymentStatus === "PAID" && appA.paymentRef === paid.transId);
  const ticket = await prisma.registration.findFirst({ where: { userId: appA.userId!, editionId: edition.id } });
  check("event ticket issued", ticket?.status === "CONFIRMED");
  // The payer gets one email: the ticket with the receipt in it (mail fails here, so attempts count).
  await new Promise((r) => setTimeout(r, 1500));
  check("payment: one email carries the ticket and the receipt", await emailAttempted("email.ticket_receipt", paid.transId));
  check("payment: no separate receipt email", !(await emailAttempted("email.payment_receipt", paid.transId)));
  check("payment: no separate ticket email", !(await emailAttempted("email.registration_confirmed", ticket!.id)));
  check("validator: INVALID once paid (no double payment)", (await validate({ input_APPID: APP_ID, input_RequestID: "r2", input_UserID: minted.payerId!, input_Amount: "5000" })) === "INVALID");
  const paidPage = await (await get(`${APP_URL}/conference/pay/${a.paymentToken}`)).text();
  check("pay page shows the paid transaction and no gateway link", paidPage.includes(paid.transId) && !paidPage.includes("v2_accessPoint.jsp"));
  const receipt = await get(`${APP_URL}/conference/pay/${a.paymentToken}/receipt`);
  check("receipt page renders", receipt.status === 200 && (await receipt.text()).includes(paid.transId));

  // 2. A repeat notice never downgrades a confirmed success.
  const downgrade = await get(noticeUrl({ requestType: "I", userId: minted.payerId!, reqId: "x", totalAmt: "5000", transId: paid.transId, status: "F", transDate: "11-10-2026", transTime: "12:05:00" }));
  const rowA2 = await prisma.gatewayPayment.findUniqueOrThrow({ where: { transId: paid.transId } });
  check("repeat F notice keeps the recorded success", downgrade.status === 303 && rowA2.imtStatus === "S" && rowA2.verified);

  // 3. Forged success for a transaction the gateway never issued.
  const b = await seedApplication(edition, { name: "Bala K" });
  await payLink(b.paymentToken);
  const bId = (await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: b.id } })).payerId!;
  const forged = await get(noticeUrl({ requestType: "I", userId: bId, reqId: "x", totalAmt: "5000", transId: `FORGED123${RUN}`, status: "S" }));
  const rowB = await prisma.gatewayPayment.findUnique({ where: { transId: `FORGED123${RUN}` } });
  const appB = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: b.id } });
  check("forged success: ACK says FAIL, not verified, not paid",
    !rowB?.verified && rowB?.imtAck === "I_ACK_FAIL" && appB.paymentStatus === "UNPAID", { rowB, status: appB.paymentStatus });
  check("forged success: payer sees result=P (unconfirmed), not success", (forged.headers.get("location") ?? "").includes("result=P"));
  const bPage = await (await get(`${APP_URL}/conference/pay/${b.paymentToken}`)).text();
  check("pay page warns about the unconfirmed transaction", bPage.includes(`FORGED123${RUN}`));

  // 4. Return URLs: /payack needs no token; the older /callback paths run the same handler.
  const legacy = encodeURIComponent(`requestType=I&userId=${bId}&reqId=x&totalAmt=5000&transId=LEGACY${RUN}&status=S`);
  const viaCallback = await get(`${APP_URL}/api/onlinepay/callback?sMsg=${legacy}`);
  const viaCallbackAck = await get(`${APP_URL}/api/onlinepay/callback/ack?sMsg=${legacy}`);
  check("older /callback and /callback/ack URLs still record notices",
    viaCallback.status === 303 && viaCallbackAck.status === 303 &&
    (await prisma.gatewayPayment.count({ where: { transId: `LEGACY${RUN}` } })) === 1);
  check("a notice through any URL is still unconfirmed without ASC's ACK",
    (await prisma.gatewayPayment.findUniqueOrThrow({ where: { transId: `LEGACY${RUN}` } })).verified === false);
  const stray = await get(`${CALLBACK}?sMsg=${encodeURIComponent(`requestType=I&userId=NOBODY_inv27_000000&reqId=x&totalAmt=5000&transId=STRAY${RUN}&status=S`)}`);
  const strayHtml = await stray.text();
  check("immediate notice for an unknown payer gets a readable page, not an error",
    stray.status === 200 && (stray.headers.get("content-type") ?? "").includes("text/html") && strayHtml.includes(`STRAY${RUN}`), stray.status);
  check("malformed notice is rejected", (await get(`${CALLBACK}?sMsg=${encodeURIComponent("requestType=Z&transId=1")}`)).status === 400);
  check("missing sMsg is rejected", (await get(CALLBACK)).status === 400);

  // 5. Failed payment, then a successful retry.
  const c = await seedApplication(edition, { name: "Chitra" });
  nextOutcome = "F";
  const failed = await payThroughMock(c.paymentToken);
  nextOutcome = "S";
  const cAfterFail = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: c.id } });
  check("failed payment: result=F, still unpaid", (failed.back.headers.get("location") ?? "").includes("result=F") && cAfterFail.paymentStatus === "UNPAID");
  check("single-word name gets two initials", /^CH_inv27_\d{6}$/.test(cAfterFail.payerId ?? ""), cAfterFail.payerId);
  const retry = await payThroughMock(c.paymentToken);
  const cAfterRetry = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: c.id } });
  check("retry after failure succeeds", cAfterRetry.paymentStatus === "PAID" && cAfterRetry.paymentRef === retry.transId);

  // 6. Settlement only (no immediate notice reached us) still settles the fee.
  const d = await seedApplication(edition, { name: "Deepa Iyer" });
  await payLink(d.paymentToken);
  const dId = (await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: d.id } })).payerId!;
  known.add(`RECON001${RUN}`);
  const recon = await get(noticeUrl({ requestType: "R", userId: dId, reqId: "rq", totalAmt: "5000", refNo: "B1", transId: `RECON001${RUN}`, reconDate: "12-10-2026", reconTime: "09:00:00" }));
  const rowD = await prisma.gatewayPayment.findUniqueOrThrow({ where: { transId: `RECON001${RUN}` } });
  const appD = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: d.id } });
  check("reconciliation-only: OK, DIRECT_RECON row, verified, PAID",
    recon.status === 200 && (await recon.text()) === "OK" && rowD.imtStatus === "DIRECT_RECON" && rowD.verified && appD.paymentStatus === "PAID", rowD);

  // 6b. Direct recon whose fields arrive as separate query parameters, not inside sMsg.
  const d2 = await seedApplication(edition, { name: "Dev Patel" });
  await payLink(d2.paymentToken);
  const d2Id = (await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: d2.id } })).payerId!;
  known.add(`SPLIT${RUN}`);
  const split = await get(`${CALLBACK}?${new URLSearchParams({ requestType: "R", userId: d2Id, reqId: "rq", totalAmt: "5000", transId: `SPLIT${RUN}`, reconDate: "12-10-2026", reconTime: "11:00:00" })}`);
  const appD2 = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: d2.id } });
  check("direct recon with fields outside sMsg still settles the fee",
    split.status === 200 && appD2.paymentStatus === "PAID" && appD2.paymentRef === `SPLIT${RUN}`, { status: split.status, pay: appD2.paymentStatus });

  // 7. Underpayment is recorded but does not settle the fee.
  const e = await seedApplication(edition, { name: "Esha" });
  nextAmountOverride = "4000";
  const under = await payThroughMock(e.paymentToken);
  nextAmountOverride = null;
  const rowE = await prisma.gatewayPayment.findUniqueOrThrow({ where: { transId: under.transId } });
  const appE = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: e.id } });
  check("underpaid transaction: verified row but registration stays UNPAID", rowE.verified && appE.paymentStatus === "UNPAID");

  // 8. D notice is acknowledged and kept, and changes nothing.
  const dNotice = await get(noticeUrl({ requestType: "D", userId: minted.payerId!, transId: paid.transId, totalAmt: "-5000" }));
  const rowA3 = await prisma.gatewayPayment.findUniqueOrThrow({ where: { transId: paid.transId } });
  const appA3 = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: a.id } });
  check("D notice: OK, stored, payment untouched", dNotice.status === 200 && !!rowA3.dRaw && rowA3.verified && appA3.paymentStatus === "PAID");

  // 9. ACK fails once (gateway down); admin re-check later confirms and settles.
  const f = await seedApplication(edition, { name: "Farhan Ali" });
  await payLink(f.paymentToken);
  const fId = (await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: f.id } })).payerId!;
  known.add(`FLAKY001${RUN}`);
  flaky.add(`FLAKY001${RUN}`);
  await get(noticeUrl({ requestType: "I", userId: fId, reqId: "rq", totalAmt: "5000", transId: `FLAKY001${RUN}`, status: "S" }));
  const rowF = await prisma.gatewayPayment.findUniqueOrThrow({ where: { transId: `FLAKY001${RUN}` } });
  check("ACK outage: success recorded but unconfirmed", rowF.imtStatus === "S" && !rowF.verified && rowF.imtAck === "Err HTTP 500", rowF.imtAck);
  const { reacknowledgePayment } = await import("@/lib/conference-payment");
  const recheck = await reacknowledgePayment(`FLAKY001${RUN}`);
  const appF = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: f.id } });
  check("admin re-check confirms and settles it", recheck.verified && appF.paymentStatus === "PAID" && appF.paymentRef === `FLAKY001${RUN}`);

  // 10. Immediate and settlement notices racing for one transaction.
  const g = await seedApplication(edition, { name: "Gita Menon" });
  await payLink(g.paymentToken);
  const gId = (await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: g.id } })).payerId!;
  known.add(`RACE001${RUN}`);
  const [ri, rr] = await Promise.all([
    get(noticeUrl({ requestType: "I", userId: gId, reqId: "rq", totalAmt: "5000", transId: `RACE001${RUN}`, status: "S" })),
    get(noticeUrl({ requestType: "R", userId: gId, reqId: "rq", totalAmt: "5000", transId: `RACE001${RUN}`, reconDate: "12-10-2026", reconTime: "10:00:00" })),
  ]);
  const rowG = await prisma.gatewayPayment.findUniqueOrThrow({ where: { transId: `RACE001${RUN}` } });
  const tickets = await prisma.registration.count({ where: { userId: g.userId!, editionId: edition.id } });
  check("racing I + R: one row, both recorded, verified, one ticket",
    ri.status === 303 && rr.status === 200 && rowG.imtStatus === "S" && rowG.reconStatus === "RECONCILED" && rowG.verified && tickets === 1, { imt: rowG.imtStatus, recon: rowG.reconStatus, tickets });

  // 11. Not selected: no payment offered, validator refuses.
  const h = await seedApplication(edition, { name: "Hari", status: "RECEIVED" });
  const hLink = await payLink(h.paymentToken);
  check("not selected: no gateway link on the pay page", hLink === null);

  // 12. Registration: attendees owe the fee at once; presenters after shortlisting.
  const base = { phone: "+91 98200 00000", institution: "IIT Bombay", professionalCategory: "PHD_SCHOLAR", phdYear: "YEARS_1_3", seekingPostdoc: "NO" };
  const att = await newUser("Ira Shah");
  const attReg = await register(att.cookie, { ...base, name: "Ira Shah", email: att.email, participationCategory: "ATTENDEE", paperTitle: "ignored for attendees" });
  const attApp = await prisma.conferenceApplication.findFirst({ where: { email: att.email } });
  check("attendee registration: fee due at once", attReg.status === 200 && attReg.body.feeDue === true && !!attReg.body.paymentToken, attReg);
  check("attendee registration: ATTENDEE / UNPAID, student fee, ID minted, no paper title",
    attApp?.status === "ATTENDEE" && attApp.paymentStatus === "UNPAID" && attApp.paymentAmountPaise === 500_000 && /^IS_inv27_\d{6}$/.test(attApp.payerId ?? "") && attApp.paperTitle === null, attApp);
  await new Promise((r) => setTimeout(r, 1500)); // the proforma is sent in the background
  check("attendee registration: proforma invoice emailed", await emailAttempted("email.proforma_invoice", attApp!.id));
  check("attendee registration: no 'thank you for applying' copy instead", !(await emailAttempted("email.conference_application_copy", attApp!.id)));
  const regPage = await (await get(`${APP_URL}/conference/pay/${attReg.body.paymentToken}?registered=1`)).text();
  check("pay page after registering: banner, registration ID, gateway link", regPage.includes("Registration complete") && regPage.includes(attApp!.payerId!) && regPage.includes("v2_accessPoint.jsp"));
  const attPaid = await payThroughMock(attReg.body.paymentToken!);
  const attAfter = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: attApp!.id } });
  check("attendee pays through the gateway and is PAID", attAfter.paymentStatus === "PAID" && attAfter.paymentRef === attPaid.transId);

  const pres = await newUser("Jai Verma");
  const noPdf = await register(pres.cookie, { ...base, name: "Jai Verma", email: pres.email, participationCategory: "PAPER_ONLY", paperTitle: "Founders and fields" });
  check("paper registration without an abstract PDF is refused", noPdf.status === 400 && /abstract/i.test(noPdf.body.error ?? ""), noPdf);
  const noTitle = await register(pres.cookie, { ...base, name: "Jai Verma", email: pres.email, participationCategory: "OTHER", participationOther: "Panel" }, true);
  check("'Other' participation also needs abstract details", noTitle.status === 400 && /title/i.test(noTitle.body.error ?? ""), noTitle);
  const presReg = await register(pres.cookie, { ...base, name: "Jai Verma", email: pres.email, participationCategory: "PAPER_ONLY", paperTitle: "Founders and fields" }, true);
  const presApp = await prisma.conferenceApplication.findFirst({ where: { email: pres.email } });
  check("paper registration: under review, nothing due yet",
    presReg.status === 200 && presReg.body.feeDue === false && presApp?.status === "RECEIVED" && presApp.paymentStatus === "NOT_REQUIRED" && !!presApp.abstractStorageKey, { presReg, presApp });
  check("paper registration: no payment link before shortlisting", (await payLink(presApp!.paymentToken)) === null);

  const admin = await newUser("Admin", "ADMIN");
  const cookie = admin.cookie;
  const review = await fetch(`${APP_URL}/api/admin/applications/${presApp!.id}/review`, {
    method: "POST",
    headers: { ...cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ status: "SHORTLISTED_PAPER", message: "Congratulations, your paper is shortlisted.", sendEmail: true }),
  });
  const presSelected = await prisma.conferenceApplication.findUniqueOrThrow({ where: { id: presApp!.id } });
  check("shortlisting a presenter makes the fee due and mints the ID",
    review.status === 200 && presSelected.paymentStatus === "UNPAID" && /^JV_inv27_\d{6}$/.test(presSelected.payerId ?? ""), presSelected);
  check("shortlisting emails the proforma invoice", await emailAttempted("email.proforma_invoice", presApp!.id));
  check("shortlisted presenter's pay page offers checkout", (await payLink(presSelected.paymentToken)) !== null);

  // 13. Admin desk and CSV.
  const desk = await get(`${APP_URL}/admin/payments`, cookie);
  const deskHtml = await desk.text();
  check("admin payments desk renders the transactions", desk.status === 200 && deskHtml.includes(paid.transId) && deskHtml.includes(`FORGED123${RUN}`) && deskHtml.includes("Re-check with gateway"), desk.status);
  const filtered = await (await get(`${APP_URL}/admin/payments?state=unconfirmed`, cookie)).text();
  check("admin filter: unconfirmed shows the forged row only", filtered.includes(`FORGED123${RUN}`) && !filtered.includes(paid.transId));
  const csv = await get(`${APP_URL}/api/admin/payments/export`, cookie);
  const csvText = await csv.text();
  check("CSV export lists every transaction", csv.status === 200 && csvText.includes(paid.transId) && csvText.includes(`RECON001${RUN}`));
  check("CSV export refuses anonymous users", (await get(`${APP_URL}/api/admin/payments/export`)).status === 403);
  const detail = await (await get(`${APP_URL}/admin/applications/${a.id}`, cookie)).text();
  check("application page lists its gateway transaction", detail.includes(paid.transId) && detail.includes(minted.payerId!));

  console.log(`\nACK servlet calls: ${acks.length}`);
  console.log(failures === 0 ? "\nAll payment checks passed." : `\n${failures} check(s) FAILED.`);
}

main()
  .catch((err) => {
    console.error(err);
    failures++;
  })
  .finally(async () => {
    mock.close();
    await prisma.$disconnect();
    process.exit(failures === 0 ? 0 : 1);
  });
