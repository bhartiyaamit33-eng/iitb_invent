"use client";

import {
  formatInrFromPaise,
  paymentStatusLabel,
  type ApplicationPaymentStatus,
} from "@/lib/colloquium";

const OUTCOME_COPY: Record<string, string> = {
  success: "PayU confirmed this payment.",
  failed:
    "PayU did not complete this payment. You can try again from this page.",
  pending:
    "PayU is still confirming this payment. Refresh this page in a few minutes.",
  invalid:
    "PayU returned a response we could not verify. If you were charged, write to support@iitbinvent.com with the PayU reference.",
  unavailable:
    "The IIT Bombay PayU merchant is not live on this site yet. Approval is pending.",
  "not-due": "No registration fee is due on this application.",
  already: "This application is already marked paid or waived.",
};

export function ColloquiumPayPanel({
  token,
  name,
  amountPaise,
  paymentStatus,
  paymentRef,
  gatewayReady,
  outcome,
}: {
  token: string;
  name: string;
  amountPaise: number;
  paymentStatus: ApplicationPaymentStatus;
  paymentRef?: string | null;
  gatewayReady: boolean;
  outcome?: string | null;
}) {
  const amount = formatInrFromPaise(amountPaise);
  const settled = paymentStatus === "PAID" || paymentStatus === "WAIVED";
  const notice = outcome ? OUTCOME_COPY[outcome] : null;

  return (
    <section className="mt-8 rounded-xl border border-line bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
        Registration fee
      </p>
      <p className="mt-1 font-display text-4xl text-teal-deep">{amount}</p>
      <p className="mt-2 text-sm text-ink-soft">
        Hi {name}. Status:{" "}
        <strong className="text-ink">{paymentStatusLabel(paymentStatus)}</strong>
        {paymentRef ? ` · PayU ref ${paymentRef}` : null}
      </p>

      {notice ? (
        <p
          className="mt-4 rounded-md bg-paper px-3 py-2 text-sm text-ink"
          data-testid="payu-outcome"
        >
          {notice}
        </p>
      ) : null}

      {settled ? (
        <p className="mt-4 rounded-md bg-paper px-3 py-2 text-sm text-ink">
          {paymentStatus === "WAIVED"
            ? "The fee has been waived. You do not need to pay."
            : "Payment received via the IIT Bombay PayU gateway."}
        </p>
      ) : null}

      {!settled ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-ink">
            The {amount} registration fee is collected through the{" "}
            <strong>IIT Bombay PayU gateway</strong>.
          </p>
          {gatewayReady ? (
            <form
              method="post"
              action={`/api/colloquium/pay/${encodeURIComponent(token)}/checkout`}
            >
              <button
                type="submit"
                className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
                data-testid="payu-checkout"
              >
                Pay {amount} with PayU
              </button>
            </form>
          ) : (
            <p
              className="rounded-md bg-paper px-3 py-2 text-sm text-ink"
              data-testid="payu-pending-approval"
            >
              Institute merchant approval is in progress. This same personal
              link will open PayU checkout once the gateway is live. You do
              not need to pay by UPI separately. Organisers can confirm an
              offline receipt from the admin desk if needed.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
