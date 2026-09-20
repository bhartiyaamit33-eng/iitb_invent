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
    "IITB INV.ENT 2027 is hosted by DSSE at IIT Bombay. Sponsors and institutional partners — including conversations with GreyLabs AI, IIT Kanpur, and IIT Kharagpur — are listed here as they are confirmed.",
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
          <p className="org-meta">
            {org.status === "in-conversation"
              ? "In conversation"
              : org.note ?? "Confirmed"}
          </p>
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
          lede="One page, two sides. Sponsors on the left. Institutional partners on the right. Conversations are named; logos go up when a partnership is confirmed."
        />
        <div className="site-shell">
          <div className="org-split" data-testid="partners-split">
            <section id="sponsors" aria-labelledby="sponsors-heading">
              <p className="site-kicker is-blue">Sponsors</p>
              <h2 id="sponsors-heading">Companies</h2>
              <p className="lead">
                We are approaching organisations to sponsor IITB INV.ENT 2027,
                including GreyLabs AI. Further names will be added as
                conversations close.
              </p>
              <OrgList
                items={SPONSORS}
                empty="Sponsors will be named here when conversations close."
              />
            </section>
            <section id="institutions" aria-labelledby="institutions-heading">
              <p className="site-kicker">Partners</p>
              <h2 id="institutions-heading">Institutions</h2>
              <p className="lead">
                Hosted by DSSE at IIT Bombay. We are in conversation with
                IIT Kanpur and IIT Kharagpur, alongside campus partners E-Cell
                and SINE.
              </p>
              <OrgList
                items={PARTNERS}
                empty="Partners will be named here when they are confirmed."
              />
            </section>
          </div>
        </div>
      </main>
    </PublicChrome>
  );
}
