import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  applicationStatusLabel,
  formatInrFromPaise,
  participationLabel,
} from "@/lib/conference";
import { rupeesToPaise } from "@/lib/onlinepay";
import { applicationTone, istDate, istDateTime, plural } from "@/lib/admin/format";
import { readyToConfirmView, reviewerShortlistView } from "@/lib/review-flow";
import { Badge, Empty, PageHeader, Panel } from "@/components/admin/ui";
import { withBasePath } from "@/lib/base-path";

export const dynamic = "force-dynamic";

const SELECTED = ["SHORTLISTED_PAPER", "SHORTLISTED_POSTER", "ATTENDEE"] as const;

function pct(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export default async function AdminOverviewPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  if (!edition) {
    return (
      <div className="adm-page">
        <PageHeader title="Overview" />
        <Panel>
          <Empty title="No current edition">
            Mark an edition as current on the <Link className="adm-link" href="/admin/editions">Editions</Link> page.
          </Empty>
        </Panel>
      </div>
    );
  }

  const e = { editionId: edition.id };
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    total,
    newThisWeek,
    awaiting,
    selected,
    due,
    paid,
    tickets,
    checkedIn,
    verifiedPayments,
    unconfirmed,
    overdueReviews,
    unassigned,
    turnitinPending,
    readyToConfirm,
    latest,
    sessions,
    publishedSessions,
    speakers,
    faqs,
    pages,
    publishedPages,
    figures,
  ] = await Promise.all([
    prisma.conferenceApplication.count({ where: e }),
    prisma.conferenceApplication.count({ where: { ...e, createdAt: { gte: weekAgo } } }),
    prisma.conferenceApplication.count({ where: { ...e, status: "RECEIVED" } }),
    prisma.conferenceApplication.count({ where: { ...e, status: { in: [...SELECTED] } } }),
    prisma.conferenceApplication.count({
      where: { ...e, status: { in: [...SELECTED] }, paymentStatus: "UNPAID" },
    }),
    prisma.conferenceApplication.count({
      where: { ...e, status: { in: [...SELECTED] }, paymentStatus: { in: ["PAID", "WAIVED"] } },
    }),
    prisma.registration.count({ where: { ...e, status: "CONFIRMED" } }),
    prisma.registration.count({ where: { ...e, checkedInAt: { not: null } } }),
    prisma.gatewayPayment.findMany({
      where: { verified: true, application: { editionId: edition.id } },
      select: { amount: true, applicationId: true },
    }),
    prisma.gatewayPayment.count({
      where: { verified: false, imtStatus: { in: ["S", "DIRECT_RECON"] } },
    }),
    prisma.applicationReview.count({
      where: {
        application: { editionId: edition.id },
        status: { not: "COMPLETED" },
        dueAt: { lt: new Date() },
      },
    }),
    prisma.conferenceApplication.count({
      where: { ...e, status: "RECEIVED", participationCategory: { not: "ATTENDEE" }, reviews: { none: {} } },
    }),
    prisma.conferenceApplication.count({ where: { ...e, ...reviewerShortlistView } }),
    prisma.conferenceApplication.count({ where: { ...e, ...readyToConfirmView } }),
    prisma.conferenceApplication.findMany({
      where: e,
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        institution: true,
        status: true,
        participationCategory: true,
        participationOther: true,
        createdAt: true,
      },
    }),
    prisma.session_.count({ where: { ...e, deletedAt: null } }),
    prisma.session_.count({ where: { ...e, deletedAt: null, isPublished: true } }),
    prisma.speaker.count({ where: { ...e, deletedAt: null } }),
    prisma.faq.count({ where: e }),
    prisma.page.count({ where: e }),
    prisma.page.count({ where: { ...e, isPublished: true } }),
    prisma.editionStat.count({ where: e }),
  ]);

  const collected = verifiedPayments.reduce((sum, p) => sum + (rupeesToPaise(p.amount) ?? 0), 0);
  const perApp = new Map<string, number>();
  for (const p of verifiedPayments) {
    if (p.applicationId) perApp.set(p.applicationId, (perApp.get(p.applicationId) ?? 0) + 1);
  }
  const paidTwice = [...perApp.values()].filter((n) => n > 1).length;

  const stages = [
    {
      label: "Registered",
      count: total,
      meter: total > 0 ? 100 : 0,
      share: `${plural(newThisWeek, "new registration")} this week`,
      action: { href: "/admin/applications", text: "All applications" },
    },
    {
      label: "Awaiting a decision",
      count: awaiting,
      meter: pct(awaiting, total),
      share: `${pct(awaiting, total)}% of registrations`,
      action: awaiting ? { href: "/admin/applications?view=awaiting", text: `Review ${awaiting} waiting` } : null,
      attention: awaiting > 0,
    },
    {
      label: "Selected",
      count: selected,
      meter: pct(selected, total),
      share: `${pct(selected, total)}% of registrations`,
      action: { href: "/admin/applications?view=selected", text: "See who is selected" },
    },
    {
      label: "Fee due",
      count: due,
      meter: pct(due, selected),
      share: `${pct(due, selected)}% of those selected`,
      action: due ? { href: "/admin/applications?view=due", text: `Chase ${due} unpaid` } : null,
      attention: due > 0,
    },
    {
      label: "Paid",
      count: paid,
      meter: pct(paid, selected),
      share: `${formatInrFromPaise(collected)} collected online`,
      action: { href: "/admin/payments", text: "Open the payments ledger" },
    },
    {
      label: "Checked in",
      count: checkedIn,
      meter: pct(checkedIn, tickets),
      share: `${checkedIn} of ${plural(tickets, "ticket")}`,
      action: { href: "/admin/checkin", text: "Open check-in" },
    },
  ];

  const attention = [
    {
      n: unconfirmed,
      text: `${plural(unconfirmed, "payment")} reported by the gateway but not confirmed`,
      href: "/admin/payments?state=unconfirmed",
      cta: "Re-check",
    },
    {
      n: overdueReviews,
      text: `${plural(overdueReviews, "review")} past the due date`,
      href: "/admin/applications?view=awaiting",
      cta: "Open",
    },
    {
      n: unassigned,
      text: `${plural(unassigned, "submission")} awaiting a decision with no reviewer assigned`,
      href: "/admin/applications?view=unassigned",
      cta: "Assign",
    },
    {
      n: turnitinPending,
      text: `${plural(turnitinPending, "reviewer shortlist")} still need a Turnitin check`,
      href: "/admin/applications?view=reviewer-shortlist",
      cta: "Check",
    },
    {
      n: readyToConfirm,
      text: `${plural(readyToConfirm, "checked submission")} ready to officially shortlist`,
      href: "/admin/applications?view=ready",
      cta: "Confirm",
    },
    {
      n: paidTwice,
      text: `${plural(paidTwice, "registration")} paid more than once`,
      href: "/admin/payments?state=paid",
      cta: "Arrange refund",
    },
  ].filter((a) => a.n > 0);

  return (
    <div className="adm-page">
      <PageHeader
        title={edition.name}
        description={`${edition.status.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())} edition, ${
          istDate(edition.startsAt) === istDate(edition.endsAt)
            ? `on ${istDate(edition.startsAt)}`
            : `${istDate(edition.startsAt)} to ${istDate(edition.endsAt)}`
        }, at ${edition.venueName}.`}
        actions={
          <>
            <a className="adm-btn" href={withBasePath("/api/admin/applications/export")}>
              Export applications
            </a>
            <Link className="adm-btn is-primary" href="/admin/applications">
              Open applications
            </Link>
          </>
        }
      />

      <ol className="adm-pipeline" aria-label="Registration pipeline" data-testid="pipeline">
        {stages.map((s, i) => (
          <li key={s.label} className={`adm-stage${s.attention ? " is-attention" : ""}`}>
            <span className="adm-stage-step">
              <i aria-hidden="true">{i + 1}</i>
            </span>
            <span className="adm-stage-count">{s.count.toLocaleString("en-IN")}</span>
            <span className="adm-stage-label">{s.label}</span>
            <span className="adm-stage-meter" aria-hidden="true">
              <span style={{ width: `${s.meter}%` }} />
            </span>
            <span className="adm-stage-share">{s.share}</span>
            <span className="adm-stage-action">
              {s.action ? (
                <Link className="adm-link" href={s.action.href}>
                  {s.action.text}
                </Link>
              ) : (
                <span className="adm-hint">Nothing waiting</span>
              )}
            </span>
          </li>
        ))}
      </ol>

      <div className="adm-cols" style={{ marginTop: 20 }}>
        <div className="adm-stack">
          <Panel title="Needs attention" flush>
            {attention.length ? (
              <ul className="adm-list" data-testid="attention">
                {attention.map((a) => (
                  <li key={a.text}>
                    <span>{a.text}</span>
                    <Link className="adm-btn is-small" href={a.href}>
                      {a.cta}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="Nothing needs attention">
                Payments, reviews and assignments are all up to date.
              </Empty>
            )}
          </Panel>

          <Panel
            title="Latest registrations"
            flush
            actions={
              <Link className="adm-link" href="/admin/applications">
                View all
              </Link>
            }
          >
            {latest.length ? (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Participation</th>
                      <th>Status</th>
                      <th className="num">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <Link className="primary-link" href={`/admin/applications/${a.id}`}>
                            {a.name}
                          </Link>
                          <span className="adm-sub">{a.institution}</span>
                        </td>
                        <td>{participationLabel(a.participationCategory, a.participationOther)}</td>
                        <td>
                          <Badge tone={applicationTone(a.status)}>{applicationStatusLabel(a.status)}</Badge>
                        </td>
                        <td className="num" style={{ color: "var(--adm-mute)", fontSize: 12.5 }}>
                          {istDateTime(a.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty title="No registrations yet">They will appear here as people register.</Empty>
            )}
          </Panel>
        </div>

        <Panel title="Programme and website" flush>
          <ul className="adm-list">
            <li>
              <Link className="adm-link" href="/admin/sessions">Sessions published</Link>
              <span className="value">
                {publishedSessions} of {sessions}
              </span>
            </li>
            <li>
              <Link className="adm-link" href="/admin/speakers">Speakers</Link>
              <span className="value">
                {speakers}{" "}
                <Badge tone={edition.speakersPublished ? "good" : "neutral"}>
                  {edition.speakersPublished ? "Line-up public" : "Line-up hidden"}
                </Badge>
              </span>
            </li>
            <li>
              <Link className="adm-link" href="/admin/pages">Pages published</Link>
              <span className="value">
                {publishedPages} of {pages}
              </span>
            </li>
            <li>
              <Link className="adm-link" href="/admin/faqs">FAQs</Link>
              <span className="value">{faqs}</span>
            </li>
            <li>
              <Link className="adm-link" href="/admin/stats">Homepage figures</Link>
              <span className="value">{figures}</span>
            </li>
            <li>
              <Link className="adm-link" href="/admin/users">Registered tickets</Link>
              <span className="value">{tickets}</span>
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
