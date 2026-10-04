import { NextResponse } from "next/server";
import { readOnlinePayRequest, buildSMsg } from "@/lib/onlinepay";
import {
  applyConferenceOnlinePayCallback,
  conferencePayReturnUrl,
} from "@/lib/conference-onlinepay";

function isBrowserNavigation(req: Request): boolean {
  const mode = req.headers.get("sec-fetch-mode");
  const dest = req.headers.get("sec-fetch-dest");
  return mode === "navigate" || dest === "document";
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function browserAckHtml(opts: {
  ackUrl: string;
  nextUrl: string;
  transId: string;
  requestType: string;
}): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Online Pay acknowledgement pending</title></head><body><h1>Payment response recorded</h1><p>The acknowledgement to IIT Bombay is still unconfirmed. Open this link from campus or VPN. Opening it alone does not confirm delivery in INVENT.</p><p><a href="${escapeAttr(opts.ackUrl)}" target="_blank" rel="noopener">Open IITB acknowledgement</a></p><p><a href="${escapeAttr(opts.nextUrl)}&ack=pending">Return to payment status</a></p></body></html>`;
}

export async function handleOnlinePayCallback(
  req: Request,
  pathToken?: string,
) {
  const token = (process.env.ONLINEPAY_CALLBACK_TOKEN || "").trim();
  if (
    (process.env.NODE_ENV === "production" && !token) ||
    (token &&
      (pathToken ?? new URL(req.url).searchParams.get("token")) !== token)
  ) {
    return new NextResponse("Unauthorized callback", { status: 403 });
  }
  const sMsg = buildSMsg(await readOnlinePayRequest(req));
  const result = await applyConferenceOnlinePayCallback(sMsg);
  const browser = isBrowserNavigation(req);

  if (result.requestType === "I" && result.paymentToken && browser) {
    const nextUrl = conferencePayReturnUrl(result.paymentToken, result.outcome);
    if (!result.ackOk && result.ackUrl && result.transId) {
      return new NextResponse(
        browserAckHtml({
          ackUrl: result.ackUrl,
          nextUrl,
          transId: result.transId,
          requestType: "I",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
          },
        },
      );
    }
    return NextResponse.redirect(nextUrl, 303);
  }

  return new NextResponse(result.paymentToken ? "OK" : "INVALID", {
    status: result.paymentToken ? 200 : 400,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
