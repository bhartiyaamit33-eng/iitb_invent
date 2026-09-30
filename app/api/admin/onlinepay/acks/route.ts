import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import {
  completeOnlinePayAck,
  listPendingOnlinePayAcks,
} from "@/lib/conference-onlinepay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await getCurrentUser();
  try {
    requireAdmin(actor);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const items = await listPendingOnlinePayAcks();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const actor = await getCurrentUser();
  try {
    requireAdmin(actor);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
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
