import { PublicChrome } from "@/components/PublicChrome";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Programme",
  description:
    "IITB INV.ENT 2027 programme — coming soon. 30-31 January 2027, IIT Bombay.",
  path: "/programme",
});

export default function ProgrammePage() {
  return (
    <PublicChrome crumbs={[{ href: "/programme", label: "Programme" }]}>
      <main
        className="mx-auto max-w-3xl px-4 py-10 sm:px-6"
        data-testid="programme-page"
      >
        <h1 className="font-display text-4xl tracking-wide text-teal-deep">
          Programme
        </h1>
        <p
          className="mt-4 text-lg leading-8 text-ink-soft"
          data-testid="programme-coming-soon"
        >
          Coming soon
        </p>
      </main>
    </PublicChrome>
  );
}
