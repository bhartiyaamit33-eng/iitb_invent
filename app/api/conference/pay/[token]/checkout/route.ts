import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isPayUReady, buildPayUCheckout } from "@/lib/conference-payu";
import { startConferenceOnlinePay } from "@/lib/conference-onlinepay";
import { isOnlinePayConfigured } from "@/lib/onlinepay";
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

function escapeHtml(value: string): string {
  return escapeAttr(value).replace(/'/g, "&#39;");
}

function sanitizeLdap(raw: string): string {
  return raw.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 32);
}

function redirectToPay(
  token: string,
  outcome: "unavailable" | "not-due" | "already",
) {
  const url = new URL(conferencePaymentUrl(token));
  url.searchParams.set("payu", outcome);
  const res = NextResponse.redirect(url, 303);
  res.cookies.set(CONFERENCE_TOKEN_COOKIE, token, conferenceCookieOptions());
  return res;
}

function onlinePayHandoffHtml(opts: {
  opUrl: string;
  test: boolean;
  backUrl: string;
  userId: string;
}): string {
  const opUrl = escapeAttr(opts.opUrl);
  const backUrl = escapeAttr(opts.backUrl);
  const userId = escapeHtml(opts.userId);
  const testCopy = opts.test
    ? `<p>IIT Bombay TEST Online Pay only loads on the IITB network. Do not paste the
        gateway URL into the address bar — OP rejects that with
        <strong>Requesting page referer not received</strong>.</p>
       <p>This page will open the gateway so the Referer is INVENT.
       Paying as user id <code>${userId}</code>.</p>`
    : `<p>Opening IIT Bombay Online Pay…</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="referrer" content="origin" />
  <title>IIT Bombay Online Pay</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 36rem; margin: 3rem auto; padding: 0 1.25rem; color: #17333a; line-height: 1.5; }
    a.btn { display: inline-block; margin-top: 1rem; background: #1a6b6b; color: #fff; padding: 0.75rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; }
    .back { display: inline-block; margin-top: 1.25rem; color: #1a6b6b; }
    code { font-size: 0.9em; }
  </style>
</head>
<body>
  <p>INVENT · Research Conference</p>
  <h1>IIT Bombay Online Pay</h1>
  ${testCopy}
  <p><a class="btn" href="${opUrl}" referrerpolicy="origin" data-testid="onlinepay-handoff">Continue to IIT Bombay Online Pay</a></p>
  <p><a class="back" href="${backUrl}">← Back to the INVENT payment page</a></p>
  <script>
    window.setTimeout(function () {
      window.location.assign(${JSON.stringify(opts.opUrl)});
    }, 400);
  </script>
</body>
</html>`;
}

async function startCheckout(
  req: Request,
  token: string,
): Promise<NextResponse> {
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

  if (isOnlinePayConfigured()) {
    try {
      const form = await req.formData().catch(() => null);
      const ldap = sanitizeLdap(String(form?.get("ldap") ?? ""));
      const handoff = await startConferenceOnlinePay(application, {
        payerUserId: ldap || null,
      });
      const html = onlinePayHandoffHtml({
        opUrl: handoff.url,
        test: handoff.test,
        backUrl: conferencePaymentUrl(token),
        userId: handoff.userId,
      });
      const res = new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Referrer-Policy": "origin",
        },
      });
      res.cookies.set(
        CONFERENCE_TOKEN_COOKIE,
        application.paymentToken,
        conferenceCookieOptions(),
      );
      return res;
    } catch (err) {
      console.error("[onlinepay] checkout", err);
      return redirectToPay(token, "unavailable");
    }
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
  <meta name="referrer" content="origin" />
  <title>Redirecting to IIT Bombay Online Pay</title>
</head>
<body>
  <p>Redirecting to the IIT Bombay payment gateway…</p>
  <form id="payu" action="${escapeAttr(checkout.action)}" method="post">
    ${inputs}
    <noscript><button type="submit">Continue to payment</button></noscript>
  </form>
  <script>document.getElementById("payu").submit();</script>
</body>
</html>`;

  const res = new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "origin",
    },
  });
  res.cookies.set(
    CONFERENCE_TOKEN_COOKIE,
    application.paymentToken,
    conferenceCookieOptions(),
  );
  return res;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  return startCheckout(req, token);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  return startCheckout(req, token);
}
