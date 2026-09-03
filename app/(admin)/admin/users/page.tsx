import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
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
        All platform accounts, profiles, and edition registrations.
      </p>

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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
