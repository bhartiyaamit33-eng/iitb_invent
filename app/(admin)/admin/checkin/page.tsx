import { prisma } from "@/lib/db";
import { CheckinScanner } from "@/components/CheckinScanner";
import { PageHeader, Panel } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminCheckinPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const [sessions, checkedIn, tickets] = edition
    ? await Promise.all([
        prisma.session_.findMany({
          where: { editionId: edition.id, deletedAt: null, isPublished: true },
          orderBy: { startsAt: "asc" },
          select: { id: true, title: true },
        }),
        prisma.registration.count({ where: { editionId: edition.id, checkedInAt: { not: null } } }),
        prisma.registration.count({ where: { editionId: edition.id, status: "CONFIRMED" } }),
      ])
    : [[], 0, 0];
  const share = tickets > 0 ? Math.round((checkedIn / tickets) * 100) : 0;

  return (
    <div className="adm-page" style={{ maxWidth: 1000 }}>
      <PageHeader
        title="Check-in"
        description="Scan each ticket's QR code at the entrance, or record attendance for a session. Works on a phone."
      />
      <div className="adm-cols">
        <Panel title="Scan a ticket">
          <CheckinScanner sessions={sessions} />
        </Panel>
        <div className="adm-stack">
          <Panel title="Arrivals">
            <p style={{ margin: 0, fontSize: 30, fontWeight: 680, fontVariationSettings: '"wdth" 115' }}>
              {checkedIn}
              <span className="adm-hint" style={{ fontSize: 15, fontWeight: 500 }}>
                {" "}of {tickets} tickets
              </span>
            </p>
            <div className="adm-meter" style={{ marginTop: 10 }} role="img" aria-label={`${share}% checked in`}>
              <span style={{ width: `${share}%` }} />
            </div>
            <p className="adm-hint" style={{ marginTop: 8 }}>
              {share}% checked in{edition ? ` for ${edition.name}` : ""}.
            </p>
          </Panel>
          <Panel title="At the gate">
            <ul style={{ margin: 0, paddingLeft: 18, listStyle: "disc", color: "var(--adm-ink-2)", display: "grid", gap: 6 }}>
              <li>A ticket exists only once the fee is paid or waived.</li>
              <li>Scanning the same ticket twice is safe; it shows when they first arrived.</li>
              <li>The camera needs HTTPS. On plain HTTP, paste the code from the ticket instead.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
