"use server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { assignCoupon, discountAmount } from "@/lib/payment-management";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function managePayment(form: FormData) {
  const actor = await getCurrentUser();
  requireAdmin(actor);
  let error = "";
  try {
    const action = String(form.get("action"));
    if (action === "coupon") {
      const code = String(form.get("code") || "")
        .trim()
        .toUpperCase();
      if (!/^[A-Z0-9_-]{3,32}$/.test(code))
        throw new Error(
          "Use 3–32 letters, numbers, underscores or hyphens for the code.",
        );
      const kind = String(form.get("kind"));
      const value =
        kind === "FIXED"
          ? Math.round(Number(form.get("value")) * 100)
          : Number(form.get("value"));
      discountAmount(2000000000, kind, value);
      const expiry = String(form.get("expiresAt") || "");
      const expiresAt = expiry ? new Date(`${expiry}T23:59:59+05:30`) : null;
      if (
        expiresAt &&
        (!Number.isFinite(expiresAt.getTime()) || expiresAt < new Date())
      )
        throw new Error("Expiry must be in the future.");
      await prisma.$transaction(async (tx) => {
        const coupon = await tx.paymentCoupon.create({
          data: { code, kind, value, expiresAt },
        });
        await tx.auditLog.create({
          data: {
            actorId: actor!.id,
            action: "payment.coupon.create",
            entityType: "PaymentCoupon",
            entityId: coupon.id,
            after: { code, kind, value },
          },
        });
      });
    } else if (action === "assign") {
      await assignCoupon(
        actor!.id,
        String(form.get("applicationId")),
        String(form.get("code")),
      );
    } else if (action === "disable") {
      await prisma.$transaction(async (tx) => {
        const id = String(form.get("couponId"));
        await tx.paymentCoupon.update({
          where: { id },
          data: { active: false },
        });
        await tx.auditLog.create({
          data: {
            actorId: actor!.id,
            action: "payment.coupon.disable",
            entityType: "PaymentCoupon",
            entityId: id,
          },
        });
      });
    } else if (action === "gst") {
      const id = String(form.get("applicationId"));
      const app = await prisma.conferenceApplication.findUniqueOrThrow({
        where: { id },
        include: { edition: true },
      });
      if (app.edition.endsAt > new Date())
        throw new Error(
          "Record the Accounts GST invoice after the program ends.",
        );
      if (app.paymentStatus !== "PAID")
        throw new Error("A payment must be confirmed first.");
      const ref = String(form.get("gstInvoiceRef") || "").trim();
      const url = String(form.get("gstInvoiceUrl") || "").trim();
      if (
        !ref ||
        ref.length > 100 ||
        (url && new URL(url).protocol !== "https:")
      )
        throw new Error(
          "Enter an invoice reference and an optional HTTPS document link.",
        );
      await prisma.$transaction(async (tx) => {
        await tx.conferenceApplication.update({
          where: { id },
          data: { gstInvoiceRef: ref, gstInvoiceUrl: url || null },
        });
        await tx.auditLog.create({
          data: {
            actorId: actor!.id,
            action: "payment.gst.record",
            entityType: "ConferenceApplication",
            entityId: id,
            after: { reference: ref, url },
          },
        });
      });
    } else throw new Error("Unknown action.");
  } catch (e) {
    error = e instanceof Error ? e.message : "Could not save.";
  }
  revalidatePath("/admin/payments");
  revalidatePath("/conference/pay");
  redirect(
    `/admin/payments?${error ? `error=${encodeURIComponent(error)}` : "saved=1"}`,
  );
}
