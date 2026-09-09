import type {
  ApplicationPaymentStatus,
  ApplicationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  applicationStatusLabel,
  formatInrFromPaise,
  statusRequiresPayment,
} from "@/lib/colloquium";
import {
  colloquiumFeePaise,
  colloquiumPayPath,
  colloquiumPaymentUrl,
  newColloquiumToken,
} from "@/lib/colloquium-server";
import { notifyApplicationStatus } from "@/lib/colloquium-access";
import { sendColloquiumStatusUpdate } from "@/lib/email/transactions";
import { writeAuditLog } from "@/lib/admin/audit";
import { siteOrigin } from "@/lib/ticket";

export async function reviewColloquiumApplication(opts: {
  actorId: string;
  id: string;
  status: ApplicationStatus;
  message: string;
  sendEmail: boolean;
  adminNotes?: string | null;
}): Promise<{
  emailSent: boolean;
  emailError?: string;
  paymentUrl?: string;
}> {
  const before = await prisma.colloquiumApplication.findUnique({
    where: { id: opts.id },
  });
  if (!before) {
    throw new Error("Application not found");
  }

  const selected = statusRequiresPayment(opts.status);
  const keepPaid =
    before.paymentStatus === "PAID" || before.paymentStatus === "WAIVED";
  let nextPayment: ApplicationPaymentStatus = before.paymentStatus;
  if (keepPaid) {
    nextPayment = before.paymentStatus;
  } else if (selected) {
    nextPayment = "UNPAID";
  } else {
    nextPayment = "NOT_REQUIRED";
  }

  const after = await prisma.colloquiumApplication.update({
    where: { id: opts.id },
    data: {
      status: opts.status,
      ...(opts.adminNotes !== undefined ? { adminNotes: opts.adminNotes } : {}),
      paymentStatus: nextPayment,
      paymentAmountPaise: selected
        ? before.paymentAmountPaise || colloquiumFeePaise()
        : before.paymentAmountPaise,
      paymentToken: before.paymentToken || newColloquiumToken(),
    },
  });

  await writeAuditLog({
    actorId: opts.actorId,
    action: "colloquium.status",
    entityType: "ColloquiumApplication",
    entityId: opts.id,
    before,
    after,
  });

  const paymentDue = selected && nextPayment === "UNPAID";
  const paymentUrl = paymentDue
    ? colloquiumPaymentUrl(after.paymentToken)
    : undefined;
  const statusLabel = applicationStatusLabel(after.status);
  const amountLabel = formatInrFromPaise(after.paymentAmountPaise);
  const message = opts.message.trim();

  // Dashboard notice always — email is best-effort and may fail (SES, keys).
  await notifyApplicationStatus({
    userId: after.userId,
    email: after.email,
    name: after.name,
    statusLabel,
    message,
    paymentDue,
    amountLabel,
    paymentPath: paymentDue
      ? colloquiumPayPath(after.paymentToken, true)
      : "/dashboard",
  });

  if (!opts.sendEmail) {
    return { emailSent: false, paymentUrl };
  }

  const mail = await sendColloquiumStatusUpdate({
    to: after.email,
    name: after.name,
    statusLabel,
    message,
    includePayment: paymentDue,
    amountLabel,
    paymentUrl: paymentUrl ?? "",
    dashboardUrl: `${siteOrigin()}/dashboard`,
    eventName: "Inv.ent 2027 · Research Colloquium",
    userId: after.userId,
    applicationId: after.id,
  });

  if (!mail.ok) {
    return {
      emailSent: false,
      emailError: mail.error,
      paymentUrl,
    };
  }
  return { emailSent: true, paymentUrl };
}

export async function setApplicationPayment(opts: {
  actorId: string;
  id: string;
  paymentStatus: ApplicationPaymentStatus;
  paymentRef?: string | null;
}): Promise<void> {
  const before = await prisma.colloquiumApplication.findUnique({
    where: { id: opts.id },
  });
  if (!before) throw new Error("Application not found");

  const paidNow =
    opts.paymentStatus === "PAID" || opts.paymentStatus === "WAIVED";
  const after = await prisma.colloquiumApplication.update({
    where: { id: opts.id },
    data: {
      paymentStatus: opts.paymentStatus,
      paymentRef: opts.paymentRef?.trim() || before.paymentRef,
      paidAt: paidNow ? (before.paidAt ?? new Date()) : null,
    },
  });

  await writeAuditLog({
    actorId: opts.actorId,
    action: "colloquium.payment",
    entityType: "ColloquiumApplication",
    entityId: opts.id,
    before,
    after,
  });
}
