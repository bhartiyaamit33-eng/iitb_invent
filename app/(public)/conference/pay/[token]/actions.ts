"use server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
export async function saveBilling(form: FormData) {
  const token = String(form.get("token") || "");
  const name = String(form.get("billingName") || "").trim();
  const address = String(form.get("billingAddress") || "").trim();
  const gstin = String(form.get("billingGstin") || "")
    .trim()
    .toUpperCase();
  if (
    name.length > 120 ||
    address.length > 1000 ||
    (gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin))
  )
    redirect(`/conference/pay/${encodeURIComponent(token)}?billing=invalid`);
  const saved = await prisma.conferenceApplication.updateMany({
    where: {
      paymentToken: token,
      paymentStatus: { in: ["UNPAID", "NOT_REQUIRED"] },
    },
    data: {
      billingName: name || null,
      billingAddress: address || null,
      billingGstin: gstin || null,
    },
  });
  if (!saved.count)
    redirect(`/conference/pay/${encodeURIComponent(token)}?billing=locked`);
  revalidatePath(`/conference/pay/${token}`);
  redirect(`/conference/pay/${encodeURIComponent(token)}?billing=saved`);
}
