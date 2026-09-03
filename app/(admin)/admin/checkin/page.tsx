import { prisma } from "@/lib/db";
import { CheckinScanner } from "@/components/CheckinScanner";

export const dynamic = "force-dynamic";

export default async function AdminCheckinPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const sessions = edition
    ? await prisma.session_.findMany({
        where: { editionId: edition.id, deletedAt: null, isPublished: true },
        orderBy: { startsAt: "asc" },
        select: { id: true, title: true },
      })
    : [];

  const checkedIn = edition
    ? await prisma.registration.count({
        where: { editionId: edition.id, checkedInAt: { not: null } },
      })
    : 0;
  const total = edition
    ? await prisma.registration.count({
        where: { editionId: edition.id, status: "CONFIRMED" },
      })
    : 0;

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">
        Check-in
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Mobile-first scanner for gate QR and session attendance.{" "}
        {checkedIn}/{total} checked in
        {edition ? ` · ${edition.name}` : ""}.
      </p>
      <div className="mt-8 max-w-xl">
        <CheckinScanner sessions={sessions} />
      </div>
    </main>
  );
}
