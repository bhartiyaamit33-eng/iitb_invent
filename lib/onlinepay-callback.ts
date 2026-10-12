import { NextResponse } from "next/server";
import { recordGatewayNotice } from "@/lib/conference-payment";
import { conferencePaymentUrl } from "@/lib/conference-server";
import { parseNotice } from "@/lib/onlinepay";

/**
 * The notice normally arrives as ?sMsg=requestType=I%26transId=… (one parameter
 * holding the %26-joined fields). If the fields ever come as separate query
 * parameters instead, sMsg would hold only the first one, so read the whole
 * query. A POSTed form with sMsg is accepted too.
 */
async function readSMsg(req: Request): Promise<string> {
  const url = new URL(req.url);
  const sMsg = url.searchParams.get("sMsg");
  if (sMsg) {
    if (/(^|&)transId=/.test(sMsg) || !url.searchParams.has("transId")) return sMsg;
    const rest = new URLSearchParams(url.search);
    rest.delete("sMsg");
    return `${sMsg}&${rest.toString()}`;
  }
  if (url.searchParams.has("transId")) return url.searchParams.toString();
  if (req.method !== "POST") return "";
  const form = await req.formData().catch(() => null);
  const value = form?.get("sMsg");
  return typeof value === "string" ? value : "";
}

function text(body: string, status: number) {
  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** An immediate notice is a person at a browser: give them a page they can act on, never a bare error. */
function payerPage(title: string, body: string, transId: string, status: number) {
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} | IITB INV.ENT</title>
<style>body{font-family:system-ui,sans-serif;max-width:34rem;margin:3rem auto;padding:0 1.25rem;color:#14213d;line-height:1.55}
code{font-size:.95em}</style></head>
<body><p>IITB INV.ENT</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(body)}</p>
${transId ? `<p>Transaction ID: <code>${escapeHtml(transId)}</code></p>` : ""}
<p>Questions: <a href="mailto:support@iitbinvent.com">support@iitbinvent.com</a></p></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/**
 * The gateway's return URL (payack, as on the department's other sites). An
 * immediate (I) notice arrives through the payer's browser, so it ends on
 * their payment page; reconciliation (R, including direct recon) and D notices
 * are server-to-server and get a plain "OK".
 *
 * No secret is needed: recordGatewayNotice acknowledges every notice with
 * ASC's ACK servlet and counts a payment only when ASC confirms the
 * transaction, so a hand-typed notice cannot mark anyone paid.
 */
export async function handleGatewayCallback(req: Request): Promise<NextResponse> {
  const sMsg = await readSMsg(req);
  if (!sMsg) return text("Invalid request.", 400);
  const notice = parseNotice(sMsg);

  try {
    const outcome = await recordGatewayNotice(sMsg);
    if (!outcome.ok) return text("Invalid request.", 400);
    if (outcome.requestType !== "I") return text("OK", 200);

    const result = outcome.verified ? "S" : outcome.status === "S" ? "P" : "F";
    if (!outcome.paymentToken) {
      return payerPage(
        "Payment response received",
        "We could not match this payment to a registration. If money was debited, do not pay again: write to us quoting the transaction ID below and we will sort it out.",
        outcome.transId,
        200,
      );
    }
    const url = new URL(conferencePaymentUrl(outcome.paymentToken));
    url.searchParams.set("result", result);
    url.searchParams.set("txn", outcome.transId);
    return NextResponse.redirect(url, 303);
  } catch (err) {
    console.error(`[onlinepay] notice ${notice.requestType} ${notice.transId} failed`, err);
    if (notice.requestType === "I") {
      return payerPage(
        "We could not record your payment yet",
        "IIT Bombay OnlinePay sent us your payment result, but our server could not save it just now. If money was debited, do not pay again: the bank's settlement will reach us, and you can write to us quoting the transaction ID below.",
        notice.transId,
        500,
      );
    }
    return text("Internal error.", 500);
  }
}
