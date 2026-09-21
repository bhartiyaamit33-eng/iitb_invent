import { Prose } from "@/components/Prose";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
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
    <PublicChrome crumbs={[{ href: "/privacy", label: "Privacy" }]}>
      <main id="main">
        <PageHero title={cms?.title || "Privacy"} />
        <div className="site-shell editorial">
          <Prose text={cms?.body?.trim() || PRIVACY_FALLBACK} />
        </div>
      </main>
    </PublicChrome>
  );
}
