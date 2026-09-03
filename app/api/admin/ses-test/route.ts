import { NextResponse } from "next/server";
import { sendEmail, getEmailFromAddress, getSesRegion } from "@/lib/email/ses";
import { requireAdmin, AuthError } from "@/lib/auth/roles";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Admin-only SES test send. In sandbox, recipient must be a verified identity.
 * Body: { to?: string } — defaults to admin@iitbinvent.com
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    requireAdmin(user);

    const body = (await req.json().catch(() => ({}))) as { to?: string };
    const to = (body.to || "admin@iitbinvent.com").trim().toLowerCase();

    const result = await sendEmail({
      to,
      subject: "INVENT SES test",
      html: `<p>SES test from <strong>${getEmailFromAddress()}</strong> (region ${getSesRegion()}).</p>`,
      text: `SES test from ${getEmailFromAddress()} (${getSesRegion()}).`,
      action: "email.ses_test",
      actorId: user!.id,
    });

    return NextResponse.json({ ok: result.ok, result, from: getEmailFromAddress(), region: getSesRegion() });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 500 },
    );
  }
}
