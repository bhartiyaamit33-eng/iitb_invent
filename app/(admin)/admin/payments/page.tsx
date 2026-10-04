import Form from "next/form";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { onlinePayConfig } from "@/lib/onlinepay";
import { formatInrFromPaise } from "@/lib/conference";
import { managePayment } from "./actions";
export const dynamic = "force-dynamic";
const input = "rounded border border-line px-3 py-2 text-sm";
const button =
  "rounded bg-teal-deep px-4 py-2 text-sm font-semibold text-white";
export default async function Payments({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    error?: string;
    saved?: string;
  }>;
}) {
  const query = await searchParams;
  const apps = await prisma.conferenceApplication.findMany({
    where: {
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { email: { contains: query.q, mode: "insensitive" } },
              { opTransId: { contains: query.q } },
            ],
          }
        : {}),
      ...(query.status &&
      ["PAID", "UNPAID", "REPORTED", "WAIVED", "NOT_REQUIRED"].includes(
        query.status,
      )
        ? { paymentStatus: query.status as "PAID" }
        : {}),
    },
    include: {
      paymentAttempts: {
        orderBy: { createdAt: "desc" },
        include: { events: { orderBy: { createdAt: "desc" } } },
      },
      receipt: true,
      coupon: true,
      edition: true,
      onlinePayAcks: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const [coupons, events, summary, pending] = await Promise.all([
    prisma.paymentCoupon.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.paymentEvent.findMany({
      include: { application: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.conferenceApplication.groupBy({
      by: ["paymentStatus"],
      _count: true,
      _sum: { paymentAmountPaise: true },
    }),
    prisma.onlinePayAck.count({ where: { ackedAt: null } }),
  ]);
  const cfg = onlinePayConfig();
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-sm text-mute">
        Admin ·{" "}
        {cfg
          ? `${cfg.env.toUpperCase()} application ${cfg.appId}`
          : "Gateway not configured"}
      </p>
      <h1
        className="mt-2 font-display text-4xl text-teal-deep"
        data-testid="payment-management"
      >
        Payment management
      </h1>
      <p className="mt-3 text-sm text-ink-soft">
        Track payments, settlement and refunds. Issue payment receipts now;
        official GST invoices come from IITB Accounts after the program ends.
      </p>
      {query.error && (
        <p role="alert" className="mt-4 rounded bg-red-50 p-3 text-red-800">
          {query.error}
        </p>
      )}
      {query.saved && (
        <p role="status" className="mt-4 rounded bg-green-50 p-3">
          Saved successfully.
        </p>
      )}
      <div className="my-6 grid gap-3 sm:grid-cols-3">
        {summary.map((row) => (
          <div
            key={row.paymentStatus}
            className="rounded-xl border border-line p-4"
          >
            <p className="text-sm">
              {row.paymentStatus} · {row._count}
            </p>
            <p className="text-2xl text-teal-deep">
              {formatInrFromPaise(row._sum.paymentAmountPaise || 0)}
            </p>
          </div>
        ))}
        <div className="rounded-xl border border-line p-4">
          {pending} acknowledgements awaiting confirmation
        </div>
      </div>
      <p className="mb-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm">
        Registration fees include GST: UG / PG / PhD students ₹5,000; faculty
        ₹10,000; industry ₹20,000. Do not add GST again. Official GST invoices
        come from IITB Accounts after the program ends.
      </p>
      <Form className="flex flex-wrap gap-3" action="/admin/payments">
        <input
          aria-label="Search payments"
          className={input}
          name="q"
          defaultValue={query.q}
          placeholder="Name, email or transaction ID"
        />
        <select
          aria-label="Payment status"
          name="status"
          defaultValue={query.status || ""}
          className={input}
        >
          <option value="">All statuses</option>
          {["UNPAID", "REPORTED", "PAID", "WAIVED", "NOT_REQUIRED"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button className={button}>Filter</button>
        <Link className={input} href="/api/admin/payments/export">
          Download payment ledger CSV
        </Link>
        <Link className={input} href="/api/admin/payments/export?events=1">
          Download all gateway activity
        </Link>
        <Link className={input} href="/api/admin/payments/export?accounts=1">
          Accounts GST list (after program)
        </Link>
      </Form>
      <section className="my-8 overflow-x-auto">
        <h2 className="mb-3 text-xl font-semibold">
          Registrations · latest 200
        </h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {[
                "Participant",
                "Amount / discount",
                "Payment / settlement",
                "Receipt / GST",
                "Coupon",
              ].map((h) => (
                <th className="border-b p-3" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr className="border-b" key={app.id}>
                <td className="p-3">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="font-semibold underline"
                  >
                    {app.name}
                  </Link>
                  <p>{app.email}</p>
                  <p className="text-mute">{app.edition.name}</p>
                </td>
                <td className="p-3">
                  {formatInrFromPaise(app.paymentAmountPaise)}
                  <p className="text-mute">
                    Discount {formatInrFromPaise(app.discountPaise)}
                    {app.coupon ? ` · ${app.coupon.code}` : ""}
                  </p>
                </td>
                <td className="p-3">
                  {app.paymentStatus}
                  <p>
                    {app.paymentAttempts[0]?.status || "No recorded attempt"}
                  </p>
                  <p>{app.opTransId}</p>
                  {app.paymentAttempts.length > 0 && (
                    <details className="mt-2">
                      <summary>
                        {app.paymentAttempts.length} payment attempt(s)
                      </summary>
                      {app.paymentAttempts.map((a) => (
                        <div key={a.id} className="my-2 border-l pl-2">
                          <p>
                            {a.environment.toUpperCase()} · {a.status}
                          </p>
                          <p>{a.requestId}</p>
                          <p>
                            {formatInrFromPaise(a.amountPaise)} · {a.userId}
                          </p>
                          <p>
                            {a.createdAt.toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                            })}
                          </p>
                          {a.events
                            .filter((e) => e.transId)
                            .map((e) => (
                              <p key={e.id}>
                                {e.kind}: {e.transId} · {e.outcome}
                              </p>
                            ))}
                        </div>
                      ))}
                    </details>
                  )}
                  {app.onlinePayAcks.some((a) => !a.ackedAt) && (
                    <p className="text-amber-800">ACK pending</p>
                  )}
                </td>
                <td className="p-3">
                  {app.paymentStatus === "PAID" && (
                    <Link
                      className="underline"
                      href={`/conference/pay/${app.paymentToken}/receipt`}
                    >
                      Open payment receipt
                    </Link>
                  )}
                  <p>
                    {app.gstInvoiceRef ||
                      (app.edition.endsAt > new Date()
                        ? "GST invoice after program"
                        : "Awaiting Accounts invoice")}
                  </p>
                  {app.edition.endsAt <= new Date() &&
                    app.paymentStatus === "PAID" && (
                      <form
                        action={managePayment}
                        className="mt-2 flex flex-col gap-2"
                      >
                        <input type="hidden" name="action" value="gst" />
                        <input
                          type="hidden"
                          name="applicationId"
                          value={app.id}
                        />
                        <input
                          aria-label={`GST invoice reference for ${app.name}`}
                          name="gstInvoiceRef"
                          className={input}
                          placeholder="Accounts invoice reference"
                          required
                        />
                        <input
                          aria-label={`GST invoice link for ${app.name}`}
                          name="gstInvoiceUrl"
                          className={input}
                          placeholder="HTTPS document link (optional)"
                        />
                        <button className={button}>
                          Record Accounts invoice
                        </button>
                      </form>
                    )}
                </td>
                <td className="p-3">
                  {app.paymentStatus === "UNPAID" && !app.opReqId ? (
                    <form action={managePayment} className="flex gap-2">
                      <input type="hidden" name="action" value="assign" />
                      <input
                        type="hidden"
                        name="applicationId"
                        value={app.id}
                      />
                      <select
                        aria-label={`Assign coupon to ${app.name}`}
                        name="code"
                        className={input}
                        required
                      >
                        <option value="">Choose coupon</option>
                        {coupons
                          .filter(
                            (c) =>
                              c.active &&
                              (!c.expiresAt || c.expiresAt > new Date()),
                          )
                          .map((c) => (
                            <option key={c.id}>{c.code}</option>
                          ))}
                      </select>
                      <button className={button}>Assign</button>
                    </form>
                  ) : (
                    "Fee locked"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!apps.length && <p className="p-4">No matching registrations.</p>}
      </section>
      <section className="rounded-xl border border-line p-5">
        <h2 className="text-xl font-semibold">Coupons and discounts</h2>
        <p className="my-2 text-sm">
          Assign before checkout starts. Fixed amounts are in rupees. Use the
          application fee waiver for a full waiver.
        </p>
        <form action={managePayment} className="flex flex-wrap gap-3">
          <input type="hidden" name="action" value="coupon" />
          <input
            aria-label="Coupon code"
            name="code"
            required
            placeholder="Coupon code"
            className={input}
          />
          <select aria-label="Discount type" name="kind" className={input}>
            <option value="PERCENT">Percentage</option>
            <option value="FIXED">Fixed rupees</option>
          </select>
          <input
            aria-label="Discount value"
            name="value"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="Discount value"
            className={input}
          />
          <input
            aria-label="Coupon expiry"
            type="date"
            name="expiresAt"
            className={input}
          />
          <button className={button}>Create coupon</button>
        </form>
        <ul className="mt-4 space-y-2">
          {coupons.map((c) => (
            <li key={c.id} className="flex items-center gap-4">
              <strong>{c.code}</strong>{" "}
              {c.kind === "PERCENT"
                ? `${c.value}%`
                : formatInrFromPaise(c.value)}{" "}
              · {c.active ? "Active" : "Disabled"}
              {c.active && (
                <form action={managePayment}>
                  <input type="hidden" name="action" value="disable" />
                  <input type="hidden" name="couponId" value={c.id} />
                  <button className="text-sm underline">Disable</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8 overflow-x-auto">
        <h2 className="mb-3 text-xl font-semibold">
          Gateway activity · latest 100 notices
        </h2>
        <p className="mb-3 text-sm">
          Includes validation failures and rejected callbacks. Historic attempts
          before this dashboard was installed may have no notice history.
        </p>
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {[
                "Time (IST)",
                "Participant",
                "Type",
                "Outcome",
                "Request / transaction",
                "Amount / reason",
              ].map((h) => (
                <th className="border-b p-2" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b">
                <td className="p-2">
                  {e.createdAt.toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                </td>
                <td className="p-2">{e.application?.name || "Unmatched"}</td>
                <td className="p-2">{e.kind}</td>
                <td className="p-2">{e.outcome}</td>
                <td className="p-2">
                  {e.requestId}
                  <br />
                  {e.transId}
                </td>
                <td className="p-2">
                  {e.amount}
                  <br />
                  {e.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
