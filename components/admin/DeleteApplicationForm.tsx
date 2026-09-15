import { deleteApplicationAction } from "@/app/(admin)/admin/applications/[id]/actions";

export function DeleteApplicationForm({
  id,
  name,
  compact,
}: {
  id: string;
  name: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <form action={deleteApplicationAction} className="flex flex-col gap-1">
        <input type="hidden" name="applicationId" value={id} />
        <input type="hidden" name="from" value="list" />
        <input
          name="confirm"
          placeholder="DELETE"
          aria-label={`Confirm delete submission for ${name}`}
          className="w-24 rounded border border-line px-2 py-1 text-xs"
        />
        <button
          type="submit"
          className="rounded border border-red-200 px-2 py-1 text-left text-xs font-semibold text-red-700 hover:bg-red-50"
          data-testid={`delete-application-${id}`}
        >
          Delete submission
        </button>
      </form>
    );
  }

  return (
    <section
      id="delete-submission"
      className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5"
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-red-800">
        Delete submission
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Permanently removes {name}&apos;s abstract, reviews, and this
        application. If this was their paid place, the event ticket is
        cancelled. Type DELETE to confirm.
      </p>
      <form action={deleteApplicationAction} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="applicationId" value={id} />
        <label className="text-sm">
          <span className="sr-only">Type DELETE to confirm</span>
          <input
            name="confirm"
            placeholder="DELETE"
            aria-label={`Confirm delete submission for ${name}`}
            className="w-40 rounded-md border border-red-200 bg-white px-3 py-2.5"
            data-testid="delete-application-confirm"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
          data-testid="delete-application"
        >
          Delete submission
        </button>
      </form>
    </section>
  );
}
