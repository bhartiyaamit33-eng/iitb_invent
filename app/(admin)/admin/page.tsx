import Link from "next/link";

export default function AdminStubPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Admin · Organiser
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-wide text-teal-deep">
        Organiser CMS
      </h1>
      <p className="mt-4 text-ink-soft">
        You are signed in with admin access. Programme editing, check-in, and
        audit log UI land in later milestones — this console is reserved.
      </p>
      <ul className="mt-8 space-y-2 text-sm text-ink-soft">
        <li>
          <Link className="text-teal-deep underline-offset-2 hover:underline" href="/">
            ← Landing
          </Link>
        </li>
        <li>
          <Link
            className="text-teal-deep underline-offset-2 hover:underline"
            href="/programme"
          >
            Programme stub
          </Link>
        </li>
      </ul>
    </main>
  );
}
