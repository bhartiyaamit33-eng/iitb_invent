import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";
import {
  applicationStatusLabel,
  participationLabel,
  phdYearLabel,
  postdocLabel,
  professionalLabel,
} from "@/lib/colloquium";

export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await getCurrentUser();
  try {
    requireAdmin(actor);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const rows = edition
    ? await prisma.colloquiumApplication.findMany({
        where: { editionId: edition.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const header = [
    "submittedAt",
    "status",
    "name",
    "email",
    "phone",
    "institution",
    "professionalCategory",
    "phdYear",
    "seekingPostdoc",
    "participation",
    "paperTitle",
    "abstractFileName",
    "sendCopy",
    "adminNotes",
  ];
  const bodyRows = rows.map((a) =>
    [
      a.createdAt.toISOString(),
      applicationStatusLabel(a.status),
      a.name,
      a.email,
      a.phone,
      a.institution,
      professionalLabel(a.professionalCategory, a.professionalOther),
      phdYearLabel(a.phdYear),
      postdocLabel(a.seekingPostdoc),
      participationLabel(a.participationCategory, a.participationOther),
      a.paperTitle ?? "",
      a.abstractFileName ?? "",
      a.sendCopy ? "yes" : "no",
      a.adminNotes ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );

  await writeAuditLog({
    actorId: actor!.id,
    action: "colloquium.export",
    entityType: "ColloquiumApplication",
    after: { count: rows.length },
  });

  const body = [header.join(","), ...bodyRows].join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invent-colloquium-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
