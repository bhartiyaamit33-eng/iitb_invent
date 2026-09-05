export default function SessionDetailLoading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Programme
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
        Loading session…
      </h1>
      <p className="mt-3 text-ink-soft">Fetching the session details.</p>
    </main>
  );
}
