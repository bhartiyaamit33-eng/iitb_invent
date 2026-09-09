import Link from "next/link";
import {
  applicationStatusLabel,
  formatInrFromPaise,
  participationLabel,
  paymentStatusLabel,
  type ApplicationPaymentStatus,
  type ApplicationStatus,
  type ParticipationCategory,
} from "@/lib/colloquium";
import { applicationFeeDue } from "@/lib/colloquium-access";
import { colloquiumPayPath } from "@/lib/colloquium-server";

export function ColloquiumPayCta({
  token,
  amountPaise,
}: {
  token: string;
  amountPaise: number;
}) {
  const amount = formatInrFromPaise(amountPaise);
  return (
    <form
      method="post"
      action={`/api/colloquium/pay/${encodeURIComponent(token)}/checkout`}
    >
      <button
        type="submit"
        className="rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
        data-testid="colloquium-pay-cta"
      >
        Pay {amount} with PayU
      </button>
    </form>
  );
}

export function ColloquiumStatusCard({
  status,
  participationCategory,
  participationOther,
  paperTitle,
  paymentStatus,
  paymentAmountPaise,
  paymentToken,
}: {
  status: ApplicationStatus;
  participationCategory: ParticipationCategory;
  participationOther?: string | null;
  paperTitle?: string | null;
  paymentStatus: ApplicationPaymentStatus;
  paymentAmountPaise: number;
  paymentToken: string;
}) {
  const feeDue = applicationFeeDue({ status, paymentStatus });
  const payPath = colloquiumPayPath(paymentToken, true);

  return (
    <div data-testid="colloquium-status-card">
      <p className="mt-2 text-lg font-semibold text-ink">
        {applicationStatusLabel(status)}
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        {participationLabel(participationCategory, participationOther)}
        {paperTitle ? ` · ${paperTitle}` : ""}
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        Fee: {paymentStatusLabel(paymentStatus)}
        {feeDue ? ` · ${formatInrFromPaise(paymentAmountPaise)}` : ""}
      </p>
      {feeDue ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-ink">
            You are selected. Pay the registration fee through the IIT Bombay
            PayU gateway — you do not fill the application form again.
          </p>
          <ColloquiumPayCta
            token={paymentToken}
            amountPaise={paymentAmountPaise}
          />
          <Link
            href={payPath}
            className="inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline"
          >
            Open payment page →
          </Link>
        </div>
      ) : paymentStatus === "PAID" || paymentStatus === "WAIVED" ? (
        <p className="mt-3 text-sm text-ink">
          {paymentStatus === "WAIVED"
            ? "The registration fee has been waived."
            : "Payment received. You do not need to apply again."}
        </p>
      ) : (
        <p className="mt-3 text-sm text-ink-soft">
          Organisers will post the decision here and by email. You do not need
          to submit the form again.
        </p>
      )}
    </div>
  );
}
