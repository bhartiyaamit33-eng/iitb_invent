"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  PARTICIPATION_OPTIONS,
  PHD_YEAR_OPTIONS,
  POSTDOC_OPTIONS,
  PROFESSIONAL_OPTIONS,
  needsAbstract,
  type ParticipationCategory,
  type ProfessionalCategory,
} from "@/lib/conference";
import { LOGIN_TO_SUBMIT_HREF } from "@/lib/landing";

const SUBMIT_TIMEOUT_MS = 45_000;

export function SubmissionForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [participation, setParticipation] = useState<ParticipationCategory | "">("");
  const [professional, setProfessional] = useState<ProfessionalCategory | "">("");
  const abstractNeeded = useMemo(
    () => (participation ? needsAbstract(participation) : false),
    [participation],
  );
  const showPhdYear = professional === "PHD_SCHOLAR";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);

    const form = event.currentTarget;
    const body = new FormData(form);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

    try {
      const res = await fetch("/api/conference/apply", {
        method: "POST",
        body,
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (res.status === 401) {
        window.location.href = LOGIN_TO_SUBMIT_HREF;
        return;
      }
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Could not submit the application. Please try again.");
        return;
      }
      router.push("/dashboard?submitted=1");
    } catch {
      setError(
        controller.signal.aborted
          ? "The submission timed out. Please try again, or email support@iitbinvent.com if this continues."
          : "Could not reach the server. Please try again.",
      );
    } finally {
      window.clearTimeout(timer);
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="site-form" data-testid="conference-form">
      {error ? (
        <p className="site-alert is-error" role="alert" data-testid="conference-error">
          {error}
        </p>
      ) : null}

      <label className="site-field">
        <span className="label">
          Your name <span className="req">*</span>
        </span>
        <input
          name="name"
          required
          autoComplete="name"
          defaultValue={defaultName}
          className="site-input"
          data-testid="field-name"
        />
      </label>

      <label className="site-field">
        <span className="label">
          Email <span className="req">*</span>
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          readOnly={Boolean(defaultEmail)}
          className="site-input"
          data-testid="field-email"
        />
        {defaultEmail ? (
          <span className="hint">Tied to your logged-in account.</span>
        ) : null}
      </label>

      <label className="site-field">
        <span className="label">
          Phone number <span className="req">*</span>
        </span>
        <input
          type="tel"
          name="phone"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="+91 …"
          className="site-input"
          data-testid="field-phone"
        />
      </label>

      <label className="site-field">
        <span className="label">
          Institution name <span className="req">*</span>
        </span>
        <input
          name="institution"
          required
          autoComplete="organization"
          className="site-input"
          data-testid="field-institution"
        />
      </label>

      <fieldset className="site-fieldset" data-testid="field-professional">
        <legend>
          Professional category / current position <span className="req">*</span>
        </legend>
        <div className="site-radio-list">
          {PROFESSIONAL_OPTIONS.map((opt) => (
            <label key={opt.value} className="site-radio">
              <input
                type="radio"
                name="professionalCategory"
                value={opt.value}
                required
                data-testid={`professional-${opt.value}`}
                onChange={() => setProfessional(opt.value)}
              />
              <span>
                {opt.label}
                {opt.value === "OTHER" ? (
                  <input
                    name="professionalOther"
                    placeholder="Please specify"
                    className="site-input site-input-inline"
                  />
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {showPhdYear ? (
        <fieldset className="site-fieldset" data-testid="field-phd-year">
          <legend>
            Current PhD year <span className="req">*</span>
          </legend>
          <div className="site-radio-list">
            {PHD_YEAR_OPTIONS.map((opt) => (
              <label key={opt.value} className="site-radio">
                <input type="radio" name="phdYear" value={opt.value} required />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="site-fieldset" data-testid="field-postdoc">
        <legend>Are you currently seeking post-doctoral opportunities?</legend>
        <div className="site-radio-list">
          {POSTDOC_OPTIONS.map((opt) => (
            <label key={opt.value} className="site-radio">
              <input type="radio" name="seekingPostdoc" value={opt.value} />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="site-fieldset" data-testid="field-participation">
        <legend>
          Participation category <span className="req">*</span>
        </legend>
        <div className="site-radio-list">
          {PARTICIPATION_OPTIONS.map((opt) => (
            <label key={opt.value} className="site-radio">
              <input
                type="radio"
                name="participationCategory"
                value={opt.value}
                required
                onChange={() => setParticipation(opt.value)}
              />
              <span>
                {opt.label}
                {opt.hint ? <span className="opt-hint">{opt.hint}</span> : null}
                {opt.value === "OTHER" ? (
                  <input
                    name="participationOther"
                    placeholder="Please specify"
                    className="site-input site-input-inline"
                  />
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="site-field">
        <span className="label">
          Proposed title of the paper
          {abstractNeeded ? <span className="req"> *</span> : null}
        </span>
        <input
          name="paperTitle"
          required={abstractNeeded}
          className="site-input"
          data-testid="field-title"
        />
      </label>

      <label className="site-field">
        <span className="label">
          Upload the extended abstract
          {abstractNeeded ? <span className="req"> *</span> : null}
        </span>
        <input
          type="file"
          name="abstract"
          accept="application/pdf,.pdf"
          required={abstractNeeded}
          className="site-file"
          data-testid="field-abstract"
        />
        <span className="hint">
          PDF only. Max 10 MB. Required for paper and poster applications.
        </span>
      </label>

      <div className="site-form-foot">
        <p className="fine">
          Submitting this form records your name, email, phone, institution, and uploaded
          files so DSSE organisers can review the call for applications. We email a
          thank-you to the address above. The registration fee and payment link are sent
          only after you are selected.
        </p>
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="site-btn"
          data-testid="submit-application"
        >
          {pending ? "Submitting…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}
