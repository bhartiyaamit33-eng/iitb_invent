import type { CSSProperties } from "react";
import { prisma } from "@/lib/db";
import { Empty, PageHeader, Panel } from "@/components/admin/ui";
import { createStatAction, updateStatAction } from "../actions";

export const dynamic = "force-dynamic";

const ROW: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr) 90px auto",
  gap: 10,
  alignItems: "end",
};

export default async function AdminStatsPage() {
  const edition = await prisma.edition.findFirst({ where: { isCurrent: true } });
  const stats = edition
    ? await prisma.editionStat.findMany({ where: { editionId: edition.id }, orderBy: { sortOrder: "asc" } })
    : [];

  return (
    <div className="adm-page is-narrow">
      <PageHeader
        title="Homepage figures"
        description={
          <>
            The short facts in the homepage strip, such as founding year or alumni ventures. They were seeded from{" "}
            <a className="adm-link" href="https://www.dsse.iitb.ac.in/" target="_blank" rel="noreferrer">
              dsse.iitb.ac.in
            </a>
            ; keep them current.
          </>
        }
      />
      <div className="adm-stack">
        <Panel title="Add a figure">
          <form action={createStatAction} style={ROW}>
            <label className="adm-field">
              <span className="adm-label">Label</span>
              <input name="label" required className="adm-input" placeholder="e.g. Startups incubated" />
            </label>
            <label className="adm-field">
              <span className="adm-label">Value</span>
              <input name="value" required className="adm-input" placeholder="e.g. 200+" />
            </label>
            <span />
            <button type="submit" className="adm-btn is-primary">
              Add
            </button>
          </form>
        </Panel>

        <Panel title="Figures on the homepage" note="Lower positions appear first." flush>
          {stats.length === 0 ? (
            <Empty title="No figures yet" />
          ) : (
            <ul className="adm-list">
              {stats.map((s) => (
                <li key={s.id} style={{ display: "block" }}>
                  <form action={updateStatAction} style={ROW}>
                    <input type="hidden" name="id" value={s.id} />
                    <label className="adm-field">
                      <span className="adm-label">Label</span>
                      <input name="label" defaultValue={s.label} className="adm-input" />
                    </label>
                    <label className="adm-field">
                      <span className="adm-label">Value</span>
                      <input name="value" defaultValue={s.value} className="adm-input" style={{ fontWeight: 650 }} />
                    </label>
                    <label className="adm-field">
                      <span className="adm-label">Position</span>
                      <input name="sortOrder" type="number" defaultValue={s.sortOrder} className="adm-input" />
                    </label>
                    <button type="submit" className="adm-btn">
                      Save
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
