import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getHappeningNow, getUpNext, isLiveStatus } from "@/lib/live";
import { formatIstRange } from "@/lib/editions";

/**
 * Serve the existing static landing HTML at `/`.
 * When the current edition is LIVE, inject a happening-now strip above the hero
 * without rewriting the hero markup itself.
 * When the visitor is signed in, swap auth CTAs for dashboard links.
 */
export async function GET() {
  const filePath = path.join(process.cwd(), "public", "index.html");
  let html = await readFile(filePath, "utf8");
  const user = await getCurrentUser().catch(() => null);

  try {
    const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
    if (edition && isLiveStatus(edition.status)) {
    const now = new Date();
    const [happening, upNext] = await Promise.all([
      getHappeningNow(edition.id, now),
      getUpNext(edition.id, now, 3),
    ]);
    const clock = now.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });
    const happeningHtml =
      happening.length === 0
        ? `<p style="margin:0;opacity:.9">No session in progress.</p>`
        : happening
            .map(
              (s) =>
                `<p style="margin:0 0 6px"><strong>${escapeHtml(s.title)}</strong>${
                  s.room ? ` · ${escapeHtml(s.room)}` : ""
                }</p>`,
            )
            .join("");
    const upNextHtml =
      upNext.length === 0
        ? ""
        : `<p style="margin:10px 0 4px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.75">Up next</p>` +
          upNext
            .map(
              (s) =>
                `<p style="margin:0 0 4px;font-size:14px">${escapeHtml(
                  formatIstRange(s.startsAt, s.endsAt),
                )} — ${escapeHtml(s.title)}</p>`,
            )
            .join("");

    const strip = `
<div id="live-strip" style="position:relative;z-index:70;background:#07111F;color:#F5F7FA;padding:14px 18px;font-family:Inter,system-ui,sans-serif;border-bottom:1px solid rgba(200,255,61,0.22)">
  <div style="max-width:1220px;margin:0 auto;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:flex-start">
    <div>
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#C8FF3D">Happening now · ${escapeHtml(clock)} IST</p>
      ${happeningHtml}
      ${upNextHtml}
    </div>
    <p style="margin:0"><a href="/now" style="color:#C8FF3D;font-weight:600">Lobby screen</a> · <a href="/programme" style="color:#F5F7FA">Programme</a></p>
  </div>
</div>`;
    html = html.replace("<body>", `<body>${strip}`);
    }
  } catch {
    // Landing is a public teaser; a down database must not 500 the page.
  }

  if (process.env.NODE_ENV !== "production") {
    html = injectReticleLanding(html);
  }

  if (user) {
    const display =
      escapeHtml(user.name.trim().split(/\s+/)[0] || user.name || "Account");
    html = html
      .replaceAll(
        `<a class="nav-login" href="/login">Login</a>`,
        `<a class="nav-login" href="/dashboard">${display}</a>`,
      )
      .replaceAll(
        `<a class="btn" href="/signup">Create free account</a>`,
        `<a class="btn" href="/dashboard">Go to dashboard</a>`,
      )
      .replaceAll(
        `<a class="btn" href="/login">Log in to connect</a>`,
        `<a class="btn" href="/dashboard">Go to dashboard</a>`,
      )
      .replaceAll(
        `<a class="btn ghost" href="/signup">Create account</a>`,
        `<a class="btn ghost" href="/2027/attendees">Browse attendees</a>`,
      );
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": user
        ? "private, no-store"
        : "public, max-age=0, must-revalidate",
    },
  });
}

/** `/` is a Route Handler, so app/layout.tsx never mounts <ReticleDev />. */
function injectReticleLanding(html: string) {
  const token = process.env.NEXT_PUBLIC_RETICLE_TOKEN;
  const root = process.env.NEXT_PUBLIC_RETICLE_ROOT;
  const url = process.env.NEXT_PUBLIC_RETICLE_URL;
  const opts: Record<string, string> = { projectId: "iitbinvent-7d4eb21c" };
  if (url) opts.url = url;
  if (token) opts.token = token;
  if (root) opts.root = root;
  const snippet = `<script type="module">
    import { reticle } from ${JSON.stringify("/reticle-sdk")};
    reticle.connect(${JSON.stringify(opts)});
  </script>`;
  return html.replace("</body>", `${snippet}</body>`);
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
