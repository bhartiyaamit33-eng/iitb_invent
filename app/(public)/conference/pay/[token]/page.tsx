import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureApplicationNumbers } from "@/lib/application-number";
import { prisma } from "@/lib/db";
import {
  GST_PERCENT,
  applicationStatusLabel,
  formatInrFromPaise,
  gstPaise,
  professionalLabel,
} from "@/lib/conference";
import {
  applicationFeeDue,
  applicationPaymentVisible,
} from "@/lib/conference-access";
import {
  ensurePayerId,
  gatewayStatusLabel,
  payableAmountPaise,
} from "@/lib/conference-payment";
import {
  newRequestId,
  onlinePayConfig,
  paymentRequestUrl,
  rupeesToPaise,
} from "@/lib/onlinepay";
import { noIndex } from "@/lib/seo";
import { GatewayHandoffButton, RememberPaymentToken } from "../PayActions";

export const dynamic = "force-dynamic";

// The token is in this page's URL; the gateway gets the origin only.
export const metadata: Metadata = { ...noIndex, referrer: "origin" };

const RESULT_COPY: Record<string, { tone: "ok" | "warn" | "bad"; text: string }> = {
  S: {
    tone: "ok",
    text: "Payment received. Your receipt has been emailed to you.",
  },
  P: {
    tone: "warn",
    text: "IIT Bombay OnlinePay reported success, but the gateway has not confirmed the transaction to us yet. Do not pay again. We will confirm it and email your receipt.",
  },
  F: {
    tone: "bad",
    text: "Payment not completed. If your account was debited, do not retry: allow two working days for reconciliation, then write to support@iitbinvent.com quoting the transaction ID.",
  },
};

const TONE = {
  ok: "border-green-200 bg-green-50 text-green-900",
  warn: "border-amber-200 bg-amber-50 text-amber-900",
  bad: "border-red-200 bg-red-50 text-red-900",
} as const;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
        {label}
      </dt>
      <dd className="break-all text-sm text-ink">{children}</dd>
    </div>
  );
}

export default async function ConferencePayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ result?: string; txn?: string; registered?: string }>;
}) {
  const { token } = await params;
  const { result, txn, registered } = await searchParams;
  await ensureApplicationNumbers();
  const application = await prisma.conferenceApplication.findUnique({
    where: { paymentToken: token },
    include: {
      edition: { select: { name: true, year: true } },
      gatewayPayments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!application) notFound();

  const visible = applicationPaymentVisible(application);
  const due = applicationFeeDue(application);
  const amountPaise = payableAmountPaise(application);
  const amount = formatInrFromPaise(amountPaise);
  const paid = application.gatewayPayments.find((p) => p.verified);
  const unconfirmed = application.gatewayPayments.find(
    (p) => !p.verified && (p.imtStatus === "S" || p.imtStatus === "DIRECT_RECON"),
  );

  const cfg = onlinePayConfig();
  let payerId = application.payerId;
  let payUrl: string | null = null;
  if (due && cfg) {
    payerId = await ensurePayerId(application);
    payUrl = paymentRequestUrl(cfg, {
      payerId,
      payerName: application.name,
      amountPaise,
      reqId: newRequestId(),
    });
  }

  const notice = result ? RESULT_COPY[result] : undefined;

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <RememberPaymentToken token={application.paymentToken} />
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        {application.edition.name} · Research Conference
      </p>
      <h1
        className="mt-2 font-display text-4xl tracking-wide text-teal-deep"
        data-testid="conference-pay"
      >
        Registration payment
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Application status: {applicationStatusLabel(application.status)}
      </p>
      {application.applicationNumber ? (
        <p className="mt-2 text-sm font-semibold text-ink" data-testid="application-number">
          Application number {application.applicationNumber}
        </p>
      ) : null}

      {registered && !notice ? (
        <div className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900" role="status" data-testid="registration-complete">
          Registration complete. Your proforma invoice is on its way to {application.email}.
          Pay below to confirm your place.
        </div>
      ) : null}

      {notice ? (
        <div
          className={`mt-6 rounded-md border px-4 py-3 text-sm ${TONE[notice.tone]}`}
          role="status"
          data-testid="payment-result"
        >
          {notice.text}
          {txn ? <span className="mt-1 block font-mono text-xs">Transaction ID: {txn}</span> : null}
        </div>
      ) : null}

      {!visible ? (
        <section className="mt-8 rounded-xl border border-line bg-white p-6">
          <p className="text-sm text-ink-soft" data-testid="pay-awaiting-decision">
            Hi {application.name}. Organisers still need to select you for a
            paper, a poster, or as an attendee. The fee for your category and the
            payment button will appear here after that decision.
          </p>
        </section>
      ) : application.paymentStatus === "WAIVED" ? (
        <section className="mt-8 rounded-xl border border-line bg-white p-6">
          <p className="text-sm text-ink">
            Hi {application.name}. Your registration fee has been waived. You do
            not need to pay. Your ticket is on your dashboard.
          </p>
        </section>
      ) : application.paymentStatus === "PAID" ? (
        <section className="mt-8 rounded-xl border border-line bg-white p-6" data-testid="payment-paid">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
            Payment received
          </p>
          <dl className="mt-3 divide-y divide-line border-y border-line">
            <Row label="Name">{application.name}</Row>
            {payerId ? <Row label="Registration ID">{payerId}</Row> : null}
            {paid ? (
              <>
                <Row label="Amount paid">
                  {formatInrFromPaise(rupeesToPaise(paid.amount) ?? amountPaise)}
                  {rupeesToPaise(paid.amount) === amountPaise ? ` · includes ${GST_PERCENT}% GST` : ""}
                </Row>
                <Row label="Transaction ID">{paid.transId}</Row>
                {paid.refNo ? <Row label="Bank reference">{paid.refNo}</Row> : null}
                <Row label="Paid on">
                  {[paid.imtDate, paid.imtTime].filter(Boolean).join(" ") || paid.reconStamp || "—"}
                </Row>
              </>
            ) : (
              <Row label="Reference">{application.paymentRef || "Recorded by the organisers"}</Row>
            )}
          </dl>
          <Link
            className="mt-4 inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
            href={`/conference/pay/${encodeURIComponent(token)}/receipt`}
          >
            Print payment receipt
          </Link>
        </section>
      ) : due ? (
        <section className="mt-8 rounded-xl border border-line bg-white p-6">
          {unconfirmed ? (
            <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              We have a payment response for transaction{" "}
              <span className="font-mono">{unconfirmed.transId}</span> (
              {gatewayStatusLabel(unconfirmed).toLowerCase()}). If you were
              charged, do not pay again. Write to support@iitbinvent.com quoting
              that ID.
            </p>
          ) : null}
          <dl className="divide-y divide-line border-y border-line">
            <Row label="Name">{application.name}</Row>
            {payerId ? <Row label="Registration ID">{payerId}</Row> : null}
            <Row label="Category">
              {professionalLabel(application.professionalCategory, application.professionalOther)}
            </Row>
            <Row label="Subtotal">{formatInrFromPaise(application.paymentAmountPaise)}</Row>
            <Row label={`GST (${GST_PERCENT}%)`}>{formatInrFromPaise(gstPaise(application.paymentAmountPaise))}</Row>
            <Row label="Total">
              <span className="font-display text-2xl text-teal-deep" data-testid="amount-payable">{amount}</span>
            </Row>
          </dl>
          {payUrl ? (
            <>
              <p className="mt-6 rounded-md bg-paper px-3 py-2 text-sm text-ink">
                The fee is collected by the IIT Bombay OnlinePay gateway. Choose
                your mode of payment on the next screen, and do not close the
                browser until you are returned to this site.
              </p>
              <GatewayHandoffButton href={payUrl} label={`Pay ${amount}`} />
            </>
          ) : (
            <p className="mt-6 rounded-md bg-paper px-3 py-2 text-sm text-ink" data-testid="payment-not-open">
              Online payment is not open yet. This same link will offer checkout
              as soon as it opens.
            </p>
          )}
        </section>
      ) : (
        <section className="mt-8 rounded-xl border border-line bg-white p-6">
          <p className="text-sm text-ink">
            {application.paymentStatus === "REPORTED"
              ? "You have reported a payment. The organisers are confirming it."
              : "No registration fee is due on this application."}
          </p>
        </section>
      )}

      <p className="mt-6 text-sm text-mute">
        Questions: <a href="mailto:support@iitbinvent.com">support@iitbinvent.com</a>
        {" · "}
        <Link href="/dashboard" className="underline-offset-2 hover:underline">
          Dashboard
        </Link>
      </p>
    </main>
  );
}
