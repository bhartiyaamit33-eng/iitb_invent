import { deleteMyApplicationAction } from "@/app/(public)/conference/actions";

export function DeleteMyApplicationForm({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <div
      className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4"
      data-testid="delete-my-application"
    >
      <p className="text-sm font-semibold text-red-800">Delete this submission</p>
      <p className="mt-1 text-sm text-ink-soft">
        Removes {name}&apos;s abstract so you can submit again. The submitted
        time on the new application will be now. Type DELETE to confirm.
      </p>
      <form
        action={deleteMyApplicationAction}
        className="mt-3 flex flex-wrap items-end gap-3"
      >
        <input type="hidden" name="applicationId" value={id} />
        <label className="text-sm">
          <span className="sr-only">Type DELETE to confirm</span>
          <input
            name="confirm"
            placeholder="DELETE"
            autoComplete="off"
            aria-label={`Confirm delete submission for ${name}`}
            className="w-40 rounded-md border border-red-200 bg-white px-3 py-2.5"
            data-testid="delete-my-application-confirm"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
          data-testid="delete-my-application-submit"
        >
          Delete submission
        </button>
      </form>
    </div>
  );
}
