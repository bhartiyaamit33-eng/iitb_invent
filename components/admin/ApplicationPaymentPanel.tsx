"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  formatInrFromPaise,
  paymentStatusLabel,
  type ApplicationPaymentStatus,
} from "@/lib/conference";

export function ApplicationPaymentPanel({
  id,
  paymentStatus,
  paymentAmountPaise,
  paymentUrl,
  paymentRef,
  paidAt,
}: {
  id: string;
  paymentStatus: ApplicationPaymentStatus;
  paymentAmountPaise: number;
  paymentUrl: string;
  paymentRef?: string | null;
  paidAt?: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(next: ApplicationPaymentStatus) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ paymentStatus: next }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Could not update payment.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="rounded-xl border border-line bg-white px-5 py-4"
      data-testid="payment-panel"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-mute">
        Payment
      </p>
      <p className="mt-2 text-sm text-ink">
        <strong>{paymentStatusLabel(paymentStatus)}</strong>
        {" · "}
        {formatInrFromPaise(paymentAmountPaise)}
      </p>
      {paymentRef ? (
        <p className="mt-1 text-xs text-mute">Reference: {paymentRef}</p>
      ) : null}
      {paidAt ? (
        <p className="mt-1 text-xs text-mute">Recorded {paidAt}</p>
      ) : null}
      <p className="mt-2 text-xs text-ink-soft">
        Applicants pay via the IIT Bombay PayU gateway. Mark paid only for an
        offline receipt or while merchant approval is still pending.
      </p>
      <p className="mt-2 break-all text-xs">
        <a
          href={paymentUrl}
          className="font-semibold text-teal-deep underline-offset-2 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Applicant payment page
        </a>
      </p>
      {error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => void setStatus("PAID")}
          className="rounded-md bg-teal-deep px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          data-testid="mark-paid"
        >
          Mark paid
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void setStatus("WAIVED")}
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-teal-deep"
        >
          Waive
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => void setStatus("UNPAID")}
          className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink"
        >
          Mark unpaid
        </button>
      </div>
    </div>
  );
}
