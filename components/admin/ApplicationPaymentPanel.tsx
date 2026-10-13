"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  formatInrFromPaise,
  paymentStatusLabel,
  type ApplicationPaymentStatus,
} from "@/lib/conference";
import { withBasePath } from "@/lib/base-path";
import { times, type Tone } from "@/lib/admin/format";

const TONE: Record<ApplicationPaymentStatus, Tone> = {
  PAID: "good",
  WAIVED: "good",
  UNPAID: "warn",
  REPORTED: "warn",
  NOT_REQUIRED: "neutral",
};

/** Fee status for one registration: gateway transactions plus manual overrides for offline payments. */
export function ApplicationPaymentPanel({
  id,
  paymentStatus,
  feeLabel,
  paymentAmountPaise,
  paymentUrl,
  paymentRef,
  paidAt,
  payerId,
  transactions,
  proforma,
  proformaAction,
}: {
  id: string;
  paymentStatus: ApplicationPaymentStatus;
  /** Organiser-facing wording, e.g. "Due once selected" before a decision. */
  feeLabel?: string;
  paymentAmountPaise: number;
  paymentUrl: string;
  paymentRef?: string | null;
  paidAt?: string | null;
  payerId?: string | null;
  transactions: { transId: string; amount: string; label: string; tone: Tone; verified: boolean }[];
  /** Proforma invoices emailed so far, and when the last one went out. */
  proforma: { count: number; lastSent: string | null };
  /** The resend control, rendered by the page when a fee is due. */
  proformaAction?: ReactNode;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(next: ApplicationPaymentStatus) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(withBasePath(`/api/admin/applications/${id}/payment`), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ paymentStatus: next }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error || "The fee status was not saved. Try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const confirmed = transactions.filter((t) => t.verified).length;

  return (
    <section className="adm-panel" data-testid="payment-panel">
      <div className="adm-panel-head">
        <h2 className="adm-panel-title">Fee</h2>
        <span className={`adm-badge is-${TONE[paymentStatus]}`}>{feeLabel ?? paymentStatusLabel(paymentStatus)}</span>
      </div>
      <div className="adm-panel-body">
        <p style={{ margin: 0, fontSize: 26, fontWeight: 680, fontVariationSettings: '"wdth" 112' }}>
          {formatInrFromPaise(paymentAmountPaise)}
        </p>
        <p className="adm-hint" style={{ margin: "2px 0 0" }}>
          Inclusive of GST{paidAt ? `. Recorded ${paidAt}` : ""}
          {paymentRef ? `, reference ${paymentRef}` : ""}.
        </p>

        <dl className="adm-dl" style={{ marginTop: 12 }}>
          <div>
            <dt>Registration ID</dt>
            <dd>{payerId ? <span className="adm-mono">{payerId}</span> : "Not issued yet"}</dd>
          </div>
          <div>
            <dt>Proforma invoice</dt>
            <dd data-testid="proforma-sent">
              {proforma.count === 0
                ? "Not sent yet"
                : `Sent ${times(proforma.count)}${proforma.lastSent ? `, last on ${proforma.lastSent}` : ""}`}
            </dd>
          </div>
          <div>
            <dt>Payment page</dt>
            <dd>
              <a className="adm-link" href={paymentUrl} target="_blank" rel="noreferrer">
                Open the applicant&apos;s page
              </a>
            </dd>
          </div>
        </dl>
        {proformaAction ? <div style={{ margin: "4px 0 12px" }}>{proformaAction}</div> : null}

        {transactions.length > 0 ? (
          <ul className="adm-list" style={{ margin: "8px -20px 0", borderTop: "1px solid var(--adm-rule)" }}>
            {transactions.map((t) => (
              <li key={t.transId}>
                <span>
                  <span className="adm-mono">{t.transId}</span>
                  <span className="adm-sub">₹{t.amount}</span>
                </span>
                <span className={`adm-badge is-${t.tone}`}>{t.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="adm-hint" style={{ marginTop: 10 }}>
            No online payment attempts yet.
          </p>
        )}
        {confirmed > 1 ? (
          <p className="adm-notice is-bad" style={{ margin: "12px 0 0" }} role="alert">
            Paid {confirmed} times online. Arrange a refund of the extra payment.
          </p>
        ) : null}

        <p className="adm-hint" style={{ marginTop: 16 }}>
          Online payments mark this paid automatically once the gateway confirms them.
          Use these only for payments made another way.
        </p>
        {error ? (
          <p className="adm-notice is-bad" style={{ margin: "8px 0 0" }} role="alert">
            {error}
          </p>
        ) : null}
        <div className="adm-form-foot" style={{ marginTop: 8 }}>
          <button
            type="button"
            disabled={pending || paymentStatus === "PAID"}
            onClick={() => void setStatus("PAID")}
            className="adm-btn is-small"
            data-testid="mark-paid"
          >
            Mark paid
          </button>
          <button
            type="button"
            disabled={pending || paymentStatus === "WAIVED"}
            onClick={() => void setStatus("WAIVED")}
            className="adm-btn is-small"
          >
            Waive fee
          </button>
          <button
            type="button"
            disabled={pending || paymentStatus === "UNPAID"}
            onClick={() => void setStatus("UNPAID")}
            className="adm-btn is-small"
          >
            Mark unpaid
          </button>
        </div>
      </div>
    </section>
  );
}
