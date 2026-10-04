import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Browser delivery cannot confirm an Online Pay acknowledgement. Use the admin retry.",
    },
    { status: 403 },
  );
}
