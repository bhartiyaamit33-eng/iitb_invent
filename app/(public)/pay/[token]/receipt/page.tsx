import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  CATEGORY_LABEL,
  formatInr,
  KIND_LABEL,
  PAYMENT_STATUS_LABEL,
  isPaidStatus,
} from "@/lib/payments/pricing";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const payment = await prisma.payment.findUnique({
    where: { payToken: token },
    include: {
      user: true,
      submission: true,
      edition: true,
    },
  });
  if (!payment) notFound();

  const paid = isPaidStatus(payment.status);

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        {payment.edition.name}
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        {paid ? "Payment received" : PAYMENT_STATUS_LABEL[payment.status]}
      </h1>
      <p className="mt-3 text-ink-soft" data-testid="receipt-status">
        {paid
          ? "A confirmation email with the PDF invoice is on its way when SES can deliver."
          : "This payment is not complete yet."}
      </p>

      <dl className="mt-8 space-y-3 rounded-xl border border-line bg-white p-5 text-sm">
        <Row label="Invoice" value={payment.invoiceNumber ?? "—"} />
        <Row label="Name" value={payment.user.name} />
        <Row label="Email" value={payment.user.email} />
        <Row label="Category" value={CATEGORY_LABEL[payment.payerCategory]} />
        <Row
          label="Contribution"
          value={`${KIND_LABEL[payment.submission.kind]} — ${payment.submission.title}`}
        />
        <Row label="Purpose" value={payment.purpose} />
        <Row label="Amount" value={formatInr(payment.amount.toString())} />
        <Row label="IITB transaction id" value={payment.transId ?? "—"} />
        <Row label="Bank reference" value={payment.refNo ?? "—"} />
        <Row label="Payment mode" value={payment.provId ?? "—"} />
        <Row label="Request id" value={payment.reqId} />
        <Row label="User id" value={payment.user.id} />
        <Row label="App id" value={payment.appId || "—"} />
        <Row label="Status" value={PAYMENT_STATUS_LABEL[payment.status]} />
      </dl>

      {paid && payment.invoiceNumber ? (
        <a
          href={`/pay/${token}/invoice`}
          data-testid="download-invoice"
          className="mt-8 inline-block rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white"
        >
          Download invoice PDF
        </a>
      ) : null}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
        {label}
      </dt>
      <dd className="mt-0.5 break-all text-ink">{value}</dd>
    </div>
  );
}
