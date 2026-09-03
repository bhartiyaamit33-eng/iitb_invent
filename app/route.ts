import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Serve the existing static landing HTML unchanged at `/`.
 * Hero / visual design must remain pixel-identical to public/index.html.
 * App Router layouts do not wrap Route Handlers, so this returns raw HTML.
 */
export async function GET() {
  const filePath = path.join(process.cwd(), "public", "index.html");
  const html = await readFile(filePath, "utf8");

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
