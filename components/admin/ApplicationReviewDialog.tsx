"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  APPLICATION_STATUS_OPTIONS,
  applicationStatusLabel,
  defaultStatusEmailMessage,
  formatInrFromPaise,
  statusRequiresPayment,
  type ApplicationStatus,
} from "@/lib/colloquium";

export function ApplicationReviewDialog({
  id,
  name,
  currentStatus,
  adminNotes,
  feePaise,
  compact,
}: {
  id: string;
  name: string;
  currentStatus: ApplicationStatus;
  adminNotes?: string;
  feePaise: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus);
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    defaultStatusEmailMessage(currentStatus),
  );
  const [sendEmail, setSendEmail] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = statusRequiresPayment(status);
  const amount = useMemo(() => formatInrFromPaise(feePaise), [feePaise]);

  function openDialog() {
    setMessage(defaultStatusEmailMessage(status));
    setSendEmail(true);
    setError(null);
    setNotice(null);
    setOpen(true);
  }

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/applications/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          status,
          message,
          sendEmail,
          adminNotes: compact ? undefined : notes,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        emailSent?: boolean;
        emailError?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Could not update status.");
        return;
      }
      setOpen(false);
      if (sendEmail && data.emailError) {
        setNotice(`Saved. Email did not send: ${data.emailError}`);
      } else if (sendEmail && data.emailSent) {
        setNotice("Saved and emailed the applicant.");
      } else {
        setNotice("Status saved.");
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={compact ? "flex flex-col gap-1" : "space-y-3"}>
      {notice ? (
        <p className="text-xs text-teal-deep" data-testid="review-notice">
          {notice}
        </p>
      ) : null}
      {error && !open ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {compact ? (
        <>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            className="rounded border border-line px-2 py-1 text-xs"
            data-testid={`status-select-${id}`}
          >
            {APPLICATION_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={openDialog}
            className="text-left text-xs font-semibold text-teal-deep hover:underline"
            data-testid={`status-update-${id}`}
          >
            Update status
          </button>
        </>
      ) : (
        <>
          <label className="block text-sm">
            <span className="text-ink">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
              data-testid="status-select"
            >
              {APPLICATION_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-ink">Admin notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
            />
          </label>
          <button
            type="button"
            onClick={openDialog}
            className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold text-white"
            data-testid="status-update"
          >
            Update status
          </button>
        </>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`status-dialog-${id}`}
          data-testid="status-dialog"
        >
          <div className="w-full max-w-lg rounded-xl border border-line bg-white p-5 shadow-lg">
            <h2
              id={`status-dialog-${id}`}
              className="font-display text-2xl text-teal-deep"
            >
              Confirm status change
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              {name}: {applicationStatusLabel(currentStatus)} →{" "}
              <strong className="text-ink">{applicationStatusLabel(status)}</strong>
            </p>
            {selected ? (
              <p className="mt-2 rounded-md bg-paper px-3 py-2 text-sm text-ink">
                They will receive a payment link for {amount}.
              </p>
            ) : null}
            <label className="mt-4 block text-sm">
              <span className="text-ink">Short message in the email</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="mt-1.5 w-full rounded-md border border-line px-3 py-2.5"
                data-testid="status-message"
              />
            </label>
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="mt-0.5"
                data-testid="status-send-email"
              />
              <span>Email the applicant at the same time</span>
            </label>
            {error ? (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-line px-3 py-2 text-sm"
                disabled={pending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirm()}
                disabled={pending}
                className="rounded-md bg-teal-deep px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                data-testid="status-confirm"
              >
                {pending ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
