import { NextResponse } from "next/server";

export function pdfFileResponse(
  bytes: Buffer,
  filename: string,
  download: boolean,
): NextResponse {
  const safe = filename.replace(/[\r\n"]/g, "") || "abstract.pdf";
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safe}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
