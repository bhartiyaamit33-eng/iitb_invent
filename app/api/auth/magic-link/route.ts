import { NextResponse } from "next/server";
import { sendMagicLink } from "@/lib/email/transactions";
import { getEmailFromAddress, getSesRegion } from "@/lib/email/ses";

/**
 * Stub magic-link sender (Auth.js Email provider will call the same helper).
 * Body: { email, callbackUrl? }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; callbackUrl?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    const base =
      process.env.AUTH_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://15.206.84.172";
    const url =
      body.callbackUrl ||
      `${base.replace(/\/$/, "")}/api/auth/callback/email?email=${encodeURIComponent(email)}`;

    const mail = await sendMagicLink({ to: email, url });

    return NextResponse.json({
      ok: mail.ok,
      email: mail,
      meta: { from: getEmailFromAddress(), region: getSesRegion() },
    });
  } catch (err) {
    console.error("[api/auth/magic-link]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "failed" },
      { status: 500 },
    );
  }
}
