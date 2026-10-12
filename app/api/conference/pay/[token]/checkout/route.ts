import { NextResponse } from "next/server";
import { conferencePaymentUrl } from "@/lib/conference-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ token: string }> };

/**
 * Checkout now starts from the payment page itself, which links straight to
 * the gateway. Payment pages left open from before still post here.
 */
async function toPaymentPage(_req: Request, { params }: Context) {
  const { token } = await params;
  return NextResponse.redirect(conferencePaymentUrl(token), 303);
}

export const GET = toPaymentPage;
export const POST = toPaymentPage;
