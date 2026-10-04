import { prisma } from "@/lib/db";
import { randomBytes } from "node:crypto";
import { conferenceFeePaiseFor } from "@/lib/conference";

export async function ensurePaymentReceipt(applicationId: string) {
  const app = await prisma.conferenceApplication.findUniqueOrThrow({
    where: { id: applicationId },
    include: { edition: true },
  });
  if (app.paymentStatus !== "PAID") return null;
  return prisma.paymentReceipt.upsert({
    where: { applicationId },
    update: {},
    create: {
      applicationId,
      number: `INV-${app.edition.year}-${randomBytes(6).toString("hex").toUpperCase()}`,
      amountPaise: app.paymentAmountPaise,
      snapshot: {
        name: app.billingName || app.name,
        email: app.email,
        address: app.billingAddress,
        gstin: app.billingGstin,
        event: app.edition.name,
        reference: app.paymentRef,
        paidAt: app.paidAt?.toISOString(),
        discountPaise: app.discountPaise,
        documentType: "Payment receipt — not a GST tax invoice",
      },
    },
  });
}

export function discountAmount(base: number, kind: string, value: number) {
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new Error("Enter a positive discount.");
  if (kind !== "PERCENT" && kind !== "FIXED")
    throw new Error("Choose percentage or fixed discount.");
  if (kind === "PERCENT" && value > 100)
    throw new Error("Percentage cannot exceed 100.");
  const discount =
    kind === "PERCENT" ? Math.round((base * value) / 100) : value;
  if (discount >= base)
    throw new Error("Use the fee waiver action for a full waiver.");
  return discount;
}

export async function assignCoupon(
  actorId: string,
  applicationId: string,
  code: string,
) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "ColloquiumApplication" WHERE id = ${applicationId} FOR UPDATE`;
    const app = await tx.conferenceApplication.findUniqueOrThrow({
      where: { id: applicationId },
    });
    if (app.paymentStatus !== "UNPAID")
      throw new Error("Coupons can only be assigned to unpaid registrations.");
    if (
      app.opReqId ||
      (await tx.paymentAttempt.count({
        where: { applicationId, status: { not: "FAILED" } },
      }))
    )
      throw new Error(
        "A payment request already exists. Resolve it before changing the fee.",
      );
    const coupon = await tx.paymentCoupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (!coupon?.active || (coupon.expiresAt && coupon.expiresAt < new Date()))
      throw new Error("Coupon is inactive or expired.");
    const base = conferenceFeePaiseFor(app.professionalCategory);
    const discount = discountAmount(base, coupon.kind, coupon.value);
    const after = await tx.conferenceApplication.update({
      where: { id: applicationId },
      data: {
        couponId: coupon.id,
        discountPaise: discount,
        paymentAmountPaise: base - discount,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        action: "payment.coupon.assign",
        entityType: "ConferenceApplication",
        entityId: applicationId,
        before: { amount: app.paymentAmountPaise, couponId: app.couponId },
        after: { amount: after.paymentAmountPaise, couponId: coupon.id },
      },
    });
    return after;
  });
}
