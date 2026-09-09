import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  CATEGORY_LABEL,
  formatInr,
  KIND_LABEL,
  PAYMENT_STATUS_LABEL,
  isPaidStatus,
} from "@/lib/payments/pricing";
import { canMockOnlinePay, onlinePayConfig } from "@/lib/payments/onlinepay";
import { startOnlinePayAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
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
  const cfg = onlinePayConfig();
  const mock = canMockOnlinePay();

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        IIT Bombay Online Pay
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        {paid ? "Already paid" : "Pay registration fee"}
      </h1>
      <p className="mt-3 text-ink-soft">
        {payment.edition.name}. Amount is credited to an IIT Bombay account.
      </p>

      {error === "gateway" ? (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          Online Pay is not configured with an app id yet. Organisers still need
          ASC registration.
        </p>
      ) : null}

      <dl className="mt-8 space-y-3 rounded-xl border border-line bg-white p-5 text-sm">
        <Row label="Name" value={payment.user.name} />
        <Row label="Email" value={payment.user.email} />
        <Row label="Category" value={CATEGORY_LABEL[payment.payerCategory]} />
        <Row
          label="Contribution"
          value={`${KIND_LABEL[payment.submission.kind]} — ${payment.submission.title}`}
        />
        <Row label="Purpose" value={payment.purpose} />
        <Row label="Amount" value={formatInr(payment.amount.toString())} />
        <Row label="Status" value={PAYMENT_STATUS_LABEL[payment.status]} />
        <Row label="Request id" value={payment.reqId} />
        <Row label="User id" value={payment.user.id} />
      </dl>

      {paid ? (
        <a
          href={`/pay/${token}/receipt`}
          className="mt-8 inline-block rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white"
        >
          View receipt
        </a>
      ) : (
        <form action={startOnlinePayAction} className="mt-8">
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            data-testid="pay-now-button"
            className="w-full rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
          >
            {mock ? "Record payment (dev mock)" : "Pay with IIT Bombay Online Pay"}
          </button>
          {mock ? (
            <p className="mt-3 text-xs text-mute">
              Development mock — no money moves. Set ONLINEPAY_ENV=test after
              ASC issues an app id.
            </p>
          ) : !cfg.appId ? (
            <p className="mt-3 text-xs text-mute">
              App id missing. Payment cannot start until Online Pay registration
              completes.
            </p>
          ) : null}
        </form>
      )}

      <p className="mt-8 text-sm text-ink-soft">
        If money leaves your bank but this page still shows unpaid, do not pay
        again. Email conference@iitbinvent.com with your request id{" "}
        <code className="text-teal-deep">{payment.reqId}</code>.
      </p>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
        {label}
      </dt>
      <dd className="mt-0.5 text-ink">{value}</dd>
    </div>
  );
}
