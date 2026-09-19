import { JsonLd } from "@/components/JsonLd";
import { PublicChrome } from "@/components/PublicChrome";
import { ANANTHA } from "@/lib/accommodation";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  graphJsonLd,
  organizationJsonLd,
  pageMetadata,
} from "@/lib/seo";
import { AccommodationStay } from "./AccommodationStay";

export const metadata = pageMetadata({
  title: "Accommodation for IITB INV.ENT at IIT Bombay",
  description:
    "Twin-sharing IIT Bombay guest houses (first-come first-served, guests pay) and discounted rates at Anantha Hotel, Bhandup West, for IITB INV.ENT 2027.",
  path: "/accommodation",
});

export default function AccommodationPage() {
  return (
    <PublicChrome crumbs={[{ href: "/accommodation", label: "Accommodation" }]}>
      <JsonLd
        data={graphJsonLd(
          organizationJsonLd(),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Accommodation", path: "/accommodation" },
          ]),
          {
            "@type": "Hotel",
            name: ANANTHA.name,
            alternateName: ANANTHA.brand,
            email: ANANTHA.email,
            telephone: ANANTHA.phones[0]?.display,
            url: ANANTHA.mapsUrl,
            image: absoluteUrl(ANANTHA.photo.src),
            address: {
              "@type": "PostalAddress",
              streetAddress: "Near S Ward BMC Office, LBS Marg",
              addressLocality: "Bhandup West",
              addressRegion: "Maharashtra",
              postalCode: "400078",
              addressCountry: "IN",
            },
          },
        )}
      />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-mute">
          IITB INV.ENT 2027 · 30–31 January
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-teal-deep">
          Accommodation
        </h1>
        <p className="mt-4 text-lg leading-8 text-ink">
          Stay on campus at the IIT Bombay guest houses, or book a nearby hotel
          in Bhandup West at the quoted conference rates.
        </p>
        <div className="mt-10">
          <AccommodationStay />
        </div>
      </main>
    </PublicChrome>
  );
}
