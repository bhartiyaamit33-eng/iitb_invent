import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await getCurrentUser();
  try {
    requireAdmin(actor);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { profile: { select: { personaType: true, organisation: true } } },
  });

  const header = [
    "email",
    "name",
    "role",
    "createdAt",
    "personaType",
    "organisation",
  ];
  const rows = users.map((u) =>
    [
      u.email,
      u.name,
      u.role,
      u.createdAt.toISOString(),
      u.profile?.personaType ?? "",
      u.profile?.organisation ?? "",
    ]
      .map(csvEscape)
      .join(","),
  );

  await writeAuditLog({
    actorId: actor!.id,
    action: "user.export",
    entityType: "User",
    after: { count: users.length },
  });

  const body = [header.join(","), ...rows].join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="invent-users-${new Date().toISOString().slice(0, 10)}.csv"`,
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
