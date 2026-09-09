import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPayUReady, buildPayUCheckout } from "@/lib/conference-payu";
import { conferencePaymentUrl } from "@/lib/conference-server";
import {
  CONFERENCE_TOKEN_COOKIE,
  conferenceCookieOptions,
} from "@/lib/conference-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function redirectToPay(
  token: string,
  outcome: "unavailable" | "not-due" | "already",
) {
  const url = new URL(conferencePaymentUrl(token));
  url.searchParams.set("payu", outcome);
  const res = NextResponse.redirect(url, 303);
  res.cookies.set(
    CONFERENCE_TOKEN_COOKIE,
    token,
    conferenceCookieOptions(),
  );
  return res;
}

/**
 * Starts IIT Bombay PayU hosted checkout. Returns an auto-POST HTML form
 * so the browser leaves our origin with a server-signed hash (salt never
 * reaches the client as a reusable API).
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const application = await prisma.conferenceApplication.findUnique({
    where: { paymentToken: token },
  });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    application.paymentStatus === "PAID" ||
    application.paymentStatus === "WAIVED"
  ) {
    return redirectToPay(token, "already");
  }
  if (application.paymentStatus === "NOT_REQUIRED") {
    return redirectToPay(token, "not-due");
  }
  if (!isPayUReady()) {
    return redirectToPay(token, "unavailable");
  }

  const checkout = buildPayUCheckout(application);
  if (!checkout) {
    return redirectToPay(token, "unavailable");
  }

  const inputs = Object.entries(checkout.fields)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeAttr(name)}" value="${escapeAttr(value)}" />`,
    )
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redirecting to PayU</title>
</head>
<body>
  <p>Redirecting to the IIT Bombay PayU gateway…</p>
  <form id="payu" action="${escapeAttr(checkout.action)}" method="post">
    ${inputs}
    <noscript><button type="submit">Continue to PayU</button></noscript>
  </form>
  <script>document.getElementById("payu").submit();</script>
</body>
</html>`;

  const res = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
  res.cookies.set(
    CONFERENCE_TOKEN_COOKIE,
    application.paymentToken,
    conferenceCookieOptions(),
  );
  return res;
}
