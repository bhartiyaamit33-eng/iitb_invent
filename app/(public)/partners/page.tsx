import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { NameLanes } from "@/components/landing/NameLanes";
import { getPublishedOrgs } from "@/lib/orgs-public";
import {
  HOME_TITLE,
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { sponsors, partners } = await getPublishedOrgs();
  const has = sponsors.length + partners.length > 0;
  return pageMetadata({
    title: has ? "Sponsors" : HOME_TITLE,
    description: has
      ? "Sponsors of IITB INV.ENT 2027 at IIT Bombay."
      : "IITB INV.ENT is an entrepreneurship research and practice conference at IIT Bombay.",
    path: "/partners",
    absoluteTitle: !has,
  });
}

export default async function PartnersPage() {
  const { sponsors, partners } = await getPublishedOrgs();
  const orgs = [...sponsors, ...partners];

  return (
    <PublicChrome
      crumbs={
        orgs.length > 0 ? [{ href: "/partners", label: "Sponsors" }] : undefined
      }
    >
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd(
            orgs.length > 0
              ? [
                  { name: "Home", path: "/" },
                  { name: "Sponsors", path: "/partners" },
                ]
              : [{ name: "Home", path: "/" }],
          ),
        )}
      />
      <main id="main">
        {orgs.length > 0 ? (
          <section className="sponsor-band" data-testid="partners-split">
            <div className="site-shell">
              <h1 data-testid="partners-heading">Sponsors</h1>
            </div>
            <NameLanes orgs={orgs} />
          </section>
        ) : null}
      </main>
    </PublicChrome>
  );
}
