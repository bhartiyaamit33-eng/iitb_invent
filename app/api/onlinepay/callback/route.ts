import { NextResponse } from "next/server";
import { applyConferenceOnlinePayCallback, conferencePayReturnUrl } from "@/lib/conference-onlinepay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readSMsg(req: Request): Promise<string> {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("sMsg");
  if (fromQuery) return fromQuery;

  if ([...url.searchParams.keys()].length > 0) {
    return [...url.searchParams.entries()]
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as {
      sMsg?: string;
    } | null;
    return String(body?.sMsg ?? "");
  }

  const form = await req.formData().catch(() => null);
  if (!form) return "";
  const sMsg = String(form.get("sMsg") ?? "");
  if (sMsg) return sMsg;
  return [...form.entries()]
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("&");
}

async function handle(req: Request) {
  const sMsg = await readSMsg(req);
  const result = await applyConferenceOnlinePayCallback(sMsg);

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

/** Immediate I is often a browser GET/POST; recon R is server-to-server. */
export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
