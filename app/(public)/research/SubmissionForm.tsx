"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  GST_PERCENT,
  PARTICIPATION_OPTIONS,
  PHD_YEAR_OPTIONS,
  POSTDOC_OPTIONS,
  PROFESSIONAL_OPTIONS,
  conferenceFeePaiseFor,
  feeBandForProfessional,
  feeBandLabel,
  formatInrFromPaise,
  needsAbstract,
  payableAtRegistration,
  type ParticipationCategory,
  type ProfessionalCategory,
  withGstPaise,
} from "@/lib/conference";
import { LOGIN_TO_SUBMIT_HREF } from "@/lib/landing";
import { withBasePath } from "@/lib/base-path";

const SUBMIT_TIMEOUT_MS = 45_000;

type StepKey = "you" | "position" | "participation" | "abstract" | "review";

const STEP_LABELS: Record<StepKey, string> = {
  you: "About you",
  position: "Position",
  participation: "Participation",
  abstract: "Abstract",
  review: "Review",
};

type Summary = { label: string; value: string }[];

function optionLabel<T extends string>(
  options: { value: T; label: string }[],
  value: string,
  other?: string,
): string {
  if (value === "OTHER" && other?.trim()) return `Other: ${other.trim()}`;
  return options.find((o) => o.value === value)?.label ?? (value || "Not provided");
}

/** Registration as a short sequence of steps; the abstract step appears only for presenters. */
export function SubmissionForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [participation, setParticipation] = useState<ParticipationCategory | "">("");
  const [professional, setProfessional] = useState<ProfessionalCategory | "">("");
  const [current, setCurrent] = useState<StepKey>("you");
  const [summary, setSummary] = useState<Summary>([]);
  const moved = useRef(false);

  const abstractNeeded = participation ? needsAbstract(participation) : false;
  const steps: StepKey[] = [
    "you",
    "position",
    "participation",
    ...(abstractNeeded ? (["abstract"] as const) : []),
    "review",
  ];
  const index = Math.max(0, steps.indexOf(current));
  const payNow = participation ? payableAtRegistration(participation) : false;
  const feePaise = professional ? conferenceFeePaiseFor(professional) : null;
  const feeLabel = feePaise === null ? null : formatInrFromPaise(withGstPaise(feePaise));

  useEffect(() => {
    if (!moved.current) return;
    headingRef.current?.focus();
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [current]);

  function stepElement(key: StepKey): HTMLElement | null {
    return formRef.current?.querySelector<HTMLElement>(`[data-step="${key}"]`) ?? null;
  }

  /** Native constraint validation, one step at a time. */
  function stepValid(key: StepKey, report: boolean): boolean {
    const fields = stepElement(key)?.querySelectorAll<HTMLInputElement>("input, select, textarea") ?? [];
    for (const field of fields) {
      if (!field.checkValidity()) {
        if (report) field.reportValidity();
        return false;
      }
    }
    return true;
  }

  function readSummary(): Summary {
    const data = new FormData(formRef.current!);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    const file = data.get("abstract");
    const rows: Summary = [
      { label: "Name", value: text("name") },
      { label: "Email", value: text("email") },
      { label: "Phone", value: text("phone") },
      { label: "Institution", value: text("institution") },
      {
        label: "Position",
        value: optionLabel(PROFESSIONAL_OPTIONS, text("professionalCategory"), text("professionalOther")),
      },
    ];
    if (text("phdYear")) {
      rows.push({ label: "PhD year", value: optionLabel(PHD_YEAR_OPTIONS, text("phdYear")) });
    }
    rows.push({
      label: "Seeking post-doctoral opportunities",
      value: optionLabel(POSTDOC_OPTIONS, text("seekingPostdoc")),
    });
    rows.push({
      label: "Participation",
      value: optionLabel(PARTICIPATION_OPTIONS, text("participationCategory"), text("participationOther")),
    });
    if (abstractNeeded) {
      rows.push({ label: "Proposed title", value: text("paperTitle") });
      rows.push({
        label: "Extended abstract",
        value: file instanceof File && file.size > 0 ? file.name : "Not attached",
      });
    }
    return rows;
  }

  function goTo(key: StepKey) {
    moved.current = true;
    if (key === "review") setSummary(readSummary());
    setError(null);
    setCurrent(key);
  }

  function next() {
    if (!stepValid(current, true)) return;
    const following = steps[index + 1];
    if (following) goTo(following);
  }

  function back() {
    const previous = steps[index - 1];
    if (previous) goTo(previous);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (current !== "review") {
      next();
      return;
    }
    // Every step again: a later choice can make an earlier field required.
    for (const key of steps) {
      if (!stepValid(key, false)) {
        goTo(key);
        window.setTimeout(() => stepValid(key, true), 50);
        return;
      }
    }

    setError(null);
    setPending(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
    try {
      const res = await fetch(withBasePath("/api/conference/apply"), {
        method: "POST",
        body: new FormData(event.currentTarget),
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; paymentToken?: string; feeDue?: boolean }
        | null;
      if (res.status === 401) {
        window.location.href = withBasePath(LOGIN_TO_SUBMIT_HREF);
        return;
      }
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Could not complete your registration. Please try again.");
        return;
      }
      if (data.feeDue && data.paymentToken) {
        router.push(`/conference/pay/${encodeURIComponent(data.paymentToken)}?registered=1`);
      } else {
        router.push("/dashboard?submitted=1");
      }
    } catch {
      setError(
        controller.signal.aborted
          ? "Registration timed out. Please try again, or email support@iitbinvent.com if this continues."
          : "Could not reach the server. Please try again.",
      );
    } finally {
      window.clearTimeout(timer);
      setPending(false);
    }
  }

  /** Every step stays mounted (so typed values and the chosen PDF survive); only one shows. */
  const stepProps = (step: StepKey) => ({ "data-step": step, hidden: current !== step });

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="site-form site-form-steps"
      data-testid="conference-form"
      aria-labelledby="registration-step-heading"
    >
      <ol className="site-steps" aria-label="Registration steps">
        {steps.map((key, i) => (
          <li
            key={key}
            aria-current={key === current ? "step" : undefined}
            className={i < index ? "is-done" : undefined}
          >
            {i < index ? (
              <button type="button" onClick={() => goTo(key)}>
                <span className="num" aria-hidden="true">✓</span>
                {STEP_LABELS[key]}
              </button>
            ) : (
              <span className="step">
                <span className="num" aria-hidden="true">{i + 1}</span>
                {STEP_LABELS[key]}
              </span>
            )}
          </li>
        ))}
      </ol>

      <h3
        id="registration-step-heading"
        ref={headingRef}
        tabIndex={-1}
        className="site-step-head"
        data-testid="step-heading"
      >
        Step {index + 1} of {steps.length} · {STEP_LABELS[current]}
      </h3>

      {error ? (
        <p className="site-alert is-error" role="alert" data-testid="conference-error">
          {error}
        </p>
      ) : null}

      <div {...stepProps("you")}>
        <label className="site-field">
          <span className="label">
            Your name <span className="req">*</span>
          </span>
          <input
            name="name"
            required
            minLength={2}
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
          {defaultEmail ? <span className="hint">Tied to your logged-in account.</span> : null}
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
            pattern="[0-9+\(\)\-\s]{8,20}"
            title="8 to 15 digits, with an optional + country code"
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
      </div>

      <div {...stepProps("position")}>
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
                      required={professional === "OTHER"}
                      className="site-input site-input-inline"
                    />
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {professional === "PHD_SCHOLAR" ? (
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
      </div>

      <div {...stepProps("participation")}>
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
                  data-testid={`participation-${opt.value}`}
                  onChange={() => setParticipation(opt.value)}
                />
                <span>
                  {opt.label}
                  {opt.hint ? <span className="opt-hint">{opt.hint}</span> : null}
                  {opt.value === "OTHER" ? (
                    <input
                      name="participationOther"
                      placeholder="Please specify"
                      required={participation === "OTHER"}
                      className="site-input site-input-inline"
                    />
                  ) : null}
                </span>
              </label>
            ))}
          </div>
          <p className="site-step-note">
            {participation === ""
              ? "Attendees pay when they register. Every other choice asks for your abstract next, and the fee is due once organisers shortlist it."
              : payNow
                ? "As an attendee you pay when you register: the proforma invoice is emailed to you and the payment page opens next."
                : "Next, add the title and extended abstract for organisers to review. The fee is due once they shortlist it."}
          </p>
        </fieldset>
      </div>

      {abstractNeeded ? (
        <div {...stepProps("abstract")}>
          <label className="site-field">
            <span className="label">
              Proposed title of the paper or poster <span className="req">*</span>
            </span>
            <input name="paperTitle" required className="site-input" data-testid="field-title" />
          </label>
          <label className="site-field">
            <span className="label">
              Upload the extended abstract <span className="req">*</span>
            </span>
            <input
              type="file"
              name="abstract"
              accept="application/pdf,.pdf"
              required
              className="site-file"
              data-testid="field-abstract"
            />
            <span className="hint">PDF only. Max 10 MB.</span>
          </label>
        </div>
      ) : null}

      <div {...stepProps("review")}>
        <dl className="site-review" data-testid="registration-review">
          {summary.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value || "Not provided"}</dd>
            </div>
          ))}
        </dl>
        <div className="site-panel site-fee-panel" data-testid="registration-fee">
          <p className="site-kicker">Registration fee</p>
          <p className="site-fee-amount">
            {feeLabel ?? "—"}
            {professional ? (
              <span>
                {" "}· {feeBandLabel(feeBandForProfessional(professional))} ·{" "}
                {formatInrFromPaise(feePaise ?? 0)} + {GST_PERCENT}% GST
              </span>
            ) : null}
          </p>
          <p className="lead">
            {payNow
              ? "When you complete registration we email your proforma invoice and take you to the payment page. Your ticket is issued once IIT Bombay OnlinePay confirms the payment."
              : "Organisers review your abstract. If it is shortlisted, we email your proforma invoice with the payment link. Your ticket is issued once the fee is paid."}
          </p>
        </div>
      </div>

      <div className="site-step-nav">
        {index > 0 ? (
          <button type="button" className="site-btn site-btn-ghost" onClick={back} disabled={pending}>
            ← Back
          </button>
        ) : (
          <span />
        )}
        {/* Distinct keys: reusing one <button> node would flip the clicked
            "Continue" to type=submit mid-click and submit the form on its own. */}
        {current === "review" ? (
          <button
            key="submit"
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="site-btn"
            data-testid="submit-application"
          >
            {pending ? "Completing registration…" : "Complete registration"}
          </button>
        ) : (
          <button key="next" type="button" className="site-btn" onClick={next} data-testid="step-next">
            Continue →
          </button>
        )}
      </div>

      <p className="site-form-fine">
        Registering records your name, email, phone, institution and any uploaded
        abstract so DSSE organisers can process your registration.
      </p>
    </form>
  );
}
