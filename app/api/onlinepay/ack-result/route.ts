import { NextResponse } from "next/server";
import { completeOnlinePayAck } from "@/lib/conference-onlinepay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Browser on the IITB network reports that it reached Online Pay's ACK servlet. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    transId?: string;
    requestType?: string;
  } | null;
  const transId = String(body?.transId ?? "").trim();
  const requestType = String(body?.requestType ?? "").trim();
  if (!transId || !requestType) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const ok = await completeOnlinePayAck(transId, requestType);
  return NextResponse.json({ ok });
}
