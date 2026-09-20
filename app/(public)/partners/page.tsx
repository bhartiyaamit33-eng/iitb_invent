import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { PARTNER_TIERS } from "@/lib/site";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Partners",
  description:
    "IITB INV.ENT 2027 is hosted by the Desai Sethi School of Entrepreneurship at IIT Bombay.",
  path: "/partners",
});

export default function PartnersPage() {
  return (
    <PublicChrome crumbs={[{ href: "/partners", label: "Partners" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Partners", path: "/partners" },
          ]),
        )}
      />
      <main id="main">
        <PageHero
          kicker="Together"
          title="Partners"
          lede="Hosted by the Desai Sethi School of Entrepreneurship at IIT Bombay. Further partners will be named here when they are confirmed."
        />
        <div className="site-shell editorial">
          {PARTNER_TIERS.map((tier) => (
            <section key={tier.id}>
              <h2>{tier.title}</h2>
              {tier.partners.length === 0 ? (
                <p className="coming-card">To be announced</p>
              ) : (
                <div className="partner-grid">
                  {tier.partners.map((partner) => (
                    <p className="partner-card" key={partner.name}>
                      {partner.href ? (
                        <a
                          href={partner.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {partner.name}
                        </a>
                      ) : (
                        partner.name
                      )}
                    </p>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
    </PublicChrome>
  );
}
