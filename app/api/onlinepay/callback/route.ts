import { NextResponse } from "next/server";
import { readOnlinePayRequest } from "@/lib/onlinepay";
import {
  applyConferenceOnlinePayCallback,
  conferencePayReturnUrl,
} from "@/lib/conference-onlinepay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const job = JSON.stringify({
    ackUrl: opts.ackUrl,
    nextUrl: opts.nextUrl,
    mark: { transId: opts.transId, requestType: opts.requestType },
  });
  const ackHref = escapeAttr(opts.ackUrl);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Confirming IIT Bombay Online Pay</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Mona+Sans:wdth,wght@95,400..700&amp;display=swap" rel="stylesheet" />
  <style>
    body { font-family: "Mona Sans", sans-serif; font-optical-sizing: auto; font-variation-settings: "wdth" 95; font-weight: 400; max-width: 36rem; margin: 3rem auto; padding: 0 1.25rem; color: #17333a; line-height: 1.5; }
    a.btn { display: inline-block; margin-top: 1rem; background: #1a6b6b; color: #fff; padding: 0.75rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 650; letter-spacing: -0.01em; }
  </style>
</head>
<body>
  <p>IITB INV.ENT</p>
  <h1>Confirming payment</h1>
  <p>Sending the acknowledgement to IIT Bombay Online Pay.</p>
  <p><a class="btn" id="ack" href="${ackHref}" target="_blank" rel="noopener">Send acknowledgement</a></p>
  <script>
    (function () {
      var job = ${job};
      var finished = false;
      function leave() {
        if (finished) return;
        finished = true;
        location.replace(job.nextUrl);
      }
      function mark() {
        return fetch("/api/onlinepay/ack-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(job.mark)
        });
      }
      document.getElementById("ack").addEventListener("click", function () {
        mark().finally(function () { setTimeout(leave, 600); });
      });
      fetch(job.ackUrl, { mode: "no-cors", cache: "no-store", credentials: "omit" })
        .then(function () { return mark(); })
        .then(leave)
        .catch(function () {});
    })();
  </script>
</body>
</html>`;
}

async function handle(req: Request) {
  const params = await readOnlinePayRequest(req);
  const result = await applyConferenceOnlinePayCallback(params);
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

  return new NextResponse("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/** Immediate payment notification is often a browser GET/POST; settlement is server-to-server. */
export async function POST(req: Request) {
  return handle(req);
}

export async function GET(req: Request) {
  return handle(req);
}
