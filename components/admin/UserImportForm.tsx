"use client";

import { useState, useTransition } from "react";
import { importUsersCsvAction, type ImportUsersResult } from "@/app/(admin)/admin/users/actions";

/** Bulk-create accounts from a CSV, tucked behind a disclosure because it is rarely used. */
export function UserImportForm() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportUsersResult | null>(null);

  return (
    <details className="adm-panel">
      <summary className="adm-panel-head" style={{ cursor: "pointer", paddingBottom: 16, listStyle: "none" }}>
        <div>
          <h2 className="adm-panel-title">Import accounts from a CSV file</h2>
          <p className="adm-panel-note">Columns: email, name, and optionally role. Existing emails are skipped.</p>
        </div>
        <span className="adm-link">Show</span>
      </summary>
      <div className="adm-panel-body" style={{ borderTop: "1px solid var(--adm-rule)" }}>
        <form
          className="adm-form-foot"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              setResult(await importUsersCsvAction(fd));
            });
          }}
        >
          <input type="file" name="file" accept=".csv,text/csv" required aria-label="CSV file" />
          <button type="submit" disabled={pending} className="adm-btn is-primary">
            {pending ? "Importing…" : "Import accounts"}
          </button>
        </form>
        <p className="adm-hint" style={{ marginTop: 10 }}>
          Each new account gets a random password that is never shown; people sign in with Google or LinkedIn where those are enabled.
        </p>
        {result ? (
          <p className={`adm-notice${result.errors.length ? " is-warn" : " is-good"}`} style={{ margin: "12px 0 0" }} role="status">
            Created {result.created}, skipped {result.skipped}.
            {result.errors.length ? ` ${result.errors.length} row(s) had problems: ${result.errors.join("; ")}` : ""}
          </p>
        ) : null}
      </div>
    </details>
  );
}
