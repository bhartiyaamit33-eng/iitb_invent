import { prisma } from "@/lib/db";
import { adminDeleteUserAction } from "./actions";
import { UserImportForm } from "@/components/admin/UserImportForm";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; deleted?: string; error?: string }>;
}) {
  const { q, deleted, error } = await searchParams;
  const query = q?.trim() ?? "";

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      profile: true,
      registrations: {
        include: { edition: { select: { year: true, name: true } } },
      },
    },
  });

  return (
    <main className="px-6 py-10">
      <h1 className="font-display text-4xl tracking-wide text-teal-deep">Users</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Export, import, and delete platform accounts. Admin-only.
      </p>

      {deleted ? (
        <p
          className="mt-4 rounded-md border border-teal/30 bg-teal/5 px-4 py-3 text-sm text-teal-deep"
          role="status"
        >
          User deleted.
        </p>
      ) : null}
      {error === "confirm" ? (
        <p
          className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          Type DELETE in the confirm field to remove a user.
        </p>
      ) : null}
      {error && error !== "confirm" ? (
        <p
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          href="/api/admin/users/export"
          className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-teal-deep hover:border-teal"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-4">
        <UserImportForm />
      </div>

      <form className="mt-6">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search name or email"
          className="w-full max-w-md rounded-md border border-line bg-white px-3 py-2.5 outline-none focus:border-teal"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-[0.1em] text-mute">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Persona</th>
              <th className="px-4 py-3">Profile %</th>
              <th className="px-4 py-3">Directory</th>
              <th className="px-4 py-3">Registrations</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-ink-soft">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u.profile?.personaType ?? "—"}</td>
                <td className="px-4 py-3">{u.profile?.completeness ?? 0}</td>
                <td className="px-4 py-3">
                  {u.profile?.directoryOptIn ? "on" : "off"}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {u.registrations
                    .map((r) => `${r.edition.year} (${r.status})`)
                    .join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-xs text-mute">
                  {u.createdAt.toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-3">
                  <form action={adminDeleteUserAction} className="flex flex-col gap-1">
                    <input type="hidden" name="userId" value={u.id} />
                    <input
                      name="confirm"
                      placeholder="DELETE"
                      aria-label={`Confirm delete ${u.email}`}
                      className="w-24 rounded border border-line px-2 py-1 text-xs"
                    />
                    <button
                      type="submit"
                      className="text-left text-xs font-semibold text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
