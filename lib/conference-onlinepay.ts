import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { siteOrigin } from "@/lib/ticket";
import {
  acknowledgeOnlinePay,
  firstField,
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
  if (application.opUserId && application.opUserId !== input.userId) {
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
  outcome: "success" | "failed" | "ok";
};

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

  const application = reqId
    ? await prisma.conferenceApplication.findUnique({ where: { opReqId: reqId } })
    : transId
      ? await prisma.conferenceApplication.findFirst({
          where: { opTransId: transId },
          orderBy: { updatedAt: "desc" },
        })
      : null;

  if (!application || !requestType) {
    return {
      requestType: requestType,
      paymentToken: application?.paymentToken ?? null,
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
    }
    if (transId) {
      const ack = await acknowledgeOnlinePay({ transId, requestType: "I" });
      if (!ack.ok) console.error("[onlinepay] ACK I failed", ack.error, transId);
    }
    return {
      requestType: "I",
      paymentToken: application.paymentToken,
      outcome: success ? "success" : "failed",
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
    if (transId) {
      const ack = await acknowledgeOnlinePay({ transId, requestType: "R" });
      if (!ack.ok) console.error("[onlinepay] ACK R failed", ack.error, transId);
    }
    return {
      requestType: "R",
      paymentToken: application.paymentToken,
      outcome: "ok",
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
  if (transId) {
    const ack = await acknowledgeOnlinePay({ transId, requestType: "D" });
    if (!ack.ok) console.error("[onlinepay] ACK D failed", ack.error, transId);
  }
  return {
    requestType: "D",
    paymentToken: application.paymentToken,
    outcome: "ok",
  };
}

export function conferencePayReturnUrl(token: string, outcome: string): string {
  return `${siteOrigin()}/conference/pay/${encodeURIComponent(token)}?payu=${encodeURIComponent(outcome)}`;
}
