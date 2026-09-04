"use client";

import { useState, useTransition } from "react";
import {
  importUsersCsvAction,
  type ImportUsersResult,
} from "@/app/(admin)/admin/users/actions";

export function UserImportForm() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportUsersResult | null>(null);

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-mute">
        Import users (CSV)
      </h2>
      <p className="mt-1 text-xs text-ink-soft">
        Columns: email, name, role (optional). Duplicates are skipped. Temp
        passwords are hashed; users reset via sign-in / OAuth.
      </p>
      <form
        className="mt-3 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await importUsersCsvAction(fd);
            setResult(res);
          });
        }}
      >
        <label className="block text-sm">
          <span className="sr-only">CSV file</span>
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="block w-full max-w-xs text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-teal-deep px-4 py-2 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal disabled:opacity-60"
        >
          {pending ? "Importing…" : "Import"}
        </button>
      </form>
      {result ? (
        <p className="mt-3 text-sm text-ink-soft" role="status">
          Created {result.created}, skipped {result.skipped}
          {result.errors.length
            ? ` · ${result.errors.length} issue(s): ${result.errors.join("; ")}`
            : ""}
        </p>
      ) : null}
    </div>
  );
}
