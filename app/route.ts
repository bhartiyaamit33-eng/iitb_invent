import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getHappeningNow, getUpNext, isLiveStatus } from "@/lib/live";
import { formatIstRange } from "@/lib/editions";

/**
 * Serve the existing static landing HTML at `/`.
 * When the current edition is LIVE, inject a happening-now strip above the hero
 * without rewriting the hero markup itself.
 */
export async function GET() {
  const filePath = path.join(process.cwd(), "public", "index.html");
  let html = await readFile(filePath, "utf8");

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
<div id="live-strip" style="position:relative;z-index:30;background:#034a56;color:#fff;padding:14px 18px;font-family:Sora,system-ui,sans-serif">
  <div style="max-width:1220px;margin:0 auto;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:flex-start">
    <div>
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.8">Happening now · ${escapeHtml(clock)} IST</p>
      ${happeningHtml}
      ${upNextHtml}
    </div>
    <p style="margin:0"><a href="/now" style="color:#fff;font-weight:600">Lobby screen</a> · <a href="/programme" style="color:#fff">Programme</a></p>
  </div>
</div>`;
    html = html.replace("<body>", `<body>${strip}`);
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
