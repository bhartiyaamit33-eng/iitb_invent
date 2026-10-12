import Link from "next/link";
import type { ReactNode } from "react";
import type { Tone } from "@/lib/admin/format";

/** Building blocks for the admin portal; styles live in app/admin.css. */

export function PageHeader({
  title,
  description,
  actions,
  back,
  testId,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  testId?: string;
}) {
  return (
    <>
      {back ? (
        <Link href={back.href} className="adm-crumb">
          ← {back.label}
        </Link>
      ) : null}
      <header className="adm-head">
        <div>
          <h1 className="adm-title" data-testid={testId}>
            {title}
          </h1>
          {description ? <p className="adm-desc">{description}</p> : null}
        </div>
        {actions ? <div className="adm-actions">{actions}</div> : null}
      </header>
    </>
  );
}

export function Panel({
  title,
  note,
  actions,
  flush,
  danger,
  id,
  children,
}: {
  title?: ReactNode;
  note?: ReactNode;
  actions?: ReactNode;
  flush?: boolean;
  danger?: boolean;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`adm-panel${flush ? " is-flush" : ""}${danger ? " is-danger" : ""}`}
    >
      {title || actions ? (
        <div className="adm-panel-head">
          <div>
            {title ? <h2 className="adm-panel-title">{title}</h2> : null}
            {note ? <p className="adm-panel-note">{note}</p> : null}
          </div>
          {actions ? <div className="adm-actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="adm-panel-body">{children}</div>
    </section>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`adm-badge is-${tone}`}>{children}</span>;
}

export function Notice({
  tone = "info",
  children,
  testId,
}: {
  tone?: "info" | "good" | "warn" | "bad";
  children: ReactNode;
  testId?: string;
}) {
  return (
    <p
      className={`adm-notice${tone === "info" ? "" : ` is-${tone}`}`}
      role={tone === "bad" || tone === "warn" ? "alert" : "status"}
      data-testid={testId}
    >
      {children}
    </p>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="adm-empty">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`adm-field${className ? ` ${className}` : ""}`}>
      <span className="adm-label">{label}</span>
      {children}
      {hint ? <span className="adm-hint">{hint}</span> : null}
    </label>
  );
}
