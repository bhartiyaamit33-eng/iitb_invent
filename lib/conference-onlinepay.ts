import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { siteOrigin } from "@/lib/ticket";
import { statusRequiresPayment } from "@/lib/conference";
import { issueEventTicketForApplication } from "@/lib/conference-access";
import {
  acknowledgeOnlinePay,
  isOnlinePayConfigured,
  onlinePayAckUrl,
  onlinePayConfig,
  parseSMsg,
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

export async function startConferenceOnlinePay(
  application: {
    id: string;
    name: string;
    email: string;
    paymentToken: string;
    paymentAmountPaise: number;
    paymentStatus?: string | null;
    opReqId?: string | null;
    opUserId?: string | null;
    opTransId?: string | null;
  },
  opts?: { payerUserId?: string | null },
): Promise<{ url: string; test: boolean; userId: string }> {
  const cfg = onlinePayConfig();
  if (!cfg) throw new Error("ONLINEPAY_APP_ID is not set");

  const explicit = (opts?.payerUserId || "").trim();
  const forced = (process.env.ONLINEPAY_PAYER_USER_ID || "").trim();
  if (cfg.env === "test" && !explicit && !forced) {
    throw new Error("TEST_USER_ID_REQUIRED");
  }

  const userId = explicit || forced || application.id;
  const previousFailed =
    application.paymentStatus === "UNPAID" && Boolean(application.opTransId);
  const reqId =
    !previousFailed && application.opReqId ? application.opReqId : newOpReqId();
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
  if (!cfg || input.appId !== cfg.appId) return "INVALID";

  const application = await prisma.conferenceApplication.findUnique({
    where: { opReqId: input.requestId },
  });
  if (!application) return "INVALID";
  if (application.paymentStatus === "PAID" || application.paymentStatus === "WAIVED") {
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
    return "INVALID";
  }
  if (!amountsMatchPaise(application.paymentAmountPaise, input.amount)) {
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

function emptyCallback(
  requestType: string | null,
  paymentToken: string | null,
): OpCallbackResult {
  return {
    requestType,
    paymentToken,
    transId: null,
    ackUrl: null,
    ackOk: false,
    outcome: "failed",
  };
}

export async function applyConferenceOnlinePayCallback(
  rawSMsg: string,
): Promise<OpCallbackResult> {
  const params = parseSMsg(rawSMsg);
  const requestType = (params.requestType ?? "").charAt(0).toUpperCase();
  const reqId = params.reqId ?? params.sReqId ?? "";
  const transId = params.transId ?? "";

  const application = await findApplicationForNotice(reqId, transId);

  if (
    !application ||
    (requestType !== "I" && requestType !== "R" && requestType !== "D")
  ) {
    return emptyCallback(requestType || null, application?.paymentToken ?? null);
  }

  const gatewayIds = {
    opTransId: transId || application.opTransId,
    opRefNo: params.refNo || application.opRefNo,
    opProvId: params.provId || params.modeOfPayment || application.opProvId,
  };

  if (requestType === "I") {
    const statusFlag = (params.status ?? params.sStatus ?? "").toUpperCase();
    const success = statusFlag === "S";
    if (success && application.paymentStatus !== "WAIVED") {
      await prisma.conferenceApplication.update({
        where: { id: application.id },
        data: {
          paymentStatus: "PAID",
          paymentRef: transId || params.refNo || application.paymentRef,
          paidAt: application.paidAt ?? new Date(),
          ...gatewayIds,
        },
      });
      await issueEventTicketForApplication(application.id, { notify: true });
    } else if (transId || params.refNo || params.provId) {
      await prisma.conferenceApplication.update({
        where: { id: application.id },
        data: gatewayIds,
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
        paymentRef: transId || application.paymentRef,
        paidAt: application.paidAt ?? new Date(),
        ...gatewayIds,
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

  await prisma.conferenceApplication.update({
    where: { id: application.id },
    data: {
      ...gatewayIds,
      adminNotes: [
        application.adminNotes,
        `OP refund/chargeback transId=${transId} amt=${params.totalAmt ?? ""}`,
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

export function conferencePayReturnUrl(token: string, outcome: string): string {
  return `${siteOrigin()}/conference/pay/${encodeURIComponent(token)}?payu=${encodeURIComponent(outcome)}`;
}
