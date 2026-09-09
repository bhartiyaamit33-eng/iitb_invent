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
} from "@/lib/colloquium";

const fieldClass =
  "mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-teal";
const radioLabelClass =
  "flex items-start gap-2.5 rounded-lg border border-transparent px-1 py-1.5 hover:bg-paper/80";

const SUBMIT_TIMEOUT_MS = 45_000;

export function ColloquiumForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [participation, setParticipation] =
    useState<ParticipationCategory | "">("");
  const abstractNeeded = useMemo(
    () => (participation ? needsAbstract(participation) : false),
    [participation],
  );

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
      const res = await fetch("/api/colloquium/apply", {
        method: "POST",
        body,
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        setError(
          data?.error ||
            "Could not submit the application. Please try again.",
        );
        return;
      }
      router.push("/colloquium/thanks");
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
    <form
      onSubmit={onSubmit}
      className="mt-10 space-y-7 rounded-xl border border-line bg-white p-6 sm:p-8"
      data-testid="colloquium-form"
    >
      {error ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
          data-testid="colloquium-error"
        >
          {error}
        </p>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium text-ink">
          Your Name <span className="text-teal-deep">*</span>
        </span>
        <input
          name="name"
          required
          autoComplete="name"
          defaultValue={defaultName}
          className={fieldClass}
          data-testid="field-name"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">
          Email <span className="text-teal-deep">*</span>
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          className={fieldClass}
          data-testid="field-email"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">
          Phone number <span className="text-teal-deep">*</span>
        </span>
        <input
          type="tel"
          name="phone"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="+91 …"
          className={fieldClass}
          data-testid="field-phone"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">
          Institution name <span className="text-teal-deep">*</span>
        </span>
        <input
          name="institution"
          required
          autoComplete="organization"
          className={fieldClass}
          data-testid="field-institution"
        />
      </label>

      <fieldset data-testid="field-professional">
        <legend className="text-sm font-medium text-ink">
          Professional Category / Current Position{" "}
          <span className="text-teal-deep">*</span>
        </legend>
        <div className="mt-2 space-y-1">
          {PROFESSIONAL_OPTIONS.map((opt) => (
            <label key={opt.value} className={radioLabelClass}>
              <input
                type="radio"
                name="professionalCategory"
                value={opt.value}
                required
                className="mt-1"
              />
              <span className="text-sm text-ink">
                {opt.label}
                {opt.value === "OTHER" ? (
                  <input
                    name="professionalOther"
                    placeholder="Please specify"
                    className="ml-2 mt-1 w-full rounded-md border border-line px-2 py-1.5 sm:ml-3 sm:mt-0 sm:inline-block sm:w-64"
                  />
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset data-testid="field-phd-year">
        <legend className="text-sm font-medium text-ink">
          Current PhD Year{" "}
          <span className="font-normal text-mute">(if you are a PhD student)</span>
        </legend>
        <div className="mt-2 space-y-1">
          {PHD_YEAR_OPTIONS.map((opt) => (
            <label key={opt.value} className={radioLabelClass}>
              <input type="radio" name="phdYear" value={opt.value} className="mt-1" />
              <span className="text-sm text-ink">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset data-testid="field-postdoc">
        <legend className="text-sm font-medium text-ink">
          Are you currently seeking post-doctoral opportunities?
        </legend>
        <div className="mt-2 space-y-1">
          {POSTDOC_OPTIONS.map((opt) => (
            <label key={opt.value} className={radioLabelClass}>
              <input
                type="radio"
                name="seekingPostdoc"
                value={opt.value}
                className="mt-1"
              />
              <span className="text-sm text-ink">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset data-testid="field-participation">
        <legend className="text-sm font-medium text-ink">
          Participation Category <span className="text-teal-deep">*</span>
        </legend>
        <div className="mt-2 space-y-1">
          {PARTICIPATION_OPTIONS.map((opt) => (
            <label key={opt.value} className={radioLabelClass}>
              <input
                type="radio"
                name="participationCategory"
                value={opt.value}
                required
                className="mt-1"
                onChange={() => setParticipation(opt.value)}
              />
              <span className="text-sm text-ink">
                {opt.label}
                {opt.hint ? (
                  <span className="mt-0.5 block text-xs text-mute">{opt.hint}</span>
                ) : null}
                {opt.value === "OTHER" ? (
                  <input
                    name="participationOther"
                    placeholder="Please specify"
                    className="mt-1 w-full rounded-md border border-line px-2 py-1.5"
                  />
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-medium text-ink">
          Proposed Title of the Paper
          {abstractNeeded ? <span className="text-teal-deep"> *</span> : null}
        </span>
        <input
          name="paperTitle"
          required={abstractNeeded}
          className={fieldClass}
          data-testid="field-title"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">
          Upload the extended abstract
          {abstractNeeded ? <span className="text-teal-deep"> *</span> : null}
        </span>
        <input
          type="file"
          name="abstract"
          accept="application/pdf,.pdf"
          required={abstractNeeded}
          className="mt-1.5 block w-full text-sm text-ink-soft file:mr-3 file:rounded-md file:border-0 file:bg-teal-deep file:px-3 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-[0.1em] file:text-white"
          data-testid="field-abstract"
        />
        <p className="mt-1.5 text-xs text-mute">
          PDF only. Max 10 MB. Required for paper and poster applications.
        </p>
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-line bg-paper/60 px-4 py-3">
        <input
          type="checkbox"
          name="sendCopy"
          className="mt-1"
          data-testid="field-send-copy"
        />
        <span className="text-sm text-ink-soft">
          Send me a copy of my responses at the email above.
        </span>
      </label>

      <p className="text-xs text-mute">
        Submitting this form records your name, email, phone, institution, and
        uploaded files so DSSE organisers can review the call for applications.
      </p>

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="w-full rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white hover:bg-teal disabled:opacity-60"
        data-testid="submit-application"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
