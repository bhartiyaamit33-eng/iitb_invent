"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { writeAuditLog } from "@/lib/admin/audit";
import { reacknowledgePayment, resendPaymentReceipt } from "@/lib/conference-payment";

/** Email the receipt (inside the ticket email) for one confirmed transaction again. */
export async function resendReceiptAction(form: FormData) {
  const actor = await getCurrentUser();
  requireAdmin(actor);
  const transId = String(form.get("transId") ?? "").trim();
  const returnTo = String(form.get("returnTo") ?? "");
  const back = /^\/admin\/payments(\?[^#]*)?$/.test(returnTo) ? returnTo : "/admin/payments";

  const result = await resendPaymentReceipt(transId);
  await writeAuditLog({
    actorId: actor!.id,
    action: "payment.receipt_resend",
    entityType: "GatewayPayment",
    entityId: transId,
    after: { to: result.to, sent: result.ok, error: result.error },
  });
  const message = result.ok
    ? `Receipt for ${transId} sent to ${result.to}.`
    : `The receipt for ${transId} was not sent: ${result.error ?? "the mail server refused it"}.`;

  revalidatePath("/admin/payments");
  const url = new URL(back, "http://admin.invalid");
  url.searchParams.set("msg", message);
  redirect(`${url.pathname}${url.search}`);
}

/** Re-send the ACK for one unconfirmed transaction and settle it if the gateway now confirms it. */
export async function recheckPayment(form: FormData) {
  const actor = await getCurrentUser();
  requireAdmin(actor);
  const transId = String(form.get("transId") ?? "").trim();

  let message: string;
  try {
    const { verified, acks } = await reacknowledgePayment(transId);
    await writeAuditLog({
      actorId: actor!.id,
      action: "payment.gateway.recheck",
      entityType: "GatewayPayment",
      entityId: transId,
      after: { verified, acks },
    });
    message = verified
      ? `${transId} is confirmed by the gateway.`
      : `${transId} is still not confirmed: ${acks.join("; ") || "nothing to acknowledge"}`;
  } catch (err) {
    message = err instanceof Error ? err.message : "Could not re-check.";
  }

  revalidatePath("/admin/payments");
  redirect(`/admin/payments?msg=${encodeURIComponent(message)}`);
}
