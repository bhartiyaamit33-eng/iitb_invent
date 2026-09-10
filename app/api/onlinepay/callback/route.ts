import { NextResponse } from "next/server";
import { readOnlinePayRequest } from "@/lib/onlinepay";
import {
  applyConferenceOnlinePayCallback,
  conferencePayReturnUrl,
} from "@/lib/conference-onlinepay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(req: Request) {
  const params = await readOnlinePayRequest(req);
  const result = await applyConferenceOnlinePayCallback(params);

  if (result.requestType === "I" && result.paymentToken) {
    return NextResponse.redirect(
      conferencePayReturnUrl(result.paymentToken, result.outcome),
      303,
    );
  }

  return new NextResponse("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** Immediate payment notification is often a browser GET/POST; settlement is server-to-server. */
export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
