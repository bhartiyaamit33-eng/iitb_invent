import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

/** Dev-only: bundled @reticlehq/browser for the static `/` landing HTML. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }
  try {
    const filePath = path.join(process.cwd(), ".reticle", "landing-sdk.js");
    const js = await readFile(filePath, "utf8");
    return new NextResponse(js, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
