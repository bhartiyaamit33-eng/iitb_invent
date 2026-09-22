import { PageHero } from "@/components/site/PageHero";
import { SiteProse } from "@/components/site/SiteProse";
import { SiteShell } from "@/components/site/SiteShell";
import { getPublishedPage } from "@/lib/pages";
import { PRIVACY_FALLBACK } from "@/lib/seo-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy",
  description:
    "How IITB INV.ENT (iitbinvent.com) handles profile data and data requests at DSSE, IIT Bombay.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const cms = await getPublishedPage("privacy");
  return (
    <SiteShell crumbs={[{ href: "/privacy", label: "Privacy" }]}>
      <PageHero kicker="Policy" title={cms?.title || "Privacy"} />
      <section className="site-section is-tight">
        <div className="site-shell">
          <SiteProse text={cms?.body?.trim() || PRIVACY_FALLBACK} />
        </div>
      </section>
    </SiteShell>
  );
}
