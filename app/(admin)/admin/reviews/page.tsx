import Link from "next/link";
import { prisma } from "@/lib/db";
import { participationLabel } from "@/lib/conference";
import { istDate, plural } from "@/lib/admin/format";
import { savedReviewChoiceLabel } from "@/lib/review-flow";
import { reviewerLoadsForEdition } from "@/lib/review-load";
import { Badge, Empty, PageHeader, Panel } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const STATUS_LABEL = {
  ASSIGNED: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Done",
} as const;

function statusRank(status: keyof typeof STATUS_LABEL): number {
  if (status === "ASSIGNED") return 0;
  if (status === "IN_PROGRESS") return 1;
  return 2;
}

export default async function AdminReviewLoadPage({
  searchParams,
}: {
  searchParams: Promise<{ reviewer?: string }>;
}) {
  const { reviewer: reviewerId } = await searchParams;
  const edition = await prisma.edition.findFirst({
    where: { isCurrent: true },
    select: { id: true, name: true },
  });

  if (!edition) {
    return (
      <div className="adm-page">
        <PageHeader title="Review load" />
        <Panel>
          <Empty title="No current edition">
            Mark an edition as current on the{" "}
            <Link className="adm-link" href="/admin/editions">
              Editions
            </Link>{" "}
            page.
          </Empty>
        </Panel>
      </div>
    );
  }

  const loads = await reviewerLoadsForEdition(edition.id);
  const selected = loads.find((row) => row.id === reviewerId) ?? null;
  const allotted = loads.reduce((sum, row) => sum + row.allotted, 0);
  const pending = loads.reduce((sum, row) => sum + row.pending, 0);
  const done = loads.reduce((sum, row) => sum + row.done, 0);

  const assignments = selected
    ? await prisma.applicationReview.findMany({
        where: { reviewerId: selected.id, application: { editionId: edition.id } },
        include: {
          application: {
            select: {
              id: true,
              name: true,
              email: true,
              institution: true,
              paperTitle: true,
              applicationNumber: true,
              participationCategory: true,
              participationOther: true,
            },
          },
        },
      })
    : [];
  assignments.sort(
    (a, b) =>
      statusRank(a.status) - statusRank(b.status) ||
      (a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER),
  );

  return (
    <div className="adm-page">
      <PageHeader
        title="Review load"
        description={`${plural(loads.length, "reviewer")} for ${edition.name}. ${plural(allotted, "assignment")} in total, ${plural(done, "submitted review")}, and ${plural(pending, "review still pending")}. One application can be allotted to more than one reviewer, so the totals count assignments.`}
        actions={
          <Link className="adm-btn" href="/admin/applications?view=unassigned">
            Unassigned applications
          </Link>
        }
      />

      <section className="adm-panel is-flush">
        <div className="adm-panel-body" style={{ paddingTop: 14 }}>
          {loads.length === 0 ? (
            <Empty title="No reviewers yet">
              Give an account the Reviewer role on the{" "}
              <Link className="adm-link" href="/admin/users?role=reviewer">
                Users
              </Link>{" "}
              page, then assign applications from an application.
            </Empty>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table" data-testid="review-load-table">
                <thead>
                  <tr>
                    <th>Reviewer</th>
                    <th className="num">Allotted</th>
                    <th className="num">Done</th>
                    <th className="num">Pending</th>
                    <th className="num">Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {loads.map((row) => (
                    <tr key={row.id} data-testid={`reviewer-load-${row.id}`}>
                      <td>
                        <Link
                          className="primary-link"
                          href={selected?.id === row.id ? "/admin/reviews" : `/admin/reviews?reviewer=${row.id}`}
                          aria-current={selected?.id === row.id ? "true" : undefined}
                        >
                          {row.name}
                        </Link>
                        <span className="adm-sub">{row.email}</span>
        {row.inactive ? (
          <span className="adm-sub">No longer a reviewer</span>
        ) : row.role === "ADMIN" ? (
          <span className="adm-sub">Admin, also reviewing</span>
        ) : null}
                      </td>
                      <td className="num" data-testid={`allotted-${row.id}`}>
                        {row.allotted.toLocaleString("en-IN")}
                      </td>
                      <td className="num">{row.done.toLocaleString("en-IN")}</td>
                      <td className="num">
                        {row.pending > 0 ? (
                          <Badge tone="warn">{row.pending.toLocaleString("en-IN")}</Badge>
                        ) : (
                          row.pending.toLocaleString("en-IN")
                        )}
                      </td>
                      <td className="num">
                        {row.overdue > 0 ? (
                          <Badge tone="bad">{row.overdue.toLocaleString("en-IN")}</Badge>
                        ) : (
                          "0"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>All reviewers</td>
                    <td className="num">{allotted.toLocaleString("en-IN")}</td>
                    <td className="num">{done.toLocaleString("en-IN")}</td>
                    <td className="num">{pending.toLocaleString("en-IN")}</td>
                    <td className="num">{loads.reduce((sum, row) => sum + row.overdue, 0).toLocaleString("en-IN")}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </section>

      {selected ? (
        <Panel
          title={`Applications allotted to ${selected.name}`}
          note={`${selected.email}. ${plural(selected.allotted, "application")} allotted, ${plural(selected.done, "review")} done, ${plural(selected.pending, "review")} pending.`}
          actions={
            <Link className="adm-link" href="/admin/reviews">
              Close
            </Link>
          }
          flush
        >
          {assignments.length === 0 ? (
            <Empty title="Nothing allotted yet">This reviewer has no applications for this edition.</Empty>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table" data-testid="reviewer-assignments">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Applicant</th>
                    <th>Submission</th>
                    <th>Review</th>
                    <th className="num">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((review) => (
                    <tr key={review.id}>
                      <td className="adm-mono">{review.application.applicationNumber ?? "—"}</td>
                      <td>
                        <Link className="primary-link" href={`/admin/applications/${review.application.id}`}>
                          {review.application.name}
                        </Link>
                        <span className="adm-sub">{review.application.institution}</span>
                      </td>
                      <td>
                        {review.application.paperTitle || "Untitled submission"}
                        <span className="adm-sub">
                          {participationLabel(
                            review.application.participationCategory,
                            review.application.participationOther,
                          )}
                        </span>
                      </td>
                      <td>
                        <Badge tone={review.status === "COMPLETED" ? "good" : review.status === "IN_PROGRESS" ? "info" : "neutral"}>
                          {STATUS_LABEL[review.status]}
                        </Badge>
                        {review.status === "COMPLETED" || review.recommendation || review.decision ? (
                          <span className="adm-sub">{savedReviewChoiceLabel(review)}</span>
                        ) : null}
                      </td>
                      <td className="num">
                        {review.dueAt ? istDate(review.dueAt) : "—"}
                        {review.status !== "COMPLETED" && review.dueAt && review.dueAt < new Date() ? (
                          <span className="adm-sub">Overdue</span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      ) : loads.length > 0 ? (
        <p className="adm-hint">Select a reviewer to see the applications allotted to them.</p>
      ) : null}
    </div>
  );
}
