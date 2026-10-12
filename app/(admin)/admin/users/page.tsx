import Link from "next/link";
import { Role, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { withBasePath } from "@/lib/base-path";
import { getCurrentUser } from "@/lib/auth/session";
import { istDate, plural, type Tone } from "@/lib/admin/format";
import { UserImportForm } from "@/components/admin/UserImportForm";
import { Badge, Empty, Notice, PageHeader } from "@/components/admin/ui";
import { adminDeleteUserAction, updateUserRoleAction } from "./actions";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  ORGANISER: "Organiser",
  REVIEWER: "Reviewer",
  SPEAKER: "Speaker",
  VOLUNTEER: "Volunteer",
  ATTENDEE: "Attendee",
};

const ROLE_TONE: Partial<Record<Role, Tone>> = { ADMIN: "info", REVIEWER: "good", ORGANISER: "info" };

const TABS: { key: string; label: string; where: Prisma.UserWhereInput }[] = [
  { key: "all", label: "All", where: {} },
  { key: "admin", label: "Admins", where: { role: "ADMIN" } },
  { key: "reviewer", label: "Reviewers", where: { role: "REVIEWER" } },
  { key: "organiser", label: "Organisers", where: { role: "ORGANISER" } },
  { key: "attendee", label: "Attendees", where: { role: "ATTENDEE" } },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; deleted?: string; error?: string }>;
}) {
  const { q, role, deleted, error } = await searchParams;
  const query = q?.trim() ?? "";
  const current = TABS.find((t) => t.key === role) ?? TABS[0]!;
  const me = await getCurrentUser();
  const base: Prisma.UserWhereInput = {
    deletedAt: null,
    ...(query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [users, counts] = await Promise.all([
    prisma.user.findMany({
      where: { AND: [base, current.where] },
      orderBy: { createdAt: "desc" },
      take: 300,
      include: {
        profile: { select: { completeness: true, personaType: true } },
        registrations: { include: { edition: { select: { year: true } } } },
      },
    }),
    Promise.all(TABS.map((t) => prisma.user.count({ where: { AND: [base, t.where] } }))),
  ]);

  const tabHref = (key: string) => {
    const params = new URLSearchParams();
    if (key !== "all") params.set("role", key);
    if (query) params.set("q", query);
    const s = params.toString();
    return `/admin/users${s ? `?${s}` : ""}`;
  };

  return (
    <div className="adm-page">
      <PageHeader
        title="Users"
        description={`${plural(counts[0] ?? 0, "account")}. Choose who can review submissions and who can use this admin portal; changes apply on their next page load.`}
        actions={
          <a className="adm-btn" href={withBasePath("/api/admin/users/export")}>
            Export CSV
          </a>
        }
      />

      {deleted ? <Notice tone="good">Account deleted.</Notice> : null}
      {error ? (
        <Notice tone="bad">{error === "confirm" ? "Type DELETE in the confirm field to delete an account." : error}</Notice>
      ) : null}

      <div className="adm-stack">
        <UserImportForm />

        <section className="adm-panel is-flush">
          <div className="adm-panel-body" style={{ paddingTop: 14 }}>
            <div className="adm-toolbar">
              <nav className="adm-tabs" aria-label="Filter by role">
                {TABS.map((t, i) => (
                  <Link key={t.key} href={tabHref(t.key)} aria-current={t.key === current.key ? "true" : undefined}>
                    {t.label} <span className="count">{counts[i]}</span>
                  </Link>
                ))}
              </nav>
              <form className="adm-search" role="search">
                {current.key !== "all" ? <input type="hidden" name="role" value={current.key} /> : null}
                <input
                  className="adm-input"
                  name="q"
                  defaultValue={query}
                  placeholder="Name or email"
                  aria-label="Search users"
                />
                <button type="submit" className="adm-btn">
                  Search
                </button>
              </form>
            </div>

            {users.length === 0 ? (
              <Empty title="No accounts in this view">Try another tab or clear the search.</Empty>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Access</th>
                      <th>Profile</th>
                      <th>Tickets</th>
                      <th>Joined</th>
                      <th>
                        <span className="sr-only">Delete</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <span style={{ fontWeight: 620 }}>{u.name}</span>
                          {u.id === me?.id ? <span className="adm-hint"> (you)</span> : null}
                          <span className="adm-sub">{u.email}</span>
                        </td>
                        <td style={{ minWidth: 210 }}>
                          <Badge tone={ROLE_TONE[u.role] ?? "neutral"}>{ROLE_LABEL[u.role]}</Badge>
                          {u.id === me?.id ? null : (
                            <details style={{ display: "inline-block", marginLeft: 6 }}>
                              <summary className="adm-btn is-quiet is-small" style={{ listStyle: "none", display: "inline-flex" }}>
                                Change
                              </summary>
                            <form action={updateUserRoleAction} style={{ display: "flex", gap: 6, marginTop: 8 }}>
                              <input type="hidden" name="userId" value={u.id} />
                              <select
                                name="role"
                                defaultValue={u.role}
                                aria-label={`Access for ${u.email}`}
                                className="adm-select is-small"
                              >
                                {Object.values(Role).map((r) => (
                                  <option key={r} value={r}>
                                    {ROLE_LABEL[r]}
                                  </option>
                                ))}
                              </select>
                              <button type="submit" className="adm-btn is-small">
                                Save
                              </button>
                            </form>
                            </details>
                          )}
                        </td>
                        <td>
                          {u.profile ? `${u.profile.completeness}% complete` : "No profile"}
                          {u.profile?.personaType ? (
                            <span className="adm-sub">
                              {u.profile.personaType.charAt(0) + u.profile.personaType.slice(1).toLowerCase()}
                            </span>
                          ) : null}
                        </td>
                        <td>
                          {u.registrations.length
                            ? u.registrations.map((r) => (
                                <span key={r.id} className="adm-sub" style={{ marginTop: 0 }}>
                                  {r.edition.year}, {r.status.toLowerCase()}
                                </span>
                              ))
                            : <span className="adm-sub" style={{ marginTop: 0 }}>None</span>}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>{istDate(u.createdAt)}</td>
                        <td className="num">
                          {u.id === me?.id ? null : (
                            <details>
                              <summary className="adm-btn is-quiet is-bad is-small" style={{ listStyle: "none" }}>
                                Delete…
                              </summary>
                              <form
                                action={adminDeleteUserAction}
                                style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}
                              >
                                <input type="hidden" name="userId" value={u.id} />
                                <input
                                  name="confirm"
                                  placeholder="DELETE"
                                  autoComplete="off"
                                  aria-label={`Type DELETE to delete ${u.email}`}
                                  className="adm-input is-small"
                                  style={{ width: 96 }}
                                />
                                <button type="submit" className="adm-btn is-danger is-small">
                                  Delete
                                </button>
                              </form>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
