import { ensurePaymentReceipt } from "@/lib/payment-management";
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
  inferOnlinePayRequestType,
  firstField,
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

export function amountsMatchPaise(
  storedPaise: number,
  incoming: string,
): boolean {
  const a = storedPaise / 100;
  const b = Number(incoming);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  if (!/^[0-9]+(?:\.[0-9]{1,2})?$/.test(incoming.trim())) return false;
  return Math.round(b * 100) === storedPaise;
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
  const attempt = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "ColloquiumApplication" WHERE id = ${application.id} FOR UPDATE`;
    const current = await tx.conferenceApplication.findUniqueOrThrow({
      where: { id: application.id },
    });
    if (
      current.paymentStatus !== "UNPAID" ||
      !statusRequiresPayment(current.status)
    )
      throw new Error("PAYMENT_NOT_DUE");
    const existing = await tx.paymentAttempt.findFirst({
      where: {
        applicationId: current.id,
        status: { in: ["INITIATED", "VALID", "PENDING"] },
      },
      orderBy: { createdAt: "desc" },
    });
    if (existing) {
      if (
        existing.userId !== userId ||
        existing.amountPaise !== current.paymentAmountPaise ||
        existing.appId !== cfg.appId
      )
        throw new Error("PAYMENT_PENDING");
      return existing;
    }
    if (
      current.opReqId &&
      current.opUserId &&
      current.opUserId !== userId &&
      !current.opTransId
    )
      throw new Error("PAYMENT_PENDING");
    const row = await tx.paymentAttempt.create({
      data: {
        applicationId: current.id,
        requestId:
          current.opReqId && !current.opTransId
            ? current.opReqId
            : newOpReqId(),
        userId,
        appId: cfg.appId,
        amountPaise: current.paymentAmountPaise,
        environment: cfg.env,
      },
    });
    await tx.conferenceApplication.update({
      where: { id: current.id },
      data: { opReqId: row.requestId, opUserId: userId },
    });
    return row;
  });
  const reqId = attempt.requestId;

  return {
    url: paymentRequestUrl({
      appId: cfg.appId,
      userId,
      userName: application.name.slice(0, 80),
      amountDue: rupeesFromPaise(attempt.amountPaise),
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

  const attempt = await prisma.paymentAttempt.findUnique({
    where: { requestId: input.requestId },
    include: { application: true },
  });
  const application =
    attempt?.application ??
    (await prisma.conferenceApplication.findUnique({
      where: { opReqId: input.requestId },
    }));
  const reason =
    !cfg || input.appId !== cfg.appId
      ? "App ID mismatch"
      : !application
        ? "Unknown request"
        : !["UNPAID", "REPORTED"].includes(application.paymentStatus)
          ? "Payment is not unpaid"
          : !statusRequiresPayment(application.status)
            ? "Application is not selected"
            : (attempt?.userId ?? application.opUserId) !== input.userId
              ? "Payer ID mismatch"
              : !amountsMatchPaise(
                    attempt?.amountPaise ?? application.paymentAmountPaise,
                    input.amount,
                  )
                ? "Amount mismatch"
                : attempt &&
                    !["INITIATED", "VALID", "PENDING"].includes(attempt.status)
                  ? "Attempt is closed"
                  : null;
  const status = reason ? "INVALID" : "VALID";
  await prisma.paymentEvent.create({
    data: {
      applicationId: application?.id,
      attemptId: attempt?.id,
      kind: "VALIDATION",
      outcome: status,
      requestId: input.requestId,
      amount: input.amount,
      reason,
      payload: input,
    },
  });
  if (attempt && status === "VALID")
    await prisma.paymentAttempt.update({
      where: { id: attempt.id },
      data: { status: "VALID" },
    });
  return status;
}

export type OpCallbackResult = {
  requestType: string | null;
  paymentToken: string | null;
  transId: string | null;
  ackUrl: string | null;
  ackOk: boolean;
  outcome: "success" | "failed" | "ok";
};

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
  return ackNotice(transId, type);
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
  const requestType = inferOnlinePayRequestType(params) ?? "";
  params.appId = firstField(params, ["appId", "sAppId", "APPID"]);
  params.userId = firstField(params, ["userId", "sUserId"]);
  params.reqId = firstField(params, ["reqId", "sReqId", "requestId"]);
  params.totalAmt = firstField(params, ["totalAmt", "sAmountDue", "amount"]);
  params.status = firstField(params, ["status", "sStatus"]).toUpperCase();
  const reqId = params.reqId ?? params.sReqId ?? "";
  const transId = params.transId ?? "";
  const cfg = onlinePayConfig();
  const found = reqId
    ? await prisma.paymentAttempt.findUnique({ where: { requestId: reqId } })
    : null;
  const candidate = found
    ? await prisma.conferenceApplication.findUnique({
        where: { id: found.applicationId },
      })
    : await findApplicationForNotice(reqId, transId);
  const result = await prisma.$transaction(async (tx) => {
    if (candidate)
      await tx.$queryRaw`SELECT id FROM "ColloquiumApplication" WHERE id = ${candidate.id} FOR UPDATE`;
    const application = candidate
      ? await tx.conferenceApplication.findUnique({
          where: { id: candidate.id },
        })
      : null;
    const attempt = found
      ? await tx.paymentAttempt.findUnique({ where: { id: found.id } })
      : null;
    const amount = params.totalAmt ?? "";
    const expected =
      attempt?.amountPaise ?? application?.paymentAmountPaise ?? 0;
    const bound = transId
      ? await tx.onlinePayAck.findFirst({ where: { transId } })
      : null;
    const priorTransaction = transId
      ? await tx.paymentEvent.findFirst({
          where: {
            transId,
            kind: { in: ["I", "R", "D"] },
            outcome: { not: "REJECTED" },
          },
          select: { requestId: true },
        })
      : null;
    const reason = !application
      ? "Unknown request"
      : !["I", "R", "D"].includes(requestType)
        ? "Unknown notice type"
        : !transId || !reqId
          ? "Missing request or transaction ID"
          : !cfg || params.appId !== (attempt?.appId ?? cfg.appId)
            ? "App ID mismatch"
            : params.userId !== (attempt?.userId ?? application.opUserId)
              ? "Payer ID mismatch"
              : bound && bound.applicationId !== application.id
                ? "Transaction belongs to another registration"
                : priorTransaction?.requestId &&
                    priorTransaction.requestId !== reqId
                  ? "Transaction belongs to another payment request"
                  : requestType === "D"
                    ? !/^-[0-9]+(?:\.[0-9]{1,2})?$/.test(amount) ||
                      Math.abs(Number(amount) * 100) > expected
                      ? "Invalid refund amount"
                      : null
                    : !amountsMatchPaise(expected, amount)
                      ? "Amount mismatch"
                      : requestType === "I" &&
                          !["S", "F"].includes(params.status ?? "")
                        ? "Invalid immediate status"
                        : null;
    await tx.paymentEvent.create({
      data: {
        applicationId: application?.id,
        attemptId: attempt?.id,
        kind: requestType || "CALLBACK",
        outcome: reason
          ? "REJECTED"
          : requestType === "I"
            ? params.status === "S"
              ? "SUCCESS"
              : "FAILED"
            : requestType === "R"
              ? "SETTLED"
              : "REFUND",
        requestId: reqId,
        transId,
        amount,
        reason,
        payload: params,
      },
    });
    if (reason || !application) return null;
    if (attempt) {
      const final = ["SUCCESS", "SETTLED", "REFUND"].includes(attempt.status);
      const status =
        requestType === "D"
          ? "REFUND"
          : requestType === "R"
            ? attempt.status === "REFUND"
              ? "REFUND"
              : "SETTLED"
            : final
              ? attempt.status
              : params.status === "S"
                ? "SUCCESS"
                : "FAILED";
      await tx.paymentAttempt.update({
        where: { id: attempt.id },
        data: { status },
      });
    }
    const paid =
      requestType === "R" || (requestType === "I" && params.status === "S");
    await tx.conferenceApplication.update({
      where: { id: application.id },
      data: {
        ...(paid && application.paymentStatus !== "WAIVED"
          ? {
              paymentStatus: "PAID",
              paymentRef:
                application.paymentStatus === "PAID"
                  ? application.paymentRef || transId
                  : transId,
              paidAt: application.paidAt ?? new Date(),
            }
          : {}),
        opTransId:
          paid && application.paymentStatus !== "PAID"
            ? transId
            : application.opTransId || transId,
        opRefNo:
          paid && application.paymentStatus !== "PAID"
            ? params.refNo || null
            : application.opRefNo || params.refNo || null,
        opProvId:
          paid && application.paymentStatus !== "PAID"
            ? params.provId || params.modeOfPayment || null
            : application.opProvId ||
              params.provId ||
              params.modeOfPayment ||
              null,
      },
    });
    await tx.onlinePayAck.upsert({
      where: { transId_requestType: { transId, requestType } },
      create: { applicationId: application.id, transId, requestType },
      update: {},
    });
    return { application, paid };
  });
  if (!result) return emptyCallback(requestType || null, null);
  if (result.paid && result.application.paymentStatus !== "WAIVED") {
    await ensurePaymentReceipt(result.application.id);
    await issueEventTicketForApplication(result.application.id, {
      notify: true,
    });
  }
  const type = requestType as "I" | "R" | "D";
  const ackOk = await ackNotice(transId, type);
  return {
    requestType,
    paymentToken: result.application.paymentToken,
    transId,
    ackUrl: onlinePayAckUrl(transId, type),
    ackOk,
    outcome:
      requestType === "I"
        ? params.status === "S"
          ? "success"
          : "failed"
        : "ok",
  };
}

async function findApplicationForNotice(reqId: string, transId: string) {
  if (reqId) {
    const byReq = await prisma.conferenceApplication.findUnique({
      where: { opReqId: reqId },
    });
    if (byReq) return byReq;
  }
  if (reqId || !transId) return null;
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

export function conferencePayReturnUrl(token: string, outcome: string): string {
  return `${siteOrigin()}/conference/pay/${encodeURIComponent(token)}?payu=${encodeURIComponent(outcome)}`;
}
