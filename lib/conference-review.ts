import type {
  ApplicationPaymentStatus,
  ApplicationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  applicationStatusLabel,
  conferenceFeePaiseFor,
  formatInrFromPaise,
  statusRequiresPayment,
} from "@/lib/conference";
import {
  conferencePayPath,
  conferencePaymentUrl,
  newConferenceToken,
} from "@/lib/conference-server";
import { notifyApplicationStatus } from "@/lib/conference-access";
import { sendConferenceStatusUpdate } from "@/lib/email/transactions";
import { writeAuditLog } from "@/lib/admin/audit";
import { siteOrigin } from "@/lib/ticket";

export async function reviewConferenceApplication(opts: {
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
  const before = await prisma.conferenceApplication.findUnique({
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

  const after = await prisma.conferenceApplication.update({
    where: { id: opts.id },
    data: {
      status: opts.status,
      ...(opts.adminNotes !== undefined ? { adminNotes: opts.adminNotes } : {}),
      paymentStatus: nextPayment,
      paymentAmountPaise: selected
        ? keepPaid
          ? before.paymentAmountPaise
          : conferenceFeePaiseFor(before.professionalCategory)
        : before.paymentAmountPaise,
      paymentToken: before.paymentToken || newConferenceToken(),
    },
  });

  await writeAuditLog({
    actorId: opts.actorId,
    action: "conference.status",
    entityType: "ConferenceApplication",
    entityId: opts.id,
    before,
    after,
  });

  const paymentDue = selected && nextPayment === "UNPAID";
  const paymentUrl = paymentDue
    ? conferencePaymentUrl(after.paymentToken)
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
      ? conferencePayPath(after.paymentToken, true)
      : "/dashboard",
  });

  if (!opts.sendEmail) {
    return { emailSent: false, paymentUrl };
  }

  const mail = await sendConferenceStatusUpdate({
    to: after.email,
    name: after.name,
    statusLabel,
    message,
    includePayment: paymentDue,
    amountLabel,
    paymentUrl: paymentUrl ?? "",
    dashboardUrl: `${siteOrigin()}/dashboard`,
    eventName: "Inv.ent 2027 · Research Conference",
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
  const before = await prisma.conferenceApplication.findUnique({
    where: { id: opts.id },
  });
  if (!before) throw new Error("Application not found");

  const paidNow =
    opts.paymentStatus === "PAID" || opts.paymentStatus === "WAIVED";
  const after = await prisma.conferenceApplication.update({
    where: { id: opts.id },
    data: {
      paymentStatus: opts.paymentStatus,
      paymentRef: opts.paymentRef?.trim() || before.paymentRef,
      paidAt: paidNow ? (before.paidAt ?? new Date()) : null,
    },
  });

  await writeAuditLog({
    actorId: opts.actorId,
    action: "conference.payment",
    entityType: "ConferenceApplication",
    entityId: opts.id,
    before,
    after,
  });
}
