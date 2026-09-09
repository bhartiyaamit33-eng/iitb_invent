import { NextResponse } from "next/server";
import { applyOnlinePayCallback } from "@/lib/payments/service";
import { siteOrigin } from "@/lib/ticket";

export const dynamic = "force-dynamic";

async function readSMsg(req: Request): Promise<string> {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("sMsg");
  if (fromQuery) return fromQuery;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as { sMsg?: string } | null;
    return String(body?.sMsg ?? "");
  }

  const form = await req.formData().catch(() => null);
  if (form) return String(form.get("sMsg") ?? "");
  return "";
}

async function handle(req: Request) {
  const sMsg = await readSMsg(req);
  const result = await applyOnlinePayCallback(sMsg);

  if (result.requestType === "I" && result.payToken) {
    return NextResponse.redirect(
      `${siteOrigin()}/pay/${result.payToken}/receipt`,
      303,
    );
  }

  return new NextResponse("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** Immediate response is often a browser POST/GET; recon is server-to-server. */
export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
