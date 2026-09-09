import { NextResponse } from "next/server";
import { processColloquiumApplication } from "@/lib/colloquium-submit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const result = await processColloquiumApplication(formData);
    if ("error" in result) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/colloquium/apply]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Could not submit the application. Please try again.",
      },
      { status: 500 },
    );
  }
}
