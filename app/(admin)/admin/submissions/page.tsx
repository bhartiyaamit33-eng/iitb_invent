import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  CATEGORY_LABEL,
  FEE_INR,
  formatInr,
  KIND_LABEL,
  PAYMENT_STATUS_LABEL,
  SUBMISSION_STATUS_LABEL,
} from "@/lib/payments/pricing";
import { onlinePayConfig } from "@/lib/payments/onlinepay";
import {
  adminCreateSubmissionAction,
  approveAndSendPaymentAction,
  rejectSubmissionAction,
} from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  sent?: string;
  rejected?: string;
  created?: string;
  error?: string;
  mail?: string;
}>;

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const cfg = onlinePayConfig();
  const submissions = await prisma.submission.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, email: true, id: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">
        Submissions
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Accept a paper, poster, or workshop, then send the IIT Bombay Online Pay
        link. Fees: students {formatInr(FEE_INR.STUDENT)}, faculty{" "}
        {formatInr(FEE_INR.FACULTY)}, corporate {formatInr(FEE_INR.CORPORATE)}.
      </p>
      <p className="mt-2 text-sm">
        <Link href="/admin/payments" className="font-semibold text-teal-deep underline-offset-2 hover:underline">
          Open payments ledger →
        </Link>
      </p>

      {!cfg.appId && !cfg.mock ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          ONLINEPAY_APP_ID is not set. You can still accept submissions; live
          checkout needs the app id from ASC.
        </p>
      ) : null}
      {cfg.mock ? (
        <p className="mt-4 rounded-md border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal-deep">
          ONLINEPAY_ENV=mock — the pay page records a success without talking to
          IITB Online Pay.
        </p>
      ) : null}

      {params.sent ? (
        <p className="mt-4 rounded-md border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal-deep" role="status">
          Accepted and payment link queued.
          {params.mail ? ` Email: ${params.mail}` : ""}
        </p>
      ) : null}
      {params.created ? (
        <p className="mt-4 rounded-md border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal-deep" role="status">
          Submission created.
        </p>
      ) : null}
      {params.rejected ? (
        <p className="mt-4 rounded-md border border-line bg-white px-4 py-3 text-sm text-ink-soft" role="status">
          Marked as not accepted.
        </p>
      ) : null}
      {params.error === "user" ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          No account with that email. They need to sign up first.
        </p>
      ) : null}

      <section className="mt-8 rounded-xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-mute">
          Create for an existing user
        </h2>
        <form action={adminCreateSubmissionAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            name="email"
            type="email"
            required
            placeholder="Author email"
            className="rounded-md border border-line px-3 py-2"
          />
          <select name="kind" className="rounded-md border border-line px-3 py-2" defaultValue="PAPER">
            <option value="PAPER">Paper</option>
            <option value="POSTER">Poster</option>
            <option value="WORKSHOP">Workshop</option>
          </select>
          <select
            name="payerCategory"
            className="rounded-md border border-line px-3 py-2"
            defaultValue="STUDENT"
          >
            <option value="STUDENT">Student {formatInr(5000)}</option>
            <option value="FACULTY">Faculty {formatInr(10000)}</option>
            <option value="CORPORATE">Corporate {formatInr(15000)}</option>
          </select>
          <input
            name="organisation"
            placeholder="Organisation"
            className="rounded-md border border-line px-3 py-2"
          />
          <input
            name="title"
            required
            placeholder="Title"
            className="sm:col-span-2 rounded-md border border-line px-3 py-2"
          />
          <textarea
            name="abstract"
            placeholder="Abstract"
            rows={2}
            className="sm:col-span-2 rounded-md border border-line px-3 py-2"
          />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" name="sendLink" />
            Accept now and email the payment link
          </label>
          <button
            type="submit"
            className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white sm:col-span-2"
          >
            Create
          </button>
        </form>
      </section>

      <div className="mt-8 space-y-4">
        {submissions.length === 0 ? (
          <p className="text-sm text-ink-soft">No submissions yet.</p>
        ) : (
          submissions.map((s) => {
            const pay = s.payments[0];
            return (
              <article
                key={s.id}
                className="rounded-xl border border-line bg-white p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
                  {KIND_LABEL[s.kind]} · {SUBMISSION_STATUS_LABEL[s.status]} ·{" "}
                  {CATEGORY_LABEL[s.payerCategory]}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-ink">{s.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  {s.user.name} · {s.user.email} · user id {s.user.id}
                </p>
                {s.abstract ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">
                    {s.abstract}
                  </p>
                ) : null}
                {s.fileUrl ? (
                  <a
                    href={s.fileUrl}
                    className="mt-2 inline-block text-sm font-semibold text-teal-deep underline"
                  >
                    Download file
                  </a>
                ) : null}
                {pay ? (
                  <p className="mt-2 text-sm text-ink-soft">
                    Payment {PAYMENT_STATUS_LABEL[pay.status]} ·{" "}
                    {formatInr(pay.amount.toString())} · req {pay.reqId}
                    {pay.transId ? ` · trans ${pay.transId}` : ""}
                    {" · "}
                    <Link
                      href={`/pay/${pay.payToken}`}
                      className="font-semibold text-teal-deep underline"
                    >
                      payment page
                    </Link>
                  </p>
                ) : null}

                {s.status === "SUBMITTED" || s.status === "APPROVED" ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <form action={approveAndSendPaymentAction} className="space-y-2">
                      <input type="hidden" name="id" value={s.id} />
                      <select
                        name="payerCategory"
                        defaultValue={s.payerCategory}
                        className="w-full rounded-md border border-line px-3 py-2 text-sm"
                      >
                        <option value="STUDENT">Student {formatInr(5000)}</option>
                        <option value="FACULTY">Faculty {formatInr(10000)}</option>
                        <option value="CORPORATE">Corporate {formatInr(15000)}</option>
                      </select>
                      <input
                        name="reviewNote"
                        placeholder="Note to keep on file"
                        defaultValue={s.reviewNote ?? ""}
                        className="w-full rounded-md border border-line px-3 py-2 text-sm"
                      />
                      <button
                        type="submit"
                        data-testid="approve-send-button"
                        className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
                      >
                        Accept and send payment link
                      </button>
                    </form>
                    {s.status === "SUBMITTED" ? (
                      <form action={rejectSubmissionAction} className="space-y-2">
                        <input type="hidden" name="id" value={s.id} />
                        <textarea
                          name="reviewNote"
                          placeholder="Reason (optional)"
                          rows={3}
                          className="w-full rounded-md border border-line px-3 py-2 text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700"
                        >
                          Not accepted
                        </button>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
