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
} from "@/lib/conference";
import { BASE_PATH, withBasePath } from "@/lib/base-path";

/** Change an application's status, with a confirmation that says exactly what the applicant will receive. */
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
  const [message, setMessage] = useState(defaultStatusEmailMessage(currentStatus));
  const [sendEmail, setSendEmail] = useState(true);
  const [messageEdited, setMessageEdited] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selected = statusRequiresPayment(status);
  const amount = useMemo(() => formatInrFromPaise(feePaise), [feePaise]);
  const unchanged = status === currentStatus;

  function chooseStatus(next: ApplicationStatus) {
    setStatus(next);
    if (!messageEdited) setMessage(defaultStatusEmailMessage(next));
  }

  function openDialog() {
    setMessage(defaultStatusEmailMessage(status));
    setMessageEdited(false);
    setSendEmail(true);
    setError(null);
    setNotice(null);
    setOpen(true);
  }

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(withBasePath(`/api/admin/applications/${id}/review`), {
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
        setError(data?.error || "The status was not saved. Try again.");
        return;
      }
      setOpen(false);
      if (compact) {
        // In a filtered list the row may leave the view, so confirm at page level.
        const emailNote = !sendEmail
          ? ""
          : data.emailSent
            ? " Emailed."
            : " The email did not send; the update is on their dashboard.";
        const url = new URL(window.location.href);
        url.searchParams.set("updated", `${name} is now ${applicationStatusLabel(status)}.${emailNote}`);
        const path = url.pathname.startsWith(BASE_PATH) ? url.pathname.slice(BASE_PATH.length) || "/" : url.pathname;
        router.replace(`${path}${url.search}`);
        router.refresh();
        return;
      }
      if (sendEmail && data.emailError) {
        setNotice(`Saved, but the email did not send (${data.emailError}). The update is on their dashboard.`);
      } else if (sendEmail && data.emailSent) {
        setNotice("Saved and emailed. The update is on their dashboard too.");
      } else {
        setNotice("Saved. The update is on their dashboard if they have an account.");
      }
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const statusSelect = (
    <select
      value={status}
      onChange={(e) => chooseStatus(e.target.value as ApplicationStatus)}
      className="adm-select"
      aria-label={`Status for ${name}`}
      data-testid={compact ? `status-select-${id}` : "status-select"}
    >
      {APPLICATION_STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 6 : 12 }}>
      {compact ? (
        <div>
          <button
            type="button"
            onClick={openDialog}
            className="adm-btn is-quiet is-small"
            style={{ paddingLeft: 0 }}
            data-testid={`status-update-${id}`}
          >
            Change status
          </button>
        </div>
      ) : (
        <>
          <label className="adm-field">
            <span className="adm-label">Status</span>
            {statusSelect}
          </label>
          <label className="adm-field">
            <span className="adm-label">Notes for organisers</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="adm-textarea"
              placeholder="Only organisers see these."
            />
          </label>
          <div>
            <button type="button" onClick={openDialog} className="adm-btn is-primary" data-testid="status-update">
              Record decision
            </button>
          </div>
        </>
      )}

      {notice ? (
        <p className="adm-hint" style={{ color: "var(--adm-good)" }} data-testid="review-notice">
          {notice}
        </p>
      ) : null}
      {error && !open ? (
        <p className="adm-hint" style={{ color: "var(--adm-bad)" }} role="alert">
          {error}
        </p>
      ) : null}

      {open ? (
        <div className="adm-dialog-backdrop" role="presentation" onClick={() => !pending && setOpen(false)}>
          <div
            className="adm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`status-dialog-${id}`}
            data-testid="status-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={`status-dialog-${id}`}>Change status for {name}</h2>
            {compact ? (
              <label className="adm-field" style={{ marginTop: 14 }}>
                <span className="adm-label">New status</span>
                {statusSelect}
              </label>
            ) : null}
            <p className="adm-desc" style={{ marginTop: 10 }}>
              {unchanged ? (
                <>
                  Keeps the status{" "}
                  <strong style={{ color: "var(--adm-ink)" }}>{applicationStatusLabel(status)}</strong> and sends the
                  message again.
                </>
              ) : (
                <>
                  From {applicationStatusLabel(currentStatus)} to{" "}
                  <strong style={{ color: "var(--adm-ink)" }}>{applicationStatusLabel(status)}</strong>.
                </>
              )}
            </p>
            {selected ? (
              <p className="adm-notice" style={{ margin: "14px 0 0" }}>
                {name} will owe {amount}. Their proforma invoice with the payment link
                goes to their email, and the same link appears on their dashboard.
              </p>
            ) : null}
            <label className="adm-field" style={{ marginTop: 16 }}>
              <span className="adm-label">Message to {name}</span>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setMessageEdited(true);
                }}
                rows={5}
                className="adm-textarea"
                data-testid="status-message"
              />
            </label>
            <label className="adm-check" style={{ marginTop: 12 }}>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                data-testid="status-send-email"
              />
              Email {name} now
            </label>
            {error ? (
              <p className="adm-notice is-bad" style={{ margin: "12px 0 0" }} role="alert">
                {error}
              </p>
            ) : null}
            <div className="adm-dialog-foot">
              <button type="button" onClick={() => setOpen(false)} className="adm-btn" disabled={pending}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirm()}
                disabled={pending}
                className="adm-btn is-primary"
                data-testid="status-confirm"
              >
                {pending ? "Saving…" : sendEmail ? "Save and email" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
