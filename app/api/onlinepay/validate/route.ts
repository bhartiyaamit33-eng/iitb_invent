import { NextResponse } from "next/server";
import { parseValidationRequest, validationResponse } from "@/lib/onlinepay";
import { validatePaymentRequest } from "@/lib/conference-payment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * IIT Bombay OnlinePay request validation (registered with ASC). Every reply
 * is the JSON Records envelope; anything else reads as a failed validation.
 */
async function handle(req: Request) {
  const body = await req.json().catch(() => null);
  const request = parseValidationRequest(body);
  const status = await validatePaymentRequest(request).catch((err) => {
    console.error("[onlinepay] validate failed", err);
    return "INVALID" as const;
  });
  return NextResponse.json(validationResponse(request, status), {
    headers: { "Cache-Control": "no-store" },
  });
}

export const POST = handle;
export const GET = handle;
