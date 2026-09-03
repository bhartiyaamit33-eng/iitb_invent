import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildIcs } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const raw = (await ctx.params).slug;
  const slug = raw.replace(/\.ics$/i, "");
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition) {
    return new NextResponse("Not found", { status: 404 });
  }
  const session = await prisma.session_.findFirst({
    where: {
      editionId: edition.id,
      slug,
      isPublished: true,
      deletedAt: null,
    },
  });
  if (!session) {
    return new NextResponse("Not found", { status: 404 });
  }

  const location = [session.room, session.floor, edition.venueName]
    .filter(Boolean)
    .join(" · ");
  const ics = buildIcs({
    uid: session.id,
    title: `${session.title} · ${edition.name}`,
    description: session.description,
    location,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
  });

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${session.slug}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
