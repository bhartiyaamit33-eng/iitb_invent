import Link from "next/link";
import {
  applicationStatusLabel,
  formatInrFromPaise,
  participationLabel,
  paymentStatusLabel,
  type ApplicationPaymentStatus,
  type ApplicationStatus,
  type ParticipationCategory,
} from "@/lib/conference";
import { applicationFeeDue, applicationPaymentVisible } from "@/lib/conference-access";
import { conferencePayPath } from "@/lib/conference-server";

export function ConferencePayCta({
  token,
  amountPaise,
}: {
  token: string;
  amountPaise: number;
}) {
  const amount = formatInrFromPaise(amountPaise);
  return (
    <Link
      href={conferencePayPath(token)}
      className="inline-block rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
      data-testid="conference-pay-cta"
    >
      Pay {amount} with IIT Bombay Online Pay
    </Link>
  );
}

export function ConferenceStatusCard({
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
  const showFee = applicationPaymentVisible({ status, paymentStatus });
  const payPath = conferencePayPath(paymentToken);

  return (
    <div data-testid="conference-status-card">
      <p className="mt-2 text-lg font-semibold text-ink">
        {applicationStatusLabel(status)}
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        {participationLabel(participationCategory, participationOther)}
        {paperTitle ? ` · ${paperTitle}` : ""}
      </p>
      {showFee ? (
        <p className="mt-1 text-sm text-ink-soft">
          Fee: {paymentStatusLabel(paymentStatus)}
          {` · ${formatInrFromPaise(paymentAmountPaise)}`}
        </p>
      ) : null}
      {feeDue ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-ink">
            You are selected. Pay the registration fee through IIT Bombay
            Online Pay. You do not fill the application form again.
          </p>
          <ConferencePayCta
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
          Organisers will post the decision here and by email. The registration
          fee and payment link appear only after you are selected.
        </p>
      )}
    </div>
  );
}
