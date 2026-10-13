/**
 * INV.ENT registration fees over IIT Bombay OnlinePay.
 *
 * The flow follows the department's other conference sites:
 *
 *   /conference/pay/[token]   fee due? → mint the registration ID (sUserId) →
 *                             recompute the amount → link straight to the gateway
 *   /api/onlinepay/validate   gateway asks "is this request valid?" → VALID/INVALID,
 *                             from the same amount computation as the pay page
 *   /api/onlinepay/callback   gateway notice → ACK servlet → one GatewayPayment row
 *                             per transId → if verified: PAID, ticket, receipt email
 *
 * A notice only counts once the ACK servlet confirms the transaction, so a
 * callback URL typed by hand cannot mark anyone paid. A repeat notice never
 * turns a recorded success back into a failure.
 */
import { randomInt } from "node:crypto";
import type { ApplicationStatus, ConferenceApplication, GatewayPayment } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  formatInrFromPaise,
  participationLabel,
  professionalLabel,
} from "@/lib/conference";
import {
  applicationFeeDue,
  issueEventTicketForApplication,
} from "@/lib/conference-access";
import { conferencePaymentUrl } from "@/lib/conference-server";
import {
  PROFORMA_EMAIL_ACTION,
  sendPaymentReceipt,
  sendProformaInvoiceEmail,
  sendRegistrationConfirmed,
} from "@/lib/email/transactions";
import { writeAuditLog } from "@/lib/admin/audit";
import {
  ackConfirmed,
  acknowledgeNotice,
  amountEqualsPaise,
  isNoticeType,
  onlinePayConfig,
  parseNotice,
  rupeesToPaise,
  type GatewayNotice,
  type ValidationRequest,
} from "@/lib/onlinepay";

/**
 * What the gateway is asked for and what the validator accepts. Both call
 * this, so they cannot disagree. Organisers fix the amount when they select
 * an applicant (fee band for their category), so the stored figure is it.
 */
export function payableAmountPaise(
  app: Pick<ConferenceApplication, "paymentAmountPaise">,
): number {
  return app.paymentAmountPaise;
}

function initials(name: string): string {
  const words = name
    .normalize("NFKD")
    .replace(/[^A-Za-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const first = words.at(0) ?? "";
  const last = words.length > 1 ? (words.at(-1) ?? "") : first.slice(1);
  return `${first.charAt(0) || "X"}${last.charAt(0) || "X"}`.toUpperCase();
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "P2002"
  );
}

/**
 * The registration ID the gateway knows this applicant by, e.g. AB_inv27_483920.
 * Minted once and never changed, because settlement reports quote it.
 */
export async function ensurePayerId(
  app: Pick<ConferenceApplication, "id" | "name" | "payerId">,
  editionYear: number,
): Promise<string> {
  if (app.payerId) return app.payerId;
  const tag = `inv${String(editionYear).slice(-2)}`;
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = `${initials(app.name)}_${tag}_${randomInt(100_000, 1_000_000)}`;
    try {
      const set = await prisma.conferenceApplication.updateMany({
        where: { id: app.id, payerId: null },
        data: { payerId: candidate },
      });
      if (set.count === 1) return candidate;
      const current = await prisma.conferenceApplication.findUniqueOrThrow({
        where: { id: app.id },
        select: { payerId: true },
      });
      if (current.payerId) return current.payerId;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
    }
  }
  throw new Error("Could not allocate a registration ID");
}

/**
 * Email the proforma invoice: what is owed, by whom, and the personal link to
 * pay it. Sent when an attendee registers, and when organisers shortlist a
 * presenter. Never throws; the result says whether SES accepted it.
 */
export async function sendProformaInvoice(
  applicationId: string,
  opts?: { message?: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const app = await prisma.conferenceApplication.findUniqueOrThrow({
      where: { id: applicationId },
      include: { edition: { select: { year: true } } },
    });
    const payerId = await ensurePayerId(app, app.edition.year);
    const result = await sendProformaInvoiceEmail({
      to: app.email,
      name: app.name,
      payerId,
      category: professionalLabel(app.professionalCategory, app.professionalOther),
      participation: participationLabel(app.participationCategory, app.participationOther),
      amountLabel: formatInrFromPaise(payableAmountPaise(app)),
      payUrl: conferencePaymentUrl(app.paymentToken),
      message: opts?.message,
      userId: app.userId,
      applicationId: app.id,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  } catch (err) {
    console.error("[conference] proforma", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export type ProformaStats = { count: number; lastSentAt: Date | null };

/**
 * How many times each registration's proforma invoice went out, and when it
 * last did. Read from the email log, which records every successful send
 * (automatic or resent by an organiser) once; failed sends are not counted.
 */
export async function proformaSendStats(
  applicationIds: string[],
): Promise<Map<string, ProformaStats>> {
  if (applicationIds.length === 0) return new Map();
  const rows = await prisma.auditLog.groupBy({
    by: ["entityId"],
    where: {
      action: PROFORMA_EMAIL_ACTION,
      entityType: "ConferenceApplication",
      entityId: { in: applicationIds },
    },
    _count: { _all: true },
    _max: { createdAt: true },
  });
  return new Map(
    rows.map((r) => [r.entityId ?? "", { count: r._count._all, lastSentAt: r._max.createdAt }]),
  );
}

const FEE_STATUSES: ApplicationStatus[] = ["SHORTLISTED_PAPER", "SHORTLISTED_POSTER", "ATTENDEE"];

/** A bulk resend skips anyone sent a proforma this recently, so a double click or a retry mails nobody twice. */
export const PROFORMA_RESEND_GAP_MS = 60 * 60 * 1000;

/**
 * Registrations in an edition whose fee is due (`due`), and the ones a bulk
 * resend would email now (`queue`, oldest registration first): everyone due
 * except those sent a proforma within PROFORMA_RESEND_GAP_MS.
 */
export async function proformaResendQueue(
  editionId: string,
): Promise<{ due: number; queue: string[] }> {
  const due = await prisma.conferenceApplication.findMany({
    where: { editionId, status: { in: FEE_STATUSES }, paymentStatus: "UNPAID" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  const stats = await proformaSendStats(due.map((a) => a.id));
  const cutoff = Date.now() - PROFORMA_RESEND_GAP_MS;
  const queue = due
    .filter((a) => {
      const last = stats.get(a.id)?.lastSentAt;
      return !last || last.getTime() < cutoff;
    })
    .map((a) => a.id);
  return { due: due.length, queue };
}

/**
 * Send the proforma invoice to each registration, three at a time. Stops
 * starting new sends after `budgetMs` so the admin request returns before the
 * proxy in front of the site gives up; what is left is reported as remaining.
 */
export async function resendProformaInvoices(
  applicationIds: string[],
  budgetMs = 70_000,
): Promise<{ sent: number; failed: number; remaining: number }> {
  const started = Date.now();
  let next = 0;
  let sent = 0;
  let failed = 0;
  async function worker() {
    while (next < applicationIds.length && Date.now() - started < budgetMs) {
      const id = applicationIds[next++]!;
      const result = await sendProformaInvoice(id);
      if (result.ok) sent++;
      else failed++;
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, applicationIds.length) }, worker));
  return { sent, failed, remaining: applicationIds.length - next };
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * VALID only when the request carries our app id, names a registration whose
 * fee is due right now, and asks for exactly that registration's amount. The
 * request id is fresh per page load and not stored, so it is echoed back as is.
 */
export async function validatePaymentRequest(
  req: ValidationRequest,
): Promise<"VALID" | "INVALID"> {
  const cfg = onlinePayConfig();
  let reason: string | null = null;
  if (!cfg) reason = "gateway not configured";
  else if (!req.appId || !req.requestId || !req.userId || !req.amount)
    reason = "missing field";
  else if (req.appId !== cfg.appId) reason = "app id mismatch";

  if (!reason) {
    const app = await prisma.conferenceApplication.findUnique({
      where: { payerId: req.userId },
    });
    if (!app) reason = "unknown registration";
    else if (!applicationFeeDue(app)) reason = `fee not due (${app.status}/${app.paymentStatus})`;
    else if (!amountEqualsPaise(req.amount, payableAmountPaise(app)))
      reason = `amount mismatch, expected ${payableAmountPaise(app) / 100}`;
  }

  const status = reason ? "INVALID" : "VALID";
  console.info(
    `[onlinepay] validate ${status} appId=[${req.appId}] reqId=[${req.requestId}] userId=[${req.userId}] amount=[${req.amount}]${reason ? ` reason=${reason}` : ""}`,
  );
  return status;
}

// ─── Notices ─────────────────────────────────────────────────────────────────

export type NoticeOutcome =
  | { ok: false }
  | {
      ok: true;
      requestType: "I" | "R" | "D";
      transId: string;
      /** Immediate status as reported by the gateway (S / F), "" for R and D. */
      status: string;
      verified: boolean;
      paymentToken: string | null;
    };

function isVerified(p: Pick<GatewayPayment, "imtStatus" | "imtAck" | "reconStatus" | "reconAck">) {
  return (
    (p.imtStatus === "S" && ackConfirmed(p.imtAck)) ||
    (p.reconStatus === "RECONCILED" && ackConfirmed(p.reconAck))
  );
}

async function findApplicationForNotice(payerId: string, reqId: string) {
  const byPayer = await prisma.conferenceApplication.findUnique({
    where: { payerId },
  });
  if (byPayer) return byPayer;
  // A request started under the pre-October flow can still settle afterwards.
  return reqId
    ? prisma.conferenceApplication.findUnique({ where: { opReqId: reqId } })
    : null;
}

/**
 * Record one gateway notice. The ACK goes out first (the gateway retries until
 * it gets one), then the row for this transId is created or merged under a lock.
 */
export async function recordGatewayNotice(sMsg: string): Promise<NoticeOutcome> {
  const n = parseNotice(sMsg);
  const type = n.requestType;
  if (!n.transId || !n.userId || !isNoticeType(type)) {
    console.warn(`[onlinepay] malformed notice: ${sMsg.slice(0, 500)}`);
    return { ok: false };
  }

  const ack = await acknowledgeNotice(n.transId, type);
  const application = await findApplicationForNotice(n.userId, n.reqId);

  if (type === "D") {
    // Acknowledge and keep for the record; a D notice never changes paid state.
    await prisma.gatewayPayment.updateMany({
      where: { transId: n.transId },
      data: { dAck: ack, dRaw: sMsg },
    });
    console.info(`[onlinepay] D ${n.transId} user=${n.userId} amount=${n.totalAmt}`);
    return {
      ok: true,
      requestType: type,
      transId: n.transId,
      status: "",
      verified: false,
      paymentToken: application?.paymentToken ?? null,
    };
  }

  const row = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      INSERT INTO "GatewayPayment" ("transId", "payerId", "amount", "updatedAt")
      VALUES (${n.transId}, ${n.userId}, ${n.totalAmt}, NOW())
      ON CONFLICT ("transId") DO NOTHING`;
    await tx.$queryRaw`SELECT 1 FROM "GatewayPayment" WHERE "transId" = ${n.transId} FOR UPDATE`;
    const existing = await tx.gatewayPayment.findUniqueOrThrow({
      where: { transId: n.transId },
    });
    const changes = mergeNotice(existing, n, type, ack, sMsg);
    return tx.gatewayPayment.update({
      where: { transId: n.transId },
      data: {
        ...changes,
        applicationId: existing.applicationId ?? application?.id ?? null,
        reqId: existing.reqId ?? (n.reqId || null),
        refNo: existing.refNo ?? (n.refNo || null),
        provId: existing.provId ?? (n.provId || null),
        verified: isVerified({ ...existing, ...changes }),
      },
    });
  });

  console.info(
    `[onlinepay] ${type} ${n.transId} user=${n.userId} status=${n.status || "-"} amount=${n.totalAmt} verified=${row.verified}`,
  );
  if (n.status === "S" && type === "I" && !row.verified) {
    console.warn(`[onlinepay] not treated as paid: ACK did not confirm ${n.transId} (${ack})`);
  }
  if (row.verified) await applyVerifiedPayment(row.transId);

  return {
    ok: true,
    requestType: type,
    transId: n.transId,
    status: n.status,
    verified: row.verified,
    paymentToken: application?.paymentToken ?? null,
  };
}

/** The columns one notice changes. Never downgrades a recorded success. */
function mergeNotice(
  existing: GatewayPayment,
  n: GatewayNotice,
  type: "I" | "R",
  ack: string,
  sMsg: string,
): Partial<GatewayPayment> {
  if (type === "I") {
    const settledSuccess = existing.imtStatus === "S" && ackConfirmed(existing.imtAck);
    if (settledSuccess) return {};
    // An unconfirmed success may be upgraded by a repeat success, never replaced by a failure.
    if (existing.imtStatus === "S" && n.status !== "S") return {};
    return {
      imtStatus: n.status || null,
      imtDate: n.transDate || null,
      imtTime: n.transTime || null,
      imtAck: ack,
      imtRaw: sMsg,
    };
  }
  const settledRecon = existing.reconStatus === "RECONCILED" && ackConfirmed(existing.reconAck);
  return {
    // A transaction seen only through reconciliation is recorded as such.
    imtStatus: existing.imtStatus ?? "DIRECT_RECON",
    reconStatus: "RECONCILED",
    reconStamp: [n.reconDate, n.reconTime].filter(Boolean).join(" ") || null,
    reconAck: settledRecon ? existing.reconAck : ack,
    reconRaw: sMsg,
  };
}

/**
 * A verified payment: mark the registration PAID (unless an organiser already
 * settled it), issue the ticket, and email the receipt once per transaction.
 * Safe to call repeatedly.
 */
async function applyVerifiedPayment(transId: string): Promise<void> {
  const payment = await prisma.gatewayPayment.findUnique({ where: { transId } });
  if (!payment?.verified || !payment.applicationId) {
    if (payment?.verified) {
      console.warn(`[onlinepay] verified ${transId} matches no registration (payer ${payment.payerId})`);
    }
    return;
  }
  const applicationId = payment.applicationId;

  const marked = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "ColloquiumApplication" WHERE id = ${applicationId} FOR UPDATE`;
    const app = await tx.conferenceApplication.findUniqueOrThrow({
      where: { id: applicationId },
    });
    if (app.paymentStatus === "PAID" || app.paymentStatus === "WAIVED") return null;
    const paid = rupeesToPaise(payment.amount);
    if (paid === null || paid < payableAmountPaise(app)) {
      console.warn(
        `[onlinepay] ${transId} paid ${payment.amount}, less than ${payableAmountPaise(app) / 100} due; not marking ${app.id} paid`,
      );
      return null;
    }
    const after = await tx.conferenceApplication.update({
      where: { id: applicationId },
      data: { paymentStatus: "PAID", paymentRef: transId, paidAt: new Date() },
    });
    return { before: app, after };
  });

  if (marked) {
    await writeAuditLog({
      action: "payment.gateway.paid",
      entityType: "ConferenceApplication",
      entityId: applicationId,
      before: { paymentStatus: marked.before.paymentStatus },
      after: { paymentStatus: "PAID", transId, amount: payment.amount },
    });
    // The receipt below carries the ticket, so the payer gets one email.
    await issueEventTicketForApplication(applicationId, { notify: true, email: false });
  }

  await mailReceiptOnce(transId);
}

async function mailReceiptOnce(transId: string): Promise<void> {
  // Claim first so a concurrent I and R notice cannot both send it.
  const claimed = await prisma.gatewayPayment.updateMany({
    where: { transId, verified: true, receiptMailedAt: null },
    data: { receiptMailedAt: new Date() },
  });
  if (claimed.count !== 1) return;

  const payment = await prisma.gatewayPayment.findUniqueOrThrow({
    where: { transId },
    include: { application: true },
  });
  const app = payment.application;
  if (!app) return;
  const paise = rupeesToPaise(payment.amount);
  const receipt = {
    payerId: payment.payerId,
    amountLabel: paise === null ? `₹${payment.amount}` : formatInrFromPaise(paise),
    transId,
    bankRef: payment.refNo ?? "",
    paidOn:
      [payment.imtDate, payment.imtTime].filter(Boolean).join(" ") ||
      payment.reconStamp ||
      "",
    payUrl: conferencePaymentUrl(app.paymentToken),
  };

  // One email: the ticket with the receipt in it. Without a ticket (no account
  // linked to the registration) the receipt goes on its own.
  const ticket = app.userId
    ? await prisma.registration.findUnique({
        where: { userId_editionId: { userId: app.userId, editionId: app.editionId } },
        include: { edition: { select: { name: true, startsAt: true } } },
      })
    : null;
  const result = ticket
    ? await sendRegistrationConfirmed({
        to: app.email,
        name: app.name,
        editionName: ticket.edition.name,
        ticketCode: ticket.ticketCode,
        eventDate: ticket.edition.startsAt.toISOString().slice(0, 10),
        userId: app.userId,
        registrationId: ticket.id,
        payment: receipt,
      })
    : await sendPaymentReceipt({ to: app.email, name: app.name, ...receipt, userId: app.userId });
  if (!result.ok) {
    // Release the claim so the next notice or an admin re-check retries it.
    await prisma.gatewayPayment.update({
      where: { transId },
      data: { receiptMailedAt: null },
    });
  }
}

// ─── Admin ───────────────────────────────────────────────────────────────────

/**
 * Re-send the ACK for a recorded transaction whose acknowledgement did not
 * confirm it (a timeout, say). If the gateway now confirms it, it is settled
 * exactly as if the callback had succeeded.
 */
export async function reacknowledgePayment(
  transId: string,
): Promise<{ verified: boolean; acks: string[] }> {
  const existing = await prisma.gatewayPayment.findUnique({ where: { transId } });
  if (!existing) throw new Error("Unknown transaction");

  const acks: string[] = [];
  const data: Partial<GatewayPayment> = {};
  if (existing.imtStatus === "S" && !ackConfirmed(existing.imtAck)) {
    data.imtAck = await acknowledgeNotice(transId, "I");
    acks.push(data.imtAck);
  }
  if (existing.reconStatus === "RECONCILED" && !ackConfirmed(existing.reconAck)) {
    data.reconAck = await acknowledgeNotice(transId, "R");
    acks.push(data.reconAck);
  }
  const verified = isVerified({ ...existing, ...data });
  await prisma.gatewayPayment.update({
    where: { transId },
    data: { ...data, verified: existing.verified || verified },
  });
  if (existing.verified || verified) await applyVerifiedPayment(transId);
  return { verified: existing.verified || verified, acks };
}

/** Gateway outcome labels shared by the pay page and the admin desk. */
export function gatewayStatusLabel(p: GatewayPayment): string {
  if (p.verified) return p.reconStatus === "RECONCILED" ? "Paid and reconciled" : "Paid";
  if (p.imtStatus === "S") return "Success reported, not confirmed";
  if (p.imtStatus === "DIRECT_RECON") return "Reconciled, not confirmed";
  if (p.imtStatus === "F") return "Failed";
  return p.imtStatus || "Recorded";
}
