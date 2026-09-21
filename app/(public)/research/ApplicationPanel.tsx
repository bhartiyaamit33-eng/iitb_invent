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
import {
  applicationFeeDue,
  applicationPaymentVisible,
} from "@/lib/conference-access";
import { conferencePayPath } from "@/lib/conference-server";
import { deleteMyApplicationAction } from "./actions";

export type ResearchApplication = {
  id: string;
  name: string;
  status: ApplicationStatus;
  participationCategory: ParticipationCategory;
  participationOther: string | null;
  paperTitle: string | null;
  paymentStatus: ApplicationPaymentStatus;
  paymentAmountPaise: number;
  paymentToken: string;
};

function DeleteForm({ id, name }: { id: string; name: string }) {
  return (
    <div
      style={{
        marginTop: 32,
        paddingTop: 24,
        borderTop: "1px solid var(--rule)",
      }}
      data-testid="delete-my-application"
    >
      <p className="site-kicker" style={{ color: "#a03027" }}>
        Delete this submission
      </p>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--ink-soft)", maxWidth: "62ch" }}>
        Removes {name}&apos;s abstract so you can submit again. The submitted time on the
        new application will be now. Type DELETE to confirm.
      </p>
      <form
        action={deleteMyApplicationAction}
        style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 16 }}
      >
        <input type="hidden" name="applicationId" value={id} />
        <label>
          <span className="sr-only">Type DELETE to confirm</span>
          <input
            name="confirm"
            placeholder="DELETE"
            autoComplete="off"
            aria-label={`Confirm delete submission for ${name}`}
            className="site-input"
            style={{ width: 180, marginTop: 0 }}
            data-testid="delete-my-application-confirm"
          />
        </label>
        <button
          type="submit"
          className="site-btn site-btn-ghost"
          data-testid="delete-my-application-submit"
        >
          Delete submission
        </button>
      </form>
    </div>
  );
}

/** Current state of the signed-in delegate's submission, plus the pay CTA. */
export function ApplicationPanel({
  application,
  signedIn,
}: {
  application: ResearchApplication;
  signedIn: boolean;
}) {
  const feeDue = applicationFeeDue(application);
  const showFee = applicationPaymentVisible(application);
  const payPath = conferencePayPath(application.paymentToken);

  return (
    <div className="site-panel" data-testid="conference-status-card">
      <p className="site-kicker is-blue">Your application</p>
      <p
        className="site-serif"
        style={{ margin: "0 0 6px", fontSize: "1.9rem", color: "var(--navy)" }}
      >
        {applicationStatusLabel(application.status)}
      </p>
      <p style={{ margin: 0, fontSize: 15, color: "var(--ink-soft)" }}>
        {participationLabel(
          application.participationCategory,
          application.participationOther,
        )}
        {application.paperTitle ? ` · ${application.paperTitle}` : ""}
      </p>
      {showFee ? (
        <p style={{ margin: "8px 0 0", fontSize: 15, color: "var(--ink-soft)" }}>
          Fee: {paymentStatusLabel(application.paymentStatus)}
          {` · ${formatInrFromPaise(application.paymentAmountPaise)}`}
        </p>
      ) : null}

      {feeDue ? (
        <div style={{ marginTop: 24 }}>
          <p className="lead" style={{ marginBottom: 20 }}>
            You are selected. Pay the registration fee through IIT Bombay Online Pay. You
            do not fill the application form again.
          </p>
          <Link
            href={payPath}
            className="site-btn"
            data-testid="conference-pay-cta"
          >
            Pay {formatInrFromPaise(application.paymentAmountPaise)} with IIT Bombay
            Online Pay
          </Link>
        </div>
      ) : application.paymentStatus === "PAID" ||
        application.paymentStatus === "WAIVED" ? (
        <p className="lead" style={{ marginTop: 20, marginBottom: 0 }}>
          {application.paymentStatus === "WAIVED"
            ? "The registration fee has been waived."
            : "Payment received. Your event ticket is on the dashboard and in email."}
        </p>
      ) : (
        <p className="lead" style={{ marginTop: 20, marginBottom: 0 }}>
          Organisers will post the decision here and by email. The registration fee and
          payment link appear only after you are selected.
        </p>
      )}

      {signedIn ? (
        <>
          <p style={{ marginTop: 24, marginBottom: 0, fontSize: 14 }}>
            <Link href="/dashboard" style={{ color: "var(--blue)" }}>
              Open dashboard →
            </Link>
          </p>
          <DeleteForm id={application.id} name={application.name} />
        </>
      ) : null}
    </div>
  );
}
