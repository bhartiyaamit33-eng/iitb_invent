"use client";

import { useEffect, useRef } from "react";
import {
  formatInrFromPaise,
  paymentStatusLabel,
  type ApplicationPaymentStatus,
} from "@/lib/conference";

const OUTCOME_COPY: Record<string, string> = {
  success: "IIT Bombay Online Pay confirmed this payment.",
  failed:
    "IIT Bombay Online Pay did not complete this payment. You can try again from this page.",
  pending:
    "IIT Bombay Online Pay is still confirming this payment. Refresh this page in a few minutes.",
  invalid:
    "The payment response could not be verified. If you were charged, write to support@iitbinvent.com with the Online Pay transaction id.",
  unavailable:
    "IIT Bombay Online Pay is not configured on this site yet (application id missing).",
  "not-due": "No registration fee is due on this application.",
  already: "This application is already marked paid or waived.",
};

export function ConferencePayPanel({
  token,
  name,
  amountPaise,
  paymentStatus,
  paymentRef,
  gatewayReady,
  outcome,
  autoStart,
  campusOnly,
  paymentVisible,
}: {
  token: string;
  name: string;
  amountPaise: number;
  paymentStatus: ApplicationPaymentStatus;
  paymentRef?: string | null;
  gatewayReady: boolean;
  outcome?: string | null;
  autoStart?: boolean;
  campusOnly?: boolean;
  paymentVisible: boolean;
}) {
  const amount = formatInrFromPaise(amountPaise);
  const settled = paymentStatus === "PAID" || paymentStatus === "WAIVED";
  const notice = outcome ? OUTCOME_COPY[outcome] : null;
  const formRef = useRef<HTMLFormElement>(null);
  const started = useRef(false);

  useEffect(() => {
    void fetch("/api/conference/remember", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ token }),
    });
  }, [token]);

  useEffect(() => {
    if (!autoStart || !gatewayReady || settled || !paymentVisible || started.current)
      return;
    started.current = true;
    formRef.current?.requestSubmit();
  }, [autoStart, gatewayReady, settled, paymentVisible]);

  if (!paymentVisible) {
    return (
      <section className="mt-8 rounded-xl border border-line bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
          Registration fee
        </p>
        <p className="mt-3 text-sm text-ink-soft" data-testid="pay-awaiting-decision">
          Hi {name}. Organisers still need to select you for a paper, a poster,
          or as an attendee. The fee for your category and the IIT Bombay
          Online Pay link will appear here after that decision.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-xl border border-line bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-mute">
        Registration fee
      </p>
      <p className="mt-1 font-display text-4xl text-teal-deep">{amount}</p>
      <p className="mt-2 text-sm text-ink-soft">
        Hi {name}. Status:{" "}
        <strong className="text-ink">{paymentStatusLabel(paymentStatus)}</strong>
        {paymentRef ? ` · Online Pay ref ${paymentRef}` : null}
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
            : "Payment received via IIT Bombay Online Pay."}
        </p>
      ) : null}

      {!settled ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-ink">
            The {amount} registration fee is collected through{" "}
            <strong>IIT Bombay Online Pay</strong>. You do not fill the
            application form again.
          </p>
          {campusOnly ? (
            <p
              className="rounded-md bg-paper px-3 py-2 text-sm text-ink"
              data-testid="onlinepay-campus-only"
            >
              TEST Online Pay only opens on the IITB network or VPN. On the
              IITB page you can pay with Canara Auto Debit, Canara Net
              Banking, PayU, SBIEPAY, or SBI Internet Banking. Do not paste
              the gateway URL into the address bar.
            </p>
          ) : null}
          {gatewayReady ? (
            <form
              ref={formRef}
              method="post"
              action={`/api/conference/pay/${encodeURIComponent(token)}/checkout`}
            >
              {campusOnly ? (
                <label className="mb-3 block text-sm text-ink">
                  IITB LDAP (optional — Canara Auto Debit only)
                  <input
                    name="ldap"
                    type="text"
                    autoComplete="username"
                    placeholder="Leave blank for PayU / net banking"
                    className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm"
                    data-testid="onlinepay-ldap"
                  />
                </label>
              ) : null}
              <button
                type="submit"
                className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
                data-testid="payu-checkout"
              >
                Pay {amount} with IIT Bombay Online Pay
              </button>
            </form>
          ) : (
            <p
              className="rounded-md bg-paper px-3 py-2 text-sm text-ink"
              data-testid="payu-pending-approval"
            >
              IIT Bombay Online Pay is not live on this site yet. This same
              personal link will open checkout once the application id is
              configured. Organisers can confirm an offline receipt from the
              admin desk if needed.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
