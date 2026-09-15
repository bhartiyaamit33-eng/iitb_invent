import { Prose } from "@/components/Prose";
import { PublicChrome } from "@/components/PublicChrome";
import { getPublishedPage } from "@/lib/pages";
import { CONDUCT_FALLBACK } from "@/lib/seo-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Code of conduct",
  description:
    "Professional standards for INV.ENT at IIT Bombay. Report issues to support@iitbinvent.com.",
  path: "/code-of-conduct",
});

export default async function CodeOfConductPage() {
  const cms = await getPublishedPage("code-of-conduct");
  return (
    <PublicChrome
      crumbs={[{ href: "/code-of-conduct", label: "Code of conduct" }]}
    >
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl tracking-wide text-teal-deep">
          {cms?.title || "Code of conduct"}
        </h1>
        <div className="mt-8">
          <Prose text={cms?.body?.trim() || CONDUCT_FALLBACK} />
        </div>
      </main>
    </PublicChrome>
  );
}
