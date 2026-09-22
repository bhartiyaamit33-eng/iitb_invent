import { PageHero } from "@/components/site/PageHero";
import { SiteProse } from "@/components/site/SiteProse";
import { SiteShell } from "@/components/site/SiteShell";
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
    <SiteShell crumbs={[{ href: "/code-of-conduct", label: "Code of conduct" }]}>
      <PageHero kicker="Policy" title={cms?.title || "Code of conduct"} />
      <section className="site-section is-tight">
        <div className="site-shell">
          <SiteProse text={cms?.body?.trim() || CONDUCT_FALLBACK} />
        </div>
      </section>
    </SiteShell>
  );
}
