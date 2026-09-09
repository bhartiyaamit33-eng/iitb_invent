import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { isS3Configured } from "@/lib/s3";
import {
  CATEGORY_LABEL,
  FEE_INR,
  formatInr,
  KIND_LABEL,
  PAYMENT_STATUS_LABEL,
  SUBMISSION_STATUS_LABEL,
} from "@/lib/payments/pricing";
import {
  createSubmissionAction,
  withdrawSubmissionAction,
} from "./actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ submitted?: string; error?: string }>;

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/dashboard/submissions");
  }

  const params = await searchParams;
  const mine = await prisma.submission.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  const s3Ready = isS3Configured();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Dashboard
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Papers, posters &amp; workshops
      </h1>
      <p className="mt-3 text-ink-soft">
        Submit a contribution. After the organisers accept it, you will get an
        email with a payment link. Fees are collected through IIT Bombay Online
        Pay into an IITB account.
      </p>

      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {(
          [
            ["STUDENT", "Students"],
            ["FACULTY", "Faculty"],
            ["CORPORATE", "Corporate / industry"],
          ] as const
        ).map(([key, label]) => (
          <li
            key={key}
            className="rounded-xl border border-line bg-white px-4 py-3"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
              {label}
            </p>
            <p className="mt-1 text-xl font-semibold text-teal-deep">
              {formatInr(FEE_INR[key])}
            </p>
          </li>
        ))}
      </ul>

      {params.submitted ? (
        <p
          className="mt-6 rounded-md border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal-deep"
          role="status"
        >
          Submitted. We will email you a payment link if it is accepted.
        </p>
      ) : null}
      {params.error === "invalid" ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          Choose a type, a fee category, and a title of at least 3 characters.
        </p>
      ) : null}
      {params.error === "upload" ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          File upload failed. PDF or Word, under 12 MB.
        </p>
      ) : null}

      <section className="mt-10 rounded-xl border border-line bg-white p-5">
        <h2 className="font-semibold text-ink">New submission</h2>
        <form
          action={createSubmissionAction}
          className="mt-4 grid gap-3"
          data-testid="submit-contribution-form"
        >
          <label className="block text-sm">
            Type
            <select
              name="kind"
              required
              data-testid="submission-kind"
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              defaultValue="PAPER"
            >
              <option value="PAPER">Paper presentation</option>
              <option value="POSTER">Poster presentation</option>
              <option value="WORKSHOP">Workshop</option>
            </select>
          </label>
          <label className="block text-sm">
            You are paying as
            <select
              name="payerCategory"
              required
              data-testid="payer-category"
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              defaultValue="STUDENT"
            >
              <option value="STUDENT">Student — {formatInr(5000)}</option>
              <option value="FACULTY">Faculty — {formatInr(10000)}</option>
              <option value="CORPORATE">
                Corporate / industry — {formatInr(15000)}
              </option>
            </select>
          </label>
          <label className="block text-sm">
            Title
            <input
              name="title"
              required
              minLength={3}
              maxLength={200}
              data-testid="submission-title"
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
              placeholder="Title of paper, poster, or workshop"
            />
          </label>
          <label className="block text-sm">
            Authors (if more than you)
            <input
              name="authors"
              maxLength={300}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Organisation / institute
            <input
              name="organisation"
              maxLength={200}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Abstract / description
            <textarea
              name="abstract"
              rows={4}
              className="mt-1 w-full rounded-md border border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            File (optional PDF or Word)
            <input
              type="file"
              name="file"
              accept=".pdf,.doc,.docx,application/pdf"
              disabled={!s3Ready}
              className="mt-1 w-full text-sm"
            />
            {!s3Ready ? (
              <span className="mt-1 block text-xs text-mute">
                File upload is not configured on this server. Title and abstract
                are enough.
              </span>
            ) : null}
          </label>
          <button
            type="submit"
            data-testid="submit-contribution"
            className="rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
          >
            Submit for review
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl tracking-wide text-teal-deep">
          Your submissions
        </h2>
        {mine.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">None yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {mine.map((s) => {
              const pay = s.payments[0];
              return (
                <li
                  key={s.id}
                  className="rounded-xl border border-line bg-white p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
                    {KIND_LABEL[s.kind]} · {CATEGORY_LABEL[s.payerCategory]}
                  </p>
                  <h3 className="mt-1 font-semibold text-ink">{s.title}</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    {SUBMISSION_STATUS_LABEL[s.status]}
                    {pay
                      ? ` · ${PAYMENT_STATUS_LABEL[pay.status]} · ${formatInr(pay.amount.toString())}`
                      : ""}
                  </p>
                  {pay && (pay.status === "PENDING" || pay.status === "IN_FLIGHT") ? (
                    <Link
                      href={`/pay/${pay.payToken}`}
                      className="mt-3 inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
                    >
                      Open payment page →
                    </Link>
                  ) : null}
                  {pay && (pay.status === "SUCCESS" || pay.status === "SETTLED") ? (
                    <Link
                      href={`/pay/${pay.payToken}/receipt`}
                      className="mt-3 inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
                    >
                      View receipt →
                    </Link>
                  ) : null}
                  {s.status === "SUBMITTED" ? (
                    <form action={withdrawSubmissionAction} className="mt-3">
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="text-sm font-semibold text-red-700 hover:underline"
                      >
                        Withdraw
                      </button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
