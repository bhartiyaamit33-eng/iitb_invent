import { NextResponse } from "next/server";
import { contentDisposition } from "@/lib/content-disposition";

export function pdfFileResponse(
  bytes: Buffer,
  filename: string,
  download: boolean,
): NextResponse {
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(filename, download),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
