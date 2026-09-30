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
  <style>
    body { font-family: system-ui, sans-serif; max-width: 36rem; margin: 3rem auto; padding: 0 1.25rem; color: #17333a; line-height: 1.5; }
    a.btn { display: inline-block; margin-top: 1rem; background: #1a6b6b; color: #fff; padding: 0.75rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <p>IITB INV.ENT</p>
  <h1>Confirming payment</h1>
  <p id="auto">Sending the acknowledgement to IIT Bombay Online Pay.</p>
  <p><a class="btn" id="ack" href="${ackHref}" target="_blank" rel="noopener">Send acknowledgement</a></p>
  <script>
    (function () {
      var job = ${job};
      var finished = false;
      function leave(pending) {
        if (finished) return;
        finished = true;
        var url = job.nextUrl;
        if (pending) url += (url.indexOf("?") >= 0 ? "&" : "?") + "ack=pending";
        location.replace(url);
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
        mark().finally(function () { setTimeout(function () { leave(false); }, 600); });
      });
      fetch(job.ackUrl, { mode: "no-cors", cache: "no-store", credentials: "omit" })
        .then(function () { return mark(); })
        .then(function () { leave(false); })
        .catch(function () {});
    })();
  </script>
</body>
</html>`;
}

async function handle(req: Request) {
  const sMsg = await readSMsg(req);
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
