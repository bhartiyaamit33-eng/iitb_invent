import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  CATEGORY_LABEL,
  formatInr,
  KIND_LABEL,
  PAYMENT_STATUS_LABEL,
  isPaidStatus,
} from "@/lib/payments/pricing";
import {
  resendInvoiceAction,
  resendPaymentLinkAction,
} from "../submissions/actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  link?: string;
  invoice?: string;
  error?: string;
}>;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      user: { select: { id: true, name: true, email: true } },
      submission: { select: { title: true, kind: true } },
    },
  });

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">
        Payments
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Every Online Pay request id, IITB transaction id, bank reference, and
        invoice. Export includes the full field set.
      </p>

      {params.link ? (
        <p className="mt-4 rounded-md border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal-deep" role="status">
          Payment link emailed.
        </p>
      ) : null}
      {params.invoice ? (
        <p className="mt-4 rounded-md border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal-deep" role="status">
          Invoice emailed again.
        </p>
      ) : null}
      {params.error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {params.error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/api/admin/payments/export"
          data-testid="payments-export"
          className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-teal-deep hover:border-teal"
        >
          Export CSV
        </a>
        <Link
          href="/admin/submissions"
          className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-teal-deep hover:border-teal"
        >
          Submissions
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-[0.1em] text-mute">
            <tr>
              <th className="px-3 py-3">Invoice</th>
              <th className="px-3 py-3">Payer</th>
              <th className="px-3 py-3">Purpose</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Ids</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-ink-soft" colSpan={7}>
                  No payments yet.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0 align-top">
                  <td className="px-3 py-3">
                    <div className="font-medium">{p.invoiceNumber ?? "—"}</div>
                    <div className="text-xs text-mute">
                      {p.createdAt.toISOString().slice(0, 10)}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium">{p.user.name}</div>
                    <div className="text-xs text-ink-soft">{p.user.email}</div>
                    <div className="text-xs text-mute">
                      {CATEGORY_LABEL[p.payerCategory]}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      {KIND_LABEL[p.submission.kind]} — {p.submission.title}
                    </div>
                    <div className="text-xs text-mute">{p.purpose}</div>
                  </td>
                  <td className="px-3 py-3 font-semibold text-teal-deep">
                    {formatInr(p.amount.toString())}
                  </td>
                  <td className="px-3 py-3">{PAYMENT_STATUS_LABEL[p.status]}</td>
                  <td className="px-3 py-3 font-mono text-xs text-ink-soft">
                    <div>user {p.user.id}</div>
                    <div>op {p.opUserId}</div>
                    <div>req {p.reqId}</div>
                    <div>app {p.appId || "—"}</div>
                    <div>trans {p.transId ?? "—"}</div>
                    <div>ref {p.refNo ?? "—"}</div>
                    <div>prov {p.provId ?? "—"}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/pay/${p.payToken}`}
                        className="text-xs font-semibold text-teal-deep underline"
                      >
                        Pay page
                      </Link>
                      {isPaidStatus(p.status) && p.invoiceNumber ? (
                        <a
                          href={`/pay/${p.payToken}/invoice`}
                          className="text-xs font-semibold text-teal-deep underline"
                        >
                          Invoice PDF
                        </a>
                      ) : null}
                      {p.status === "PENDING" || p.status === "IN_FLIGHT" || p.status === "FAILED" ? (
                        <form action={resendPaymentLinkAction}>
                          <input type="hidden" name="paymentId" value={p.id} />
                          <button
                            type="submit"
                            className="text-xs font-semibold text-teal-deep underline"
                          >
                            Resend link
                          </button>
                        </form>
                      ) : null}
                      {isPaidStatus(p.status) ? (
                        <form action={resendInvoiceAction}>
                          <input type="hidden" name="paymentId" value={p.id} />
                          <button
                            type="submit"
                            className="text-xs font-semibold text-teal-deep underline"
                          >
                            Resend invoice
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
