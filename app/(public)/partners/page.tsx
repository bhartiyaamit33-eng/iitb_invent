import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { PARTNERS, SPONSORS, type OrgMention } from "@/lib/site";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Partners & Sponsors",
  description:
    "IITB INV.ENT 2027 is hosted by the Desai Sethi School of Entrepreneurship at IIT Bombay. Sponsors and further institutional partners will be named here when they are confirmed.",
  path: "/partners",
});

function OrgList({
  items,
  empty,
}: {
  items: readonly OrgMention[];
  empty: string;
}) {
  if (items.length === 0) {
    return <p className="coming-card">{empty}</p>;
  }
  return (
    <ul className="org-list">
      {items.map((org) => (
        <li className="org-card" key={org.name} data-testid={`org-${slug(org.name)}`}>
          <p>
            {org.href ? (
              <a href={org.href} target="_blank" rel="noopener noreferrer">
                {org.name}
              </a>
            ) : (
              org.name
            )}
          </p>
          {org.note ? <p className="org-meta">{org.note}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function PartnersPage() {
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
          lede="One page, two sides. Sponsors on the left. Institutional partners on the right. Names and logos go up after they are confirmed — not while an agreement is still unsigned."
        />
        <div className="site-shell">
          <div className="org-split" data-testid="partners-split">
            <section id="sponsors" aria-labelledby="sponsors-heading">
              <p className="site-kicker is-blue">Sponsors</p>
              <h2 id="sponsors-heading">Companies</h2>
              <p className="lead">
                Space for the companies that back IITB INV.ENT. The list can
                grow; nothing is named here until it is confirmed.
              </p>
              <OrgList
                items={SPONSORS}
                empty="To be announced"
              />
            </section>
            <section id="institutions" aria-labelledby="institutions-heading">
              <p className="site-kicker">Partners</p>
              <h2 id="institutions-heading">Institutions</h2>
              <p className="lead">
                Hosted by DSSE at IIT Bombay, with campus partners E-Cell and
                SINE. Further institutions will be added on this side when they
                are confirmed.
              </p>
              <OrgList
                items={PARTNERS}
                empty="To be announced"
              />
            </section>
          </div>
        </div>
      </main>
    </PublicChrome>
  );
}
