import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { getPublishedOrgs, type PublicOrg } from "@/lib/orgs-public";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Partners & Sponsors",
  description:
    "IITB INV.ENT 2027 is hosted by the Desai Sethi School of Entrepreneurship at IIT Bombay. Sponsors and further institutional partners are named here when they are confirmed.",
  path: "/partners",
});

function OrgList({ items }: { items: readonly PublicOrg[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="org-list">
      {items.map((org) => (
        <li className="org-card" key={org.id} data-testid={`org-${slug(org.name)}`}>
          {org.websiteUrl ? (
            <a href={org.websiteUrl} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="org-logo" src={org.logoUrl} alt="" />
              <span>{org.name}</span>
            </a>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="org-logo" src={org.logoUrl} alt="" />
              <span>{org.name}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function PartnersPage() {
  const { sponsors, partners } = await getPublishedOrgs();
  const hasSponsors = sponsors.length > 0;
  const hasPartners = partners.length > 0;
  const hasAny = hasSponsors || hasPartners;

  return (
    <PublicChrome crumbs={[{ href: "/partners", label: "Partners & Sponsors" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Partners & Sponsors", path: "/partners" },
          ]),
        )}
      />
      <main id="main">
        <PageHero
          kicker="Together"
          title="Partners & Sponsors"
          testId="partners-heading"
          lede="Hosted by the Desai Sethi School of Entrepreneurship at IIT Bombay. Confirmed companies and institutions appear here with their logos — nothing is listed while an agreement is still unsigned."
        />
        {hasAny ? (
          <div className="site-shell">
            <div
              className={hasSponsors && hasPartners ? "org-split" : "org-split is-single"}
              data-testid="partners-split"
            >
              {hasSponsors ? (
                <section id="sponsors" aria-labelledby="sponsors-heading">
                  <p className="site-kicker is-blue">Sponsors</p>
                  <h2 id="sponsors-heading">Companies</h2>
                  <OrgList items={sponsors} />
                </section>
              ) : null}
              {hasPartners ? (
                <section id="institutions" aria-labelledby="institutions-heading">
                  <p className="site-kicker">Partners</p>
                  <h2 id="institutions-heading">Institutions</h2>
                  <OrgList items={partners} />
                </section>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>
    </PublicChrome>
  );
}
