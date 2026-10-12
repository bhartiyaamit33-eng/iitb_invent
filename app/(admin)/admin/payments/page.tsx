import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatInrFromPaise } from "@/lib/conference";
import { gatewayStatusLabel } from "@/lib/conference-payment";
import { ackConfirmed, gatewayUrl, onlinePayConfig, rupeesToPaise } from "@/lib/onlinepay";
import { withBasePath } from "@/lib/base-path";
import { gatewayTone, istDateTime, plural } from "@/lib/admin/format";
import { Badge, Empty, Notice, PageHeader } from "@/components/admin/ui";
import { recheckPayment } from "./actions";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string; where: Prisma.GatewayPaymentWhereInput }[] = [
  { key: "all", label: "All", where: {} },
  { key: "paid", label: "Confirmed", where: { verified: true } },
  { key: "unconfirmed", label: "Not confirmed", where: { verified: false, imtStatus: { in: ["S", "DIRECT_RECON"] } } },
  { key: "failed", label: "Failed", where: { verified: false, imtStatus: "F" } },
  { key: "unmatched", label: "No matching registration", where: { applicationId: null } },
];

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; state?: string; msg?: string }>;
}) {
  const { q, state, msg } = await searchParams;
  const search = q?.trim() ?? "";
  const current = FILTERS.find((f) => f.key === state) ?? FILTERS[0]!;
  const searchWhere: Prisma.GatewayPaymentWhereInput = search
    ? {
        OR: [
          { transId: { contains: search } },
          { payerId: { contains: search, mode: "insensitive" } },
          { refNo: { contains: search } },
          { application: { name: { contains: search, mode: "insensitive" } } },
          { application: { email: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};

  const [payments, counts, confirmed, due] = await Promise.all([
    prisma.gatewayPayment.findMany({
      where: { AND: [searchWhere, current.where] },
      include: { application: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    Promise.all(FILTERS.map((f) => prisma.gatewayPayment.count({ where: { AND: [searchWhere, f.where] } }))),
    prisma.gatewayPayment.findMany({ where: { verified: true }, select: { amount: true, applicationId: true } }),
    prisma.conferenceApplication.count({
      where: {
        paymentStatus: "UNPAID",
        status: { in: ["SHORTLISTED_PAPER", "SHORTLISTED_POSTER", "ATTENDEE"] },
        edition: { isCurrent: true },
      },
    }),
  ]);

  const collected = confirmed.reduce((sum, p) => sum + (rupeesToPaise(p.amount) ?? 0), 0);
  const perApplication = new Map<string, number>();
  for (const p of confirmed) {
    if (p.applicationId) perApplication.set(p.applicationId, (perApplication.get(p.applicationId) ?? 0) + 1);
  }
  const paidTwice = new Set([...perApplication].filter(([, n]) => n > 1).map(([id]) => id));
  const cfg = onlinePayConfig();
  const tabHref = (key: string) => {
    const params = new URLSearchParams();
    if (key !== "all") params.set("state", key);
    if (search) params.set("q", search);
    const s = params.toString();
    return `/admin/payments${s ? `?${s}` : ""}`;
  };

  return (
    <div className="adm-page">
      <PageHeader
        title="Payments"
        testId="payment-management"
        description={
          <>
            Every IIT Bombay OnlinePay transaction, one row each. A payment counts once the
            gateway confirms it; that marks the registration paid, issues the ticket and emails
            the receipt. {cfg ? `Gateway app ${cfg.appId}.` : `Online payment is off: no usable app ID is set (gateway ${gatewayUrl()}).`}
          </>
        }
        actions={
          <a className="adm-btn" href={withBasePath("/api/admin/payments/export")}>
            Download CSV
          </a>
        }
      />

      {msg ? <Notice>{msg}</Notice> : null}
      {paidTwice.size > 0 ? (
        <Notice tone="bad">
          {plural(paidTwice.size, "registration")} paid more than once. Arrange refunds of the extra transactions.
        </Notice>
      ) : null}

      <dl className="adm-figures">
        <div>
          <dt>Collected online</dt>
          <dd>{formatInrFromPaise(collected)}</dd>
        </div>
        <div>
          <dt>Confirmed payments</dt>
          <dd>{counts[1]}</dd>
        </div>
        <div>
          <dt>Waiting for gateway confirmation</dt>
          <dd>{counts[2]}</dd>
        </div>
        <div>
          <dt>Selected, fee still due</dt>
          <dd>{due}</dd>
        </div>
      </dl>

      <section className="adm-panel is-flush">
        <div className="adm-panel-body" style={{ paddingTop: 14 }}>
          <div className="adm-toolbar">
            <nav className="adm-tabs" aria-label="Filter payments">
              {FILTERS.map((f, i) => (
                <Link key={f.key} href={tabHref(f.key)} aria-current={f.key === current.key ? "true" : undefined}>
                  {f.label} <span className="count">{counts[i]}</span>
                </Link>
              ))}
            </nav>
            <form className="adm-search" role="search">
              {current.key !== "all" ? <input type="hidden" name="state" value={current.key} /> : null}
              <input
                className="adm-input"
                name="q"
                defaultValue={search}
                placeholder="Name, email, registration or transaction ID"
                aria-label="Search payments"
              />
              <button type="submit" className="adm-btn">
                Search
              </button>
            </form>
          </div>

          {payments.length === 0 ? (
            <Empty title={counts[0] === 0 && !search ? "No payments yet" : "Nothing in this view"}>
              {counts[0] === 0 && !search
                ? "Transactions appear here as soon as the gateway reports them."
                : "Try another tab or clear the search."}
            </Empty>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Received</th>
                    <th>Participant</th>
                    <th className="num">Amount</th>
                    <th>Status</th>
                    <th>Transaction</th>
                    <th>Reconciliation</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const recheckable =
                      (p.imtStatus === "S" && !ackConfirmed(p.imtAck)) ||
                      (p.reconStatus === "RECONCILED" && !ackConfirmed(p.reconAck));
                    return (
                      <tr key={p.transId}>
                        <td style={{ whiteSpace: "nowrap" }}>{istDateTime(p.createdAt)}</td>
                        <td style={{ minWidth: 220 }}>
                          {p.application ? (
                            <>
                              <Link className="primary-link" href={`/admin/applications/${p.application.id}`}>
                                {p.application.name}
                              </Link>
                              <span className="adm-sub">{p.application.email}</span>
                            </>
                          ) : (
                            <Badge tone="bad">No matching registration</Badge>
                          )}
                          <span className="adm-sub adm-mono">{p.payerId}</span>
                        </td>
                        <td className="num">
                          {rupeesToPaise(p.amount) === null ? `₹${p.amount}` : formatInrFromPaise(rupeesToPaise(p.amount)!)}
                        </td>
                        <td>
                          <span title={[p.imtAck, p.reconAck].filter(Boolean).join(" | ")}>
                            <Badge tone={gatewayTone(p)}>{gatewayStatusLabel(p)}</Badge>
                          </span>
                          {p.application && paidTwice.has(p.application.id) && p.verified ? (
                            <span className="adm-sub" style={{ color: "var(--adm-bad)" }}>
                              Paid more than once
                            </span>
                          ) : null}
                          {recheckable ? (
                            <form action={recheckPayment} style={{ marginTop: 6 }}>
                              <input type="hidden" name="transId" value={p.transId} />
                              <button className="adm-btn is-quiet is-small" style={{ paddingLeft: 0 }}>
                                Re-check with gateway
                              </button>
                            </form>
                          ) : null}
                        </td>
                        <td>
                          <span className="adm-mono">{p.transId}</span>
                          {p.refNo ? <span className="adm-sub">Bank reference {p.refNo}</span> : null}
                          {p.provId ? <span className="adm-sub">Mode {p.provId}</span> : null}
                          {p.imtDate || p.imtTime ? (
                            <span className="adm-sub">Paid {[p.imtDate, p.imtTime].filter(Boolean).join(" ")}</span>
                          ) : null}
                        </td>
                        <td>
                          {p.reconStatus ? (
                            <>
                              Reconciled
                              {p.reconStamp ? <span className="adm-sub">{p.reconStamp}</span> : null}
                            </>
                          ) : (
                            <span className="adm-sub" style={{ marginTop: 0, whiteSpace: "nowrap" }}>Not yet</span>
                          )}
                        </td>
                        <td>
                          {p.receiptMailedAt ? (
                            <>
                              Emailed
                              <span className="adm-sub">{istDateTime(p.receiptMailedAt)}</span>
                            </>
                          ) : (
                            <span className="adm-sub" style={{ marginTop: 0, whiteSpace: "nowrap" }}>Not sent</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
