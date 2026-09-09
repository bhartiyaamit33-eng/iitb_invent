import { NextResponse } from "next/server";
import { processConferenceApplication } from "@/lib/conference-submit";
import {
  CONFERENCE_TOKEN_COOKIE,
  conferenceCookieOptions,
} from "@/lib/conference-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Public apply endpoint. JSON rather than a Server Action so submit works
 * behind the Cloudflare Worker (Host origin.iitbinvent.com vs public site).
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const result = await processConferenceApplication(formData);
    if ("error" in result) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 },
      );
    }
    const res = NextResponse.json({
      ok: true,
      paymentToken: result.paymentToken,
    });
    res.cookies.set(
      CONFERENCE_TOKEN_COOKIE,
      result.paymentToken,
      conferenceCookieOptions(),
    );
    return res;
  } catch (err) {
    console.error("[api/conference/apply]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Could not submit the application. Please try again.",
      },
      { status: 500 },
    );
  }
}
