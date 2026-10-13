"use client";

import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

/**
 * A button that asks once before it runs a server action, for actions that
 * reach people outside the portal (such as emailing an applicant). The action
 * runs as an ordinary form post and redirects back with a notice.
 */
export function ConfirmActionForm({
  action,
  fields,
  label,
  prompt,
  confirmLabel,
  pendingLabel,
  small,
  disabled,
  title,
  testId,
}: {
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  label: string;
  prompt: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  small?: boolean;
  disabled?: boolean;
  title?: string;
  testId?: string;
}) {
  const [asking, setAsking] = useState(false);
  const size = small ? " is-small" : "";

  return (
    <form action={action} className="adm-confirm">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {asking ? (
        <Confirming
          prompt={prompt}
          confirmLabel={confirmLabel}
          pendingLabel={pendingLabel}
          size={size}
          testId={testId}
          onCancel={() => setAsking(false)}
        />
      ) : (
        // Keyed apart from the submit button so React does not reuse this
        // element as a submit button mid-click and post the form unasked.
        <button
          key="ask"
          type="button"
          className={`adm-btn${size}`}
          disabled={disabled}
          title={title}
          onClick={() => setAsking(true)}
          data-testid={testId}
        >
          {label}
        </button>
      )}
    </form>
  );
}

function Confirming({
  prompt,
  confirmLabel,
  pendingLabel,
  size,
  testId,
  onCancel,
}: {
  prompt: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  size: string;
  testId?: string;
  onCancel: () => void;
}) {
  const { pending } = useFormStatus();
  return (
    <>
      <span className="adm-confirm-prompt" role="status">
        {prompt}
      </span>
      <button
        key="confirm"
        type="submit"
        className={`adm-btn is-primary${size}`}
        disabled={pending}
        data-testid={testId ? `${testId}-confirm` : undefined}
      >
        {pending ? pendingLabel : confirmLabel}
      </button>
      <button
        key="cancel"
        type="button"
        className={`adm-btn is-quiet${size}`}
        disabled={pending}
        onClick={onCancel}
      >
        Cancel
      </button>
    </>
  );
}
