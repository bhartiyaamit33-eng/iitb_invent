import { NextResponse } from "next/server";
import {
  parseValidationPayload,
  validationResponse,
} from "@/lib/onlinepay";
import { validateOnlinePayRequest } from "@/lib/conference-onlinepay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * IIT Bombay Online Pay posts JSON here before taking money.
 * Must answer VALID/INVALID or OP will not proceed.
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

export async function GET() {
  return NextResponse.json({ ok: true, service: "onlinepay-validate" });
}
