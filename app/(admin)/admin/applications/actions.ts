"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeAuditLog } from "@/lib/admin/audit";
import { plural, times } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";
import { applicationFeeDue } from "@/lib/conference-access";
import {
  proformaResendQueue,
  proformaSendStats,
  resendProformaInvoices,
  sendProformaInvoice,
} from "@/lib/conference-payment";
import { prisma } from "@/lib/db";

/** Back to the admin page the button was on, keeping its filters, with a notice. */
function backTo(
  returnTo: FormDataEntryValue | null,
  fallback: string,
  kind: "updated" | "error",
  message: string,
): never {
  const path =
    typeof returnTo === "string" && /^\/admin\/applications(\/[\w-]+)?(\?[^#]*)?$/.test(returnTo)
      ? returnTo
      : fallback;
  const url = new URL(path, "http://admin.invalid");
  for (const key of ["updated", "error", "deleted"]) url.searchParams.delete(key);
  url.searchParams.set(kind, message);
  redirect(`${url.pathname}${url.search}`);
}

/** Email one registration its proforma invoice again. Only for a fee that is due. */
export async function resendProformaAction(formData: FormData) {
  const actor = requireAdmin(await getCurrentUser());
  const id = String(formData.get("applicationId") ?? "");
  const returnTo = formData.get("returnTo");
  const detail = `/admin/applications/${id}`;

  const app = await prisma.conferenceApplication.findUnique({
    where: { id },
    select: { id: true, email: true, status: true, paymentStatus: true },
  });
  if (!app) backTo(returnTo, "/admin/applications", "error", "That registration no longer exists.");
  if (!applicationFeeDue(app)) {
    backTo(returnTo, detail, "error", `No fee is due from ${app.email}, so there is no proforma invoice to send.`);
  }

  const result = await sendProformaInvoice(app.id);
  await writeAuditLog({
    actorId: actor.id,
    action: "proforma.resend",
    entityType: "ConferenceApplication",
    entityId: app.id,
    after: { to: app.email, sent: result.ok, error: result.error },
  });
  revalidatePath("/admin/applications");
  revalidatePath(detail);

  if (!result.ok) {
    backTo(returnTo, detail, "error", `The proforma invoice to ${app.email} was not sent: ${result.error ?? "the mail server refused it"}.`);
  }
  const count = (await proformaSendStats([app.id])).get(app.id)?.count ?? 1;
  backTo(returnTo, detail, "updated", `Proforma invoice sent to ${app.email}. It has gone out ${times(count)} in total.`);
}

/**
 * Email the proforma invoice to everyone in the current edition whose fee is
 * due, skipping anyone sent one in the last hour.
 */
export async function resendAllProformasAction(formData: FormData) {
  const actor = requireAdmin(await getCurrentUser());
  const returnTo = formData.get("returnTo");
  const list = "/admin/applications";

  const edition = await prisma.edition.findFirst({ where: { isCurrent: true }, select: { id: true } });
  if (!edition) backTo(returnTo, list, "error", "There is no current edition.");

  const { due, queue } = await proformaResendQueue(edition.id);
  if (queue.length === 0) {
    backTo(
      returnTo,
      list,
      "updated",
      due === 0
        ? "Nobody has a fee due, so no proforma invoices were sent."
        : "Nothing sent: everyone with a fee due was emailed a proforma invoice in the last hour.",
    );
  }

  const result = await resendProformaInvoices(queue);
  await writeAuditLog({
    actorId: actor.id,
    action: "proforma.resend_all",
    entityType: "Edition",
    entityId: edition.id,
    after: { due, queued: queue.length, ...result },
  });
  revalidatePath(list);
  revalidatePath("/admin");

  const parts = [`Proforma invoice sent to ${plural(result.sent, "person", "people")}.`];
  if (result.failed > 0) {
    parts.push(`${plural(result.failed, "email")} could not be sent; press the button again to retry them.`);
  }
  if (result.remaining > 0) {
    parts.push(`${plural(result.remaining, "person", "people")} still to go; press the button again to continue.`);
  }
  backTo(returnTo, list, result.sent === 0 && result.failed > 0 ? "error" : "updated", parts.join(" "));
}
