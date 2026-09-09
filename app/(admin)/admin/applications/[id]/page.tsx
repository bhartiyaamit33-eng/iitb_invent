import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  DEFAULT_CONFERENCE_FEE_PAISE,
  applicationStatusLabel,
  needsPhdYear,
  participationLabel,
  phdYearLabel,
  postdocLabel,
  professionalLabel,
} from "@/lib/conference";
import { conferencePaymentUrl } from "@/lib/conference-server";
import { ApplicationReviewDialog } from "@/components/admin/ApplicationReviewDialog";
import { ApplicationPaymentPanel } from "@/components/admin/ApplicationPaymentPanel";

export const dynamic = "force-dynamic";

function istDate(d: Date): string {
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await prisma.conferenceApplication.findUnique({
    where: { id },
    include: { edition: { select: { name: true, year: true } } },
  });
  if (!application) notFound();

  const pdfUrl = application.abstractViewToken
    ? `/api/conference/abstract/${application.abstractViewToken}`
    : null;

  const rows: [string, string][] = [
    ["Edition", `${application.edition.name} (${application.edition.year})`],
    ["Name", application.name],
    ["Email", application.email],
    ["Phone", application.phone],
    ["Institution", application.institution],
    [
      "Professional category",
      professionalLabel(
        application.professionalCategory,
        application.professionalOther,
      ),
    ],
    ...(needsPhdYear(application.professionalCategory)
      ? ([["PhD year", phdYearLabel(application.phdYear)]] as [string, string][])
      : []),
    ["Seeking post-doc", postdocLabel(application.seekingPostdoc)],
    [
      "Participation",
      participationLabel(
        application.participationCategory,
        application.participationOther,
      ),
    ],
    ["Proposed title", application.paperTitle ?? "—"],
    ["Send copy of responses", application.sendCopy ? "Yes" : "No"],
    ["Submitted", istDate(application.createdAt)],
    ["Updated", istDate(application.updatedAt)],
    ["Status", applicationStatusLabel(application.status)],
  ];

  return (
    <main className="px-6 py-10">
      <p className="text-sm text-mute">
        <Link
          href="/admin/applications"
          className="underline-offset-2 hover:underline"
        >
          ← All applications
        </Link>
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        {application.name}
      </h1>
      <p className="mt-1 text-ink-soft">{application.email}</p>

      <dl className="mt-8 divide-y divide-line rounded-xl border border-line bg-white">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
              {k}
            </dt>
            <dd className="text-sm text-ink sm:col-span-2">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded-xl border border-line bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
          Extended abstract
        </p>
        {pdfUrl ? (
          <>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
                data-testid="view-pdf"
              >
                View PDF
              </a>
              <a
                href={`${pdfUrl}?download=1`}
                className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-teal-deep"
              >
                Download {application.abstractFileName || "PDF"}
              </a>
            </div>
            <iframe
              title="Extended abstract"
              src={pdfUrl}
              className="mt-4 h-[70vh] w-full rounded-md border border-line bg-paper"
              data-testid="abstract-preview"
            />
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">No abstract uploaded.</p>
        )}
      </div>

      <div className="mt-4">
        <ApplicationPaymentPanel
          id={application.id}
          paymentStatus={application.paymentStatus}
          paymentAmountPaise={
            application.paymentAmountPaise || DEFAULT_CONFERENCE_FEE_PAISE
          }
          paymentUrl={conferencePaymentUrl(application.paymentToken)}
          paymentRef={application.paymentRef}
          paidAt={application.paidAt ? istDate(application.paidAt) : null}
        />
      </div>

      <div className="mt-6 rounded-xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-mute">
          Review
        </h2>
        <div className="mt-3">
          <ApplicationReviewDialog
            id={application.id}
            name={application.name}
            currentStatus={application.status}
            adminNotes={application.adminNotes ?? ""}
            feePaise={
              application.paymentAmountPaise || DEFAULT_CONFERENCE_FEE_PAISE
            }
          />
        </div>
      </div>
    </main>
  );
}
