import { randomBytes } from "node:crypto";
import {
  PaymentStatus,
  Prisma,
  type PayerCategory,
  type Payment,
  type SubmissionKind,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { siteOrigin } from "@/lib/ticket";
import { writeAuditLog } from "@/lib/admin/audit";
import {
  amountsMatch,
  feeFor,
  KIND_LABEL,
  isPaidStatus,
} from "@/lib/payments/pricing";
import {
  acknowledgeOnlinePay,
  canMockOnlinePay,
  formatAmountDue,
  onlinePayConfig,
  parseSMsg,
  type ValidationInput,
} from "@/lib/payments/onlinepay";
import {
  buildInvoicePdf,
  invoiceFilename,
  type InvoicePayment,
} from "@/lib/payments/invoice";
import {
  sendPaymentLinkEmail,
  sendPaymentReceiptEmail,
} from "@/lib/email/transactions";

const PAID: PaymentStatus[] = ["SUCCESS", "SETTLED"];
const OPEN: PaymentStatus[] = ["PENDING", "IN_FLIGHT"];

function newReqId(year: number): string {
  return `INV${year}${randomBytes(5).toString("hex")}`;
}

function purposeFor(opts: {
  year: number;
  kind: SubmissionKind;
  title: string;
}): string {
  return `INVENT ${opts.year} ${KIND_LABEL[opts.kind]}: ${opts.title}`.slice(
    0,
    120,
  );
}

export function paymentPageUrl(payToken: string): string {
  return `${siteOrigin()}/pay/${payToken}`;
}

export function paymentReceiptUrl(payToken: string): string {
  return `${siteOrigin()}/pay/${payToken}/receipt`;
}

async function nextInvoiceNumber(
  tx: Prisma.TransactionClient,
  year: number,
): Promise<string> {
  const prefix = `INV-${year}-`;
  const last = await tx.payment.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  const next = last?.invoiceNumber
    ? Number.parseInt(last.invoiceNumber.slice(prefix.length), 10) + 1
    : 1;
  const n = Number.isFinite(next) && next > 0 ? next : 1;
  return `${prefix}${String(n).padStart(4, "0")}`;
}

const invoiceInclude = {
  user: { select: { id: true, name: true, email: true } },
  submission: {
    select: { title: true, kind: true, organisation: true, authors: true },
  },
  edition: { select: { name: true, year: true } },
} satisfies Prisma.PaymentInclude;

export async function loadInvoicePayment(
  paymentId: string,
): Promise<InvoicePayment | null> {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: invoiceInclude,
  });
}

export async function createOrReusePayment(opts: {
  submissionId: string;
  payerCategory?: PayerCategory;
  actorId?: string | null;
}): Promise<Payment> {
  const submission = await prisma.submission.findUnique({
    where: { id: opts.submissionId },
    include: {
      user: true,
      edition: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!submission || submission.deletedAt) {
    throw new Error("Submission not found");
  }
  if (submission.status !== "APPROVED") {
    throw new Error("Send a payment link only after the submission is accepted");
  }

  const paid = submission.payments.find((p) => isPaidStatus(p.status));
  if (paid) return paid;

  const open = submission.payments.find((p) => OPEN.includes(p.status));
  if (open) return open;

  const category = opts.payerCategory ?? submission.payerCategory;
  const amount = feeFor(category);
  const cfg = onlinePayConfig();
  const appId = cfg.appId || (cfg.mock ? "MOCK-APP" : "");

  const created = await prisma.payment.create({
    data: {
      submissionId: submission.id,
      userId: submission.userId,
      editionId: submission.editionId,
      reqId: newReqId(submission.edition.year),
      payToken: randomBytes(24).toString("hex"),
      appId,
      opUserId: submission.userId,
      amount,
      purpose: purposeFor({
        year: submission.edition.year,
        kind: submission.kind,
        title: submission.title,
      }),
      payerCategory: category,
      status: "PENDING",
    },
  });

  await writeAuditLog({
    actorId: opts.actorId ?? null,
    action: "payment.create",
    entityType: "Payment",
    entityId: created.id,
    after: {
      reqId: created.reqId,
      amount,
      payerCategory: category,
      submissionId: submission.id,
    },
  });

  return created;
}

export async function emailPaymentLink(
  paymentId: string,
  actorId?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: true,
      submission: true,
      edition: true,
    },
  });
  if (!payment) return { ok: false, error: "Payment not found" };
  if (isPaidStatus(payment.status)) {
    return { ok: false, error: "Already paid" };
  }

  const result = await sendPaymentLinkEmail({
    to: payment.user.email,
    name: payment.user.name,
    editionName: payment.edition.name,
    kindLabel: KIND_LABEL[payment.submission.kind],
    title: payment.submission.title,
    categoryLabel:
      payment.payerCategory === "STUDENT"
        ? "Student"
        : payment.payerCategory === "FACULTY"
          ? "Faculty"
          : "Corporate / industry",
    amountInr: payment.amount.toString(),
    purpose: payment.purpose,
    payUrl: paymentPageUrl(payment.payToken),
    userId: payment.userId,
    paymentId: payment.id,
  });

  if (result.ok) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { paymentLinkSentAt: new Date() },
    });
    await writeAuditLog({
      actorId: actorId ?? null,
      action: "payment.link_sent",
      entityType: "Payment",
      entityId: payment.id,
      after: { to: payment.user.email },
    });
  }

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function validateOnlinePayRequest(
  input: ValidationInput,
): Promise<"VALID" | "INVALID"> {
  const cfg = onlinePayConfig();
  if (cfg.appId && input.appId !== cfg.appId) return "INVALID";

  const payment = await prisma.payment.findUnique({
    where: { reqId: input.requestId },
  });
  if (!payment) return "INVALID";
  if (payment.opUserId !== input.userId) return "INVALID";
  if (!amountsMatch(payment.amount.toString(), input.amount)) return "INVALID";
  if (isPaidStatus(payment.status) || payment.status === "REFUNDED") {
    return "INVALID";
  }

  if (payment.status === "PENDING") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "IN_FLIGHT" },
    });
  }

  return "VALID";
}

export type CallbackResult = {
  paymentId: string | null;
  payToken: string | null;
  requestType: string | null;
  acknowledged: boolean;
};

export async function applyOnlinePayCallback(
  rawSMsg: string,
): Promise<CallbackResult> {
  const params = parseSMsg(rawSMsg);
  const requestType = (params.requestType ?? "").charAt(0).toUpperCase();
  const reqId = params.reqId ?? params.sReqId ?? "";
  const transId = params.transId ?? "";

  let payment = reqId
    ? await prisma.payment.findUnique({ where: { reqId } })
    : null;
  if (!payment && transId) {
    payment = await prisma.payment.findFirst({
      where: { transId },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!payment || (requestType !== "I" && requestType !== "R" && requestType !== "D")) {
    return {
      paymentId: payment?.id ?? null,
      payToken: payment?.payToken ?? null,
      requestType: requestType || null,
      acknowledged: false,
    };
  }

  if (requestType === "I") {
    await applyImmediate(payment.id, params);
  } else if (requestType === "R") {
    await applyReconciliation(payment.id, params);
  } else {
    await applyRefund(payment.id, params);
  }

  let acknowledged = true;
  if (transId) {
    const ack = await acknowledgeOnlinePay({
      transId,
      requestType: requestType as "I" | "R" | "D",
    });
    acknowledged = ack.ok;
    if (!ack.ok) {
      console.error("[onlinepay] ACK failed", ack.error, { transId, requestType });
    }
  }

  const latest = await prisma.payment.findUnique({
    where: { id: payment.id },
    select: { id: true, payToken: true },
  });

  return {
    paymentId: latest?.id ?? payment.id,
    payToken: latest?.payToken ?? payment.payToken,
    requestType,
    acknowledged,
  };
}

async function applyImmediate(
  paymentId: string,
  params: Record<string, string>,
) {
  const statusFlag = (params.status ?? "").toUpperCase();
  const success = statusFlag === "S";
  const existing = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!existing) return;

  const alreadyInvoiced = Boolean(existing.invoiceNumber);
  const skipEmail = alreadyInvoiced && isPaidStatus(existing.status);

  const year = (
    await prisma.edition.findUnique({
      where: { id: existing.editionId },
      select: { year: true },
    })
  )?.year;

  await prisma.$transaction(async (tx) => {
    let invoiceNumber = existing.invoiceNumber;
    if (success && !invoiceNumber && year) {
      invoiceNumber = await nextInvoiceNumber(tx, year);
    }
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: success ? "SUCCESS" : "FAILED",
        transId: params.transId ?? existing.transId,
        refNo: params.refNo ?? existing.refNo,
        provId: params.provId ?? existing.provId,
        pgStatus: statusFlag || existing.pgStatus,
        msg: params.msg ?? existing.msg,
        transDate: params.transDate ?? existing.transDate,
        transTime: params.transTime ?? existing.transTime,
        immediateRaw: params as Prisma.InputJsonValue,
        immediateAt: existing.immediateAt ?? new Date(),
        invoiceNumber,
      },
    });
  });

  if (success && !skipEmail) {
    await issueInvoiceEmail(paymentId);
  }
}

async function applyReconciliation(
  paymentId: string,
  params: Record<string, string>,
) {
  const existing = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!existing) return;

  const needsInvoice = !existing.invoiceNumber;
  const year = (
    await prisma.edition.findUnique({
      where: { id: existing.editionId },
      select: { year: true },
    })
  )?.year;

  await prisma.$transaction(async (tx) => {
    let invoiceNumber = existing.invoiceNumber;
    if (needsInvoice && year) {
      invoiceNumber = await nextInvoiceNumber(tx, year);
    }
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "SETTLED",
        transId: params.transId ?? existing.transId,
        refNo: params.refNo ?? existing.refNo,
        provId: params.provId ?? existing.provId,
        reconDate: params.reconDate ?? existing.reconDate,
        reconTime: params.reconTime ?? existing.reconTime,
        reconRaw: params as Prisma.InputJsonValue,
        settledAt: existing.settledAt ?? new Date(),
        invoiceNumber,
        pgStatus: existing.pgStatus ?? "S",
      },
    });
  });

  if (needsInvoice) {
    await issueInvoiceEmail(paymentId);
  }
}

async function applyRefund(
  paymentId: string,
  params: Record<string, string>,
) {
  const amount = Number(params.totalAmt ?? params.amount ?? 0);
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "REFUNDED",
      refundAmount: Number.isFinite(amount) ? Math.abs(amount) : undefined,
      refundAt: new Date(),
      refundRaw: params as Prisma.InputJsonValue,
      transId: params.transId,
    },
  });
}

export async function issueInvoiceEmail(paymentId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const payment = await loadInvoicePayment(paymentId);
  if (!payment || !payment.invoiceNumber) {
    return { ok: false, error: "Invoice not ready" };
  }

  let pdf: Buffer;
  try {
    pdf = await buildInvoicePdf(payment);
  } catch (err) {
    console.error("[invoice] pdf failed", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "pdf failed",
    };
  }

  const result = await sendPaymentReceiptEmail({
    to: payment.user.email,
    name: payment.user.name,
    editionName: payment.edition.name,
    invoiceNumber: payment.invoiceNumber,
    purpose: payment.purpose,
    amountInr: payment.amount.toString(),
    transId: payment.transId,
    refNo: payment.refNo,
    receiptUrl: paymentReceiptUrl(payment.payToken),
    userId: payment.userId,
    paymentId: payment.id,
    pdf,
    filename: invoiceFilename(payment),
  });

  if (result.ok) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { invoiceSentAt: new Date() },
    });
  }

  return result.ok ? { ok: true } : { ok: false, error: result.error };
}

export async function completeMockPayment(payToken: string): Promise<void> {
  if (!canMockOnlinePay()) {
    throw new Error("Mock payments are disabled");
  }
  const payment = await prisma.payment.findUnique({ where: { payToken } });
  if (!payment) throw new Error("Payment not found");
  if (isPaidStatus(payment.status)) return;

  const now = new Date();
  const istDate = now.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" });
  const istTime = now.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });

  await applyOnlinePayCallback(
    [
      `requestType=I`,
      `reqId=${payment.reqId}`,
      `userId=${payment.opUserId}`,
      `appId=${payment.appId}`,
      `transId=MOCK-${payment.reqId}`,
      `totalAmt=${formatAmountDue(payment.amount.toString())}`,
      `refNo=MOCKREF${payment.reqId.slice(-6)}`,
      `msg=Dev mock success`,
      `status=S`,
      `transDate=${istDate}`,
      `transTime=${istTime}`,
      `provId=PAYU`,
    ].join("&"),
  );
}

export function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}
