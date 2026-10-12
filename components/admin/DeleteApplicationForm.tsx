import { deleteApplicationAction } from "@/app/(admin)/admin/applications/[id]/actions";

/** Permanent deletion, kept apart from everyday controls and gated by typing DELETE. */
export function DeleteApplicationForm({ id, name }: { id: string; name: string }) {
  return (
    <section id="delete-submission" className="adm-panel is-danger">
      <div className="adm-panel-head">
        <h2 className="adm-panel-title">Delete registration</h2>
      </div>
      <div className="adm-panel-body">
        <p className="adm-hint" style={{ margin: 0, color: "var(--adm-ink-2)" }}>
          Permanently removes {name}&apos;s registration, abstract and reviews. If they had
          a ticket, it is cancelled. Payment records are kept. Type DELETE to confirm.
        </p>
        <form action={deleteApplicationAction} className="adm-form-foot" style={{ marginTop: 12 }}>
          <input type="hidden" name="applicationId" value={id} />
          <input
            name="confirm"
            placeholder="DELETE"
            autoComplete="off"
            aria-label={`Type DELETE to delete the registration for ${name}`}
            className="adm-input"
            style={{ width: 130 }}
            data-testid="delete-application-confirm"
          />
          <button type="submit" className="adm-btn is-danger" data-testid="delete-application">
            Delete registration
          </button>
        </form>
      </div>
    </section>
  );
}
