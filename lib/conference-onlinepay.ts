import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { siteOrigin } from "@/lib/ticket";
import { statusRequiresPayment } from "@/lib/conference";
import { issueEventTicketForApplication } from "@/lib/conference-access";
import {
  acknowledgeOnlinePay,
  firstField,
  onlinePayAckUrl,
  inferOnlinePayRequestType,
  isOnlinePayConfigured,
  onlinePayConfig,
  paymentRequestUrl,
  type ValidationInput,
} from "@/lib/onlinepay";
import { isPayUReady } from "@/lib/conference-payu";

export function isConferenceOnlinePayReady(): boolean {
  return isOnlinePayConfigured();
}

export function isConferenceGatewayReady(): boolean {
  return isOnlinePayConfigured() || isPayUReady();
}

export function rupeesFromPaise(paise: number): number {
  return paise / 100;
}

export function amountsMatchPaise(storedPaise: number, incoming: string): boolean {
  const a = storedPaise / 100;
  const b = Number(incoming);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) < 0.005;
}

export function newOpReqId(): string {
  return `INV${Date.now().toString(36)}${randomBytes(3).toString("hex")}`.slice(
    0,
    24,
  );
}

export function opPayerUserId(
  application: { id: string; email: string },
  override?: string | null,
): string {
  const fromForm = (override || "").trim();
  if (fromForm) return fromForm;
  const forced = (process.env.ONLINEPAY_PAYER_USER_ID || "").trim();
  if (forced) return forced;
  return application.id;
}

export async function startConferenceOnlinePay(
  application: {
    id: string;
    name: string;
    email: string;
    paymentToken: string;
    paymentAmountPaise: number;
    opReqId?: string | null;
    opUserId?: string | null;
  },
  opts?: { payerUserId?: string | null },
): Promise<{ url: string; test: boolean; userId: string }> {
  const cfg = onlinePayConfig();
  if (!cfg) throw new Error("ONLINEPAY_APP_ID is not set");

  const userId = opPayerUserId(application, opts?.payerUserId);
  const reqId = application.opReqId || newOpReqId();
  if (application.opReqId !== reqId || application.opUserId !== userId) {
    await prisma.conferenceApplication.update({
      where: { id: application.id },
      data: { opReqId: reqId, opUserId: userId },
    });
  }

  return {
    url: paymentRequestUrl({
      appId: cfg.appId,
      userId,
      userName: application.name.slice(0, 80),
      amountDue: rupeesFromPaise(application.paymentAmountPaise),
      purpose: cfg.purpose,
      reqId,
    }),
    test: cfg.env === "test",
    userId,
  };
}

export async function validateOnlinePayRequest(
  input: ValidationInput,
): Promise<"VALID" | "INVALID"> {
  const cfg = onlinePayConfig();
  if (!cfg || input.appId !== cfg.appId) {
    console.warn("[onlinepay] validate INVALID appId", input.appId);
    return "INVALID";
  }

  const application = await prisma.conferenceApplication.findUnique({
    where: { opReqId: input.requestId },
  });
  if (!application) {
    console.warn("[onlinepay] validate INVALID unknown reqId", input.requestId);
    return "INVALID";
  }
  if (application.paymentStatus === "PAID" || application.paymentStatus === "WAIVED") {
    console.warn("[onlinepay] validate INVALID already settled", input.requestId);
    return "INVALID";
  }
  if (
    application.paymentStatus !== "UNPAID" &&
    application.paymentStatus !== "REPORTED"
  ) {
    return "INVALID";
  }
  if (!statusRequiresPayment(application.status)) {
    return "INVALID";
  }
  if (
    application.opUserId &&
    application.opUserId.toLowerCase() !== input.userId.toLowerCase()
  ) {
    console.warn("[onlinepay] validate INVALID userId", {
      expected: application.opUserId,
      got: input.userId,
    });
    return "INVALID";
  }
  if (!amountsMatchPaise(application.paymentAmountPaise, input.amount)) {
    console.warn("[onlinepay] validate INVALID amount", {
      expectedPaise: application.paymentAmountPaise,
      got: input.amount,
    });
    return "INVALID";
  }
  return "VALID";
}

export type OpCallbackResult = {
  requestType: string | null;
  paymentToken: string | null;
  transId: string | null;
  ackUrl: string | null;
  ackOk: boolean;
  outcome: "success" | "failed" | "ok";
};

async function recordOnlinePayNotice(
  applicationId: string,
  transId: string,
  requestType: "I" | "R" | "D",
): Promise<void> {
  await prisma.onlinePayAck.upsert({
    where: { transId_requestType: { transId, requestType } },
    create: { applicationId, transId, requestType },
    update: {},
  });
}

async function ackNotice(
  transId: string,
  requestType: "I" | "R" | "D",
): Promise<boolean> {
  const ack = await acknowledgeOnlinePay({ transId, requestType });
  if (!ack.ok) {
    console.error(`[onlinepay] ACK ${requestType} failed`, ack.error, transId);
    await prisma.onlinePayAck.update({
      where: { transId_requestType: { transId, requestType } },
      data: { ackedAt: null },
    });
    return false;
  }
  await prisma.onlinePayAck.update({
    where: { transId_requestType: { transId, requestType } },
    data: { ackedAt: new Date() },
  });
  return true;
}

export async function completeOnlinePayAck(
  transId: string,
  requestType: string,
): Promise<boolean> {
  const type = requestType.trim().toUpperCase().charAt(0);
  if (!transId || (type !== "I" && type !== "R" && type !== "D")) return false;
  const row = await prisma.onlinePayAck.findUnique({
    where: { transId_requestType: { transId, requestType: type } },
  });
  if (!row) return false;
  if (!row.ackedAt) {
    await prisma.onlinePayAck.update({
      where: { id: row.id },
      data: { ackedAt: new Date() },
    });
  }
  return true;
}

export async function listPendingOnlinePayAcks(): Promise<
  { name: string; transId: string; requestType: string; ackUrl: string }[]
> {
  const rows = await prisma.onlinePayAck.findMany({
    where: { ackedAt: null },
    orderBy: { createdAt: "asc" },
    take: 40,
    include: { application: { select: { name: true } } },
  });
  const items: {
    name: string;
    transId: string;
    requestType: string;
    ackUrl: string;
  }[] = [];
  for (const row of rows) {
    const type = row.requestType;
    if (type !== "I" && type !== "R" && type !== "D") continue;
    const ackUrl = onlinePayAckUrl(row.transId, type);
    if (!ackUrl) continue;
    items.push({
      name: row.application.name,
      transId: row.transId,
      requestType: type,
      ackUrl,
    });
  }
  return items;
}

async function findApplicationForNotice(reqId: string, transId: string) {
  if (reqId) {
    const byReq = await prisma.conferenceApplication.findUnique({
      where: { opReqId: reqId },
    });
    if (byReq) return byReq;
  }
  if (!transId) return null;
  const byTrans = await prisma.conferenceApplication.findFirst({
    where: { opTransId: transId },
    orderBy: { updatedAt: "desc" },
  });
  if (byTrans) return byTrans;
  const notice = await prisma.onlinePayAck.findFirst({
    where: { transId },
    orderBy: { createdAt: "desc" },
    include: { application: true },
  });
  return notice?.application ?? null;
}

async function finishAck(
  applicationId: string,
  transId: string,
  requestType: "I" | "R" | "D",
): Promise<{ transId: string | null; ackUrl: string | null; ackOk: boolean }> {
  if (!transId) return { transId: null, ackUrl: null, ackOk: false };
  await recordOnlinePayNotice(applicationId, transId, requestType);
  const ackOk = await ackNotice(transId, requestType);
  return { transId, ackUrl: onlinePayAckUrl(transId, requestType), ackOk };
}

export async function applyConferenceOnlinePayCallback(
  params: Record<string, string>,
): Promise<OpCallbackResult> {
  const requestType = inferOnlinePayRequestType(params);
  const reqId = firstField(params, ["reqId", "sReqId", "input_RequestID"]);
  const transId = firstField(params, ["transId"]);
  const refNo = firstField(params, ["refNo"]);
  const provId = firstField(params, ["provId"]);
  const modeOfPayment = firstField(params, ["modeOfPayment"]);
  const statusFlag = firstField(params, ["status", "sStatus"]).toUpperCase();
  const psp = [provId, modeOfPayment].filter(Boolean).join(" / ");

  console.info("[onlinepay] callback", {
    requestType,
    reqId,
    transId,
    status: statusFlag || null,
    modeOfPayment: modeOfPayment || null,
    reconDate: firstField(params, ["reconDate"]) || null,
  });

  const application = await findApplicationForNotice(reqId, transId);

  if (!application || !requestType) {
    return {
      requestType: requestType,
      paymentToken: application?.paymentToken ?? null,
      transId: null,
      ackUrl: null,
      ackOk: false,
      outcome: "failed",
    };
  }

  if (requestType === "I") {
    const success = statusFlag === "S";
    if (success && application.paymentStatus !== "WAIVED") {
      await prisma.conferenceApplication.update({
        where: { id: application.id },
        data: {
          paymentStatus: "PAID",
          paymentRef: transId || refNo || application.paymentRef,
          paidAt: application.paidAt ?? new Date(),
          opTransId: transId || application.opTransId,
          opRefNo: refNo || application.opRefNo,
          opProvId: psp || application.opProvId,
        },
      });
      await issueEventTicketForApplication(application.id, { notify: true });
    } else if (transId || refNo || provId) {
      await prisma.conferenceApplication.update({
        where: { id: application.id },
        data: {
          opTransId: transId || application.opTransId,
          opRefNo: refNo || application.opRefNo,
          opProvId: psp || application.opProvId,
        },
      });
    }
    const ack = await finishAck(application.id, transId, "I");
    return {
      requestType: "I",
      paymentToken: application.paymentToken,
      outcome: success ? "success" : "failed",
      ...ack,
    };
  }

  if (requestType === "R") {
    await prisma.conferenceApplication.update({
      where: { id: application.id },
      data: {
        paymentStatus:
          application.paymentStatus === "WAIVED" ? "WAIVED" : "PAID",
        paymentRef: transId || refNo || application.paymentRef,
        paidAt: application.paidAt ?? new Date(),
        opTransId: transId || application.opTransId,
        opRefNo: refNo || application.opRefNo,
        opProvId: psp || application.opProvId,
      },
    });
    if (application.paymentStatus !== "WAIVED") {
      await issueEventTicketForApplication(application.id, { notify: true });
    }
    const ack = await finishAck(application.id, transId, "R");
    return {
      requestType: "R",
      paymentToken: application.paymentToken,
      outcome: "ok",
      ...ack,
    };
  }

  // Refund / chargeback — keep the original paid row, record OP ids.
  await prisma.conferenceApplication.update({
    where: { id: application.id },
    data: {
      opTransId: transId || application.opTransId,
      opRefNo: refNo || application.opRefNo,
      opProvId: psp || application.opProvId,
      adminNotes: [
        application.adminNotes,
        `OP refund/chargeback transId=${transId} amt=${firstField(params, ["totalAmt"])} mode=${modeOfPayment}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  });
  const ack = await finishAck(application.id, transId, "D");
  return {
    requestType: "D",
    paymentToken: application.paymentToken,
    outcome: "ok",
    ...ack,
  };
}

export function conferencePayReturnUrl(token: string, outcome: string): string {
  return `${siteOrigin()}/conference/pay/${encodeURIComponent(token)}?payu=${encodeURIComponent(outcome)}`;
}
