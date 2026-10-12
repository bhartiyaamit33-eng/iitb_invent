import { prisma } from "@/lib/db";
import { plural } from "@/lib/admin/format";
import { Badge, Empty, PageHeader } from "@/components/admin/ui";
import { createFaqAction, updateFaqAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const faqs = edition
    ? await prisma.faq.findMany({ where: { editionId: edition.id }, orderBy: { sortOrder: "asc" } })
    : [];

  return (
    <div className="adm-page" style={{ maxWidth: 1000 }}>
      <PageHeader
        title="FAQs"
        description={`${plural(faqs.length, "question")} answered on the public FAQ page, in the order shown here.`}
      />
      <div className="adm-stack">
        <details className="adm-panel">
          <summary className="adm-panel-head" style={{ cursor: "pointer", paddingBottom: 16, listStyle: "none" }}>
            <h2 className="adm-panel-title">Add a question</h2>
            <span className="adm-link">Show form</span>
          </summary>
          <div className="adm-panel-body" style={{ borderTop: "1px solid var(--adm-rule)" }}>
            <form action={createFaqAction} className="adm-form">
              <label className="adm-field">
                <span className="adm-label">Question</span>
                <input name="question" required className="adm-input" />
              </label>
              <label className="adm-field">
                <span className="adm-label">Answer</span>
                <textarea name="answer" rows={4} className="adm-textarea" />
              </label>
              <div className="adm-form-foot">
                <label className="adm-check">
                  <input type="checkbox" name="isPublished" defaultChecked /> Published
                </label>
                <button type="submit" className="adm-btn is-primary" style={{ marginLeft: "auto" }}>
                  Add question
                </button>
              </div>
            </form>
          </div>
        </details>

        <section className="adm-panel is-flush">
          <div className="adm-panel-body" style={{ paddingTop: 0 }}>
            {faqs.length === 0 ? (
              <Empty title="No questions yet">Add the first one above.</Empty>
            ) : (
              faqs.map((f, i) => (
                <details key={f.id} className="adm-row" style={{ ["--adm-row-cols" as string]: "28px minmax(0,1fr) auto" }}>
                  <summary>
                    <span className="adm-hint">{i + 1}</span>
                    <span className="adm-row-title">{f.question}</span>
                    <span className="adm-row-meta">
                      <Badge tone={f.isPublished ? "good" : "neutral"}>{f.isPublished ? "Published" : "Hidden"}</Badge>
                      <span className="adm-row-edit">Edit</span>
                    </span>
                  </summary>
                  <div className="adm-row-body">
                    <form action={updateFaqAction} className="adm-form">
                      <input type="hidden" name="id" value={f.id} />
                      <label className="adm-field">
                        <span className="adm-label">Question</span>
                        <input name="question" defaultValue={f.question} className="adm-input" />
                      </label>
                      <label className="adm-field">
                        <span className="adm-label">Answer</span>
                        <textarea name="answer" defaultValue={f.answer} rows={5} className="adm-textarea" />
                      </label>
                      <div className="adm-form-foot">
                        <label className="adm-field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <span className="adm-label">Position</span>
                          <input name="sortOrder" type="number" defaultValue={f.sortOrder} className="adm-input" style={{ width: 80 }} />
                        </label>
                        <label className="adm-check">
                          <input type="checkbox" name="isPublished" defaultChecked={f.isPublished} /> Published
                        </label>
                        <button type="submit" className="adm-btn is-primary" style={{ marginLeft: "auto" }}>
                          Save question
                        </button>
                      </div>
                    </form>
                  </div>
                </details>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
