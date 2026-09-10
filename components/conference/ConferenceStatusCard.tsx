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
import { applicationFeeDue } from "@/lib/conference-access";
import { conferencePayPath } from "@/lib/conference-server";

export function ConferencePayCta({
  token,
  amountPaise,
  tone = "paper",
}: {
  token: string;
  amountPaise: number;
  tone?: "paper" | "landing";
}) {
  const amount = formatInrFromPaise(amountPaise);
  return (
    <form
      method="post"
      action={`/api/conference/pay/${encodeURIComponent(token)}/checkout`}
    >
      <button
        type="submit"
        className={
          tone === "landing"
            ? "btn"
            : "rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
        }
        data-testid="conference-pay-cta"
      >
        Pay {amount} with IIT Bombay Online Pay
      </button>
    </form>
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
  tone = "paper",
}: {
  status: ApplicationStatus;
  participationCategory: ParticipationCategory;
  participationOther?: string | null;
  paperTitle?: string | null;
  paymentStatus: ApplicationPaymentStatus;
  paymentAmountPaise: number;
  paymentToken: string;
  tone?: "paper" | "landing";
}) {
  const feeDue = applicationFeeDue({ status, paymentStatus });
  const payPath = conferencePayPath(paymentToken, true);
  const titleClass =
    tone === "landing"
      ? "mt-2 text-lg font-semibold text-frost"
      : "mt-2 text-lg font-semibold text-ink";
  const bodyClass =
    tone === "landing" ? "mt-1 text-sm text-mist" : "mt-1 text-sm text-ink-soft";
  const noteClass =
    tone === "landing" ? "mt-3 text-sm text-frost" : "mt-3 text-sm text-ink";
  const mutedClass =
    tone === "landing" ? "mt-3 text-sm text-mist" : "mt-3 text-sm text-ink-soft";
  const linkClass =
    tone === "landing"
      ? "inline-block text-sm font-semibold text-spark underline-offset-2 hover:underline"
      : "inline-block text-sm font-semibold text-teal-deep underline-offset-2 hover:underline";

  return (
    <div data-testid="conference-status-card">
      <p className={titleClass}>{applicationStatusLabel(status)}</p>
      <p className={bodyClass}>
        {participationLabel(participationCategory, participationOther)}
        {paperTitle ? ` · ${paperTitle}` : ""}
      </p>
      <p className={bodyClass}>
        Fee: {paymentStatusLabel(paymentStatus)}
        {feeDue ? ` · ${formatInrFromPaise(paymentAmountPaise)}` : ""}
      </p>
      {feeDue ? (
        <div className="mt-4 space-y-2">
          <p className={tone === "landing" ? "text-sm text-frost" : "text-sm text-ink"}>
            You are selected. Pay the registration fee through IIT Bombay
            Online Pay — you do not fill the application form again.
          </p>
          <ConferencePayCta
            token={paymentToken}
            amountPaise={paymentAmountPaise}
            tone={tone}
          />
          <Link href={payPath} className={linkClass}>
            Open payment page →
          </Link>
        </div>
      ) : paymentStatus === "PAID" || paymentStatus === "WAIVED" ? (
        <p className={noteClass}>
          {paymentStatus === "WAIVED"
            ? "The registration fee has been waived."
            : "Payment received. You do not need to apply again."}
        </p>
      ) : (
        <p className={mutedClass}>
          Organisers will post the decision here and by email. You do not need
          to submit the form again.
        </p>
      )}
    </div>
  );
}
