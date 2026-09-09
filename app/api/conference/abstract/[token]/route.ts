import { prisma } from "@/lib/db";
import { readAbstractFile } from "@/lib/abstract-storage";
import { pdfFileResponse } from "@/lib/pdf-response";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const application = await prisma.conferenceApplication.findUnique({
    where: { abstractViewToken: token },
  });
  if (!application?.abstractStorageKey || !application.abstractStorage) {
    return NextResponse.json({ error: "No abstract on file" }, { status: 404 });
  }

  const download = new URL(req.url).searchParams.get("download") === "1";

  try {
    const file = await readAbstractFile({
      storage: application.abstractStorage,
      key: application.abstractStorageKey,
    });
    return pdfFileResponse(
      file.bytes,
      application.abstractFileName || "abstract.pdf",
      download,
    );
  } catch (err) {
    console.error("[abstract token]", err);
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
