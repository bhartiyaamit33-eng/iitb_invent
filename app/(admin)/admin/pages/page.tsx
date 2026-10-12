import { prisma } from "@/lib/db";
import { plural } from "@/lib/admin/format";
import { Badge, Empty, PageHeader } from "@/components/admin/ui";
import { updatePageAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const pages = edition
    ? await prisma.page.findMany({ where: { editionId: edition.id }, orderBy: { slug: "asc" } })
    : [];

  return (
    <div className="adm-page" style={{ maxWidth: 1000 }}>
      <PageHeader
        title="Pages"
        description={`${plural(pages.length, "page")} of long-form copy, such as travel, privacy and the code of conduct. Bodies are written in Markdown.`}
      />
      <section className="adm-panel is-flush">
        <div className="adm-panel-body" style={{ paddingTop: 0 }}>
          {pages.length === 0 ? (
            <Empty title="No pages for this edition" />
          ) : (
            pages.map((p) => (
              <details key={p.id} className="adm-row">
                <summary>
                  <span>
                    <span className="adm-row-title">{p.title}</span>
                    <span className="adm-sub">/{p.slug}</span>
                  </span>
                  <span className="adm-row-meta">
                    <Badge tone={p.isPublished ? "good" : "neutral"}>{p.isPublished ? "Published" : "Draft"}</Badge>
                    <span className="adm-row-edit">Edit</span>
                  </span>
                </summary>
                <div className="adm-row-body">
                  <form action={updatePageAction} className="adm-form">
                    <input type="hidden" name="id" value={p.id} />
                    <label className="adm-field">
                      <span className="adm-label">Title</span>
                      <input name="title" defaultValue={p.title} className="adm-input" />
                    </label>
                    <label className="adm-field">
                      <span className="adm-label">Body (Markdown)</span>
                      <textarea name="body" defaultValue={p.body} rows={14} className="adm-textarea is-code" />
                    </label>
                    <div className="adm-form-foot">
                      <label className="adm-check">
                        <input type="checkbox" name="isPublished" defaultChecked={p.isPublished} /> Published
                      </label>
                      <button type="submit" className="adm-btn is-primary" style={{ marginLeft: "auto" }}>
                        Save page
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
  );
}
