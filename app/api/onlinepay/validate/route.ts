import { NextResponse } from "next/server";
import {
  parseValidationPayload,
  validationResponse,
} from "@/lib/payments/onlinepay";
import { validateOnlinePayRequest } from "@/lib/payments/service";

export const dynamic = "force-dynamic";

/**
 * IITB Online Pay calls this when a payment is initiated.
 * Must answer VALID/INVALID JSON or OP will not take money.
 */
export async function POST(req: Request) {
  let body: unknown = null;
  try {
    const text = await req.text();
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  const parsed = parseValidationPayload(body);
  if (!parsed) {
    return NextResponse.json(
      validationResponse(
        { appId: "", requestId: "", userId: "", amount: "" },
        "INVALID",
      ),
    );
  }

  const status = await validateOnlinePayRequest(parsed);
  return NextResponse.json(validationResponse(parsed, status));
}
