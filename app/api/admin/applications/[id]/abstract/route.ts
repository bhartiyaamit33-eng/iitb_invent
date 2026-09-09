import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { readAbstractFile } from "@/lib/abstract-storage";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getCurrentUser();
  try {
    requireAdmin(actor);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const application = await prisma.colloquiumApplication.findUnique({
    where: { id },
  });
  if (!application?.abstractStorageKey || !application.abstractStorage) {
    return NextResponse.json({ error: "No abstract on file" }, { status: 404 });
  }

  try {
    const file = await readAbstractFile({
      storage: application.abstractStorage,
      key: application.abstractStorageKey,
    });
    const filename = (application.abstractFileName || "abstract.pdf").replace(
      /[\r\n"]/g,
      "",
    );
    return new NextResponse(new Uint8Array(file.bytes), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[abstract download]", err);
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
