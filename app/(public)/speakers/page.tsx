import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { PageHero } from "@/components/site/PageHero";
import { getPublishedSpeakers } from "@/lib/speakers-public";
import {
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Speakers",
  description:
    "Speakers at IITB INV.ENT 2027, the entrepreneurship research and practice conference at IIT Bombay.",
  path: "/speakers",
});

export default async function SpeakersPage() {
  const speakers = await getPublishedSpeakers();

  return (
    <PublicChrome crumbs={[{ href: "/speakers", label: "Speakers" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Speakers", path: "/speakers" },
          ]),
        )}
      />
      <main id="main">
        <PageHero
          kicker="Line-up"
          title="Speakers"
          lede={
            speakers.length === 0
              ? "The 2027 speakers will be announced here. We do not list names until they are confirmed."
              : "Confirmed speakers for IITB INV.ENT 2027."
          }
        />
        <div className="site-shell editorial">
          {speakers.length === 0 ? (
            <p className="coming-card">Coming soon</p>
          ) : (
            <div className="speaker-grid">
              {speakers.map((speaker) => (
                <article className="speaker-card" key={speaker.id}>
                  {speaker.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={speaker.photoUrl}
                      alt=""
                      className="speaker-photo"
                    />
                  ) : null}
                  <strong>{speaker.name}</strong>
                  <span>
                    {[
                      speaker.isKeynote ? "Keynote" : null,
                      speaker.title,
                      speaker.organisation,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </PublicChrome>
  );
}
