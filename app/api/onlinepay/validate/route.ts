import { NextResponse } from "next/server";
import {
  parseValidationPayload,
  readOnlinePayRequest,
  validationResponse,
} from "@/lib/onlinepay";
import { validateOnlinePayRequest } from "@/lib/conference-onlinepay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * IIT Bombay Online Pay (Lisa app 10172) — MANDATORY payment-request
 * validation. OP may POST JSON `{ Records: { input_* } }`, form fields, or
 * query params. Must answer VALID/INVALID or OP will not take money.
 */
async function handle(req: Request) {
  const params = await readOnlinePayRequest(req);
  const parsed = parseValidationPayload(params);

  if (!parsed) {
    if (req.method === "GET" && Object.keys(params).length === 0) {
      return NextResponse.json({ ok: true, service: "onlinepay-validate" });
    }
    console.warn("[onlinepay] validate: unreadable payload", {
      method: req.method,
      keys: Object.keys(params),
    });
    return NextResponse.json(
      validationResponse(
        { appId: "", requestId: "", userId: "", amount: "" },
        "INVALID",
      ),
    );
  }

  const status = await validateOnlinePayRequest(parsed);
  console.info("[onlinepay] validate", {
    appId: parsed.appId,
    requestId: parsed.requestId,
    userId: parsed.userId,
    amount: parsed.amount,
    status,
  });
  return NextResponse.json(validationResponse(parsed, status));
}

export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
