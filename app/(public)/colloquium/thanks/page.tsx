import Link from "next/link";

export const metadata = {
  title: "Application received · Inv.ent 2027 Conference",
};

export default function ColloquiumThanksPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
        Inv.ent 2027 Conference
      </p>
      <h1
        className="mt-2 font-display text-4xl tracking-wide text-teal-deep"
        data-testid="colloquium-thanks"
      >
        Application received
      </h1>
      <p className="mt-4 text-ink-soft">
        Thank you. Organisers at the Desai Sethi School of Entrepreneurship will
        review your submission for Inv.ent 2027. If you asked for a copy, it is
        on its way to the email you entered.
      </p>
      <p className="mt-3 text-sm text-mute">
        Questions:{" "}
        <a href="mailto:support@iitbinvent.com">support@iitbinvent.com</a>
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-md bg-teal-deep px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-teal"
        >
          Back to Inv.ent
        </Link>
        <Link
          href="/programme"
          className="rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-teal-deep hover:border-teal"
        >
          See the programme
        </Link>
      </div>
    </main>
  );
}
