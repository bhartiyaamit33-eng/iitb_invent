import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { processPayUCallback } from "@/lib/colloquium-payu";
import { siteOrigin } from "@/lib/ticket";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formToRecord(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

function payRedirect(token: string | null, outcome: string) {
  const origin = siteOrigin();
  if (!token) {
    return NextResponse.redirect(`${origin}/colloquium?payu=${outcome}`, 303);
  }
  return NextResponse.redirect(
    `${origin}/colloquium/pay/${encodeURIComponent(token)}?payu=${outcome}`,
    303,
  );
}

/**
 * PayU surl + furl. PayU POSTs application/x-www-form-urlencoded.
 * Hash is verified before any payment status change.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return payRedirect(null, "invalid");
  }
  try {
    const result = await processPayUCallback(formToRecord(form));
    if (result.outcome === "success" && result.paymentToken) {
      revalidatePath("/admin/applications");
    }
    return payRedirect(result.paymentToken, result.outcome);
  } catch (err) {
    console.error("[payu callback]", err);
    return payRedirect(null, "invalid");
  }
}

export async function GET() {
  return NextResponse.redirect(`${siteOrigin()}/colloquium`, 303);
}
