import { Prose } from "@/components/Prose";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { getPublishedPage } from "@/lib/pages";
import { CONDUCT_FALLBACK } from "@/lib/seo-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Code of conduct",
  description:
    "Professional standards for IITB INV.ENT at IIT Bombay. Report issues to support@iitbinvent.com.",
  path: "/code-of-conduct",
});

export default async function CodeOfConductPage() {
  const cms = await getPublishedPage("code-of-conduct");
  return (
    <PublicChrome
      crumbs={[{ href: "/code-of-conduct", label: "Code of conduct" }]}
    >
      <main id="main">
        <PageHero title={cms?.title || "Code of conduct"} />
        <div className="site-shell editorial">
          <Prose text={cms?.body?.trim() || CONDUCT_FALLBACK} />
        </div>
      </main>
    </PublicChrome>
  );
}
