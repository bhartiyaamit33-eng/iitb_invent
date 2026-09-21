import type { Metadata } from "next";
import { CANONICAL_FAQS } from "@/lib/seo-content";

export const SITE_NAME = "IITB INV.ENT";
export const SITE_NAME_LONG = "IITB INV.ENT · IIT Bombay";
export const SITE_TAGLINE =
  "Where entrepreneurship research meets venture practice";

export const ALTERNATE_NAMES = [
  "INVENT",
  "Inv.ent",
  "iitbinvent",
  "iitb_invent",
  "IIT Bombay INV.ENT",
  "IITB INV.ENT",
] as const;

export const DEFAULT_DESCRIPTION =
  "IITB INV.ENT is an entrepreneurship research and practice conference conducted by the Desai Sethi School of Entrepreneurship, IIT Bombay. 30-31 January 2027 at the DSSE Building, Powai, Mumbai.";

export const EVENT_2027 = {
  name: "IITB INV.ENT 2027",
  start: "2027-01-30T09:00:00+05:30",
  end: "2027-01-31T19:30:00+05:30",
  timezone: "Asia/Kolkata",
} as const;

export const VENUE = {
  name: "Desai Sethi School of Entrepreneurship · DSSE Building",
  street: "DSSE Building, IIT Bombay",
  locality: "Powai",
  region: "Maharashtra",
  postal: "400076",
  country: "IN",
  lat: 19.1334,
  lng: 72.9153,
  formatted:
    "Desai Sethi School of Entrepreneurship · DSSE Building · IIT Bombay · Powai, Mumbai 400076",
} as const;

export const SAME_AS = [
  "https://www.dsse.iitb.ac.in/",
  "https://www.iitb.ac.in/",
  "https://ecell.in",
  "https://sineiitb.org",
] as const;

export const INDEXABLE_PATHS = [
  "/",
  "/about",
  "/research",
  "/programme",
  "/speakers",
  "/workshop",
  "/accommodation",
  "/sponsors",
  "/contact",
  "/faq",
  "/travel",
  "/privacy",
  "/code-of-conduct",
  "/login",
  "/signup",
] as const;

export const noIndex: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export function originForSeo(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://iitbinvent.com";
  try {
    const url = new URL(raw);
    const host = url.hostname;
    if (host === "localhost" || host === "127.0.0.1" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      return "https://iitbinvent.com";
    }
    return url.origin.replace(/\/$/, "");
  } catch {
    return "https://iitbinvent.com";
  }
}

export function absoluteUrl(path = "/"): string {
  const origin = originForSeo();
  if (!path || path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      types: { "text/plain": absoluteUrl("/llms.txt") },
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      type: "website",
      siteName: SITE_NAME_LONG,
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
  };
}

function addressJsonLd() {
  return {
    "@type": "PostalAddress",
    streetAddress: VENUE.street,
    addressLocality: VENUE.locality,
    addressRegion: VENUE.region,
    postalCode: VENUE.postal,
    addressCountry: VENUE.country,
  };
}

export function organizationJsonLd() {
  const origin = originForSeo();
  return {
    "@type": ["Organization", "EducationalOrganization"],
    "@id": `${origin}/#organization`,
    name: SITE_NAME,
    legalName:
      "IITB INV.ENT · Desai Sethi School of Entrepreneurship, IIT Bombay",
    alternateName: [...ALTERNATE_NAMES],
    url: `${origin}/`,
    email: "support@iitbinvent.com",
    description: DEFAULT_DESCRIPTION,
    logo: `${origin}/assets/dsse-logo.png`,
    image: `${origin}/opengraph-image`,
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "Indian Institute of Technology Bombay",
      alternateName: ["IIT Bombay", "IITB"],
      url: "https://www.iitb.ac.in/",
    },
    department: {
      "@type": "CollegeOrUniversity",
      name: "Desai Sethi School of Entrepreneurship",
      alternateName: ["DSSE", "DSSE IIT Bombay", "DSSE IITB"],
      url: "https://www.dsse.iitb.ac.in/",
    },
    address: addressJsonLd(),
    geo: {
      "@type": "GeoCoordinates",
      latitude: VENUE.lat,
      longitude: VENUE.lng,
    },
    sameAs: [...SAME_AS],
  };
}

export function websiteJsonLd() {
  const origin = originForSeo();
  return {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    url: `${origin}/`,
    name: SITE_NAME,
    alternateName: [...ALTERNATE_NAMES],
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: { "@id": `${origin}/#organization` },
  };
}

export function eventJsonLd() {
  const origin = originForSeo();
  return {
    "@type": "Event",
    "@id": `${origin}/#event-2027`,
    name: EVENT_2027.name,
    alternateName: [
      "INVENT 2027",
      "IIT Bombay INV.ENT 2027",
      "Entrepreneurship Research and Venture Practice Conference",
    ],
    description: DEFAULT_DESCRIPTION,
    url: `${origin}/`,
    image: `${origin}/opengraph-image`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    startDate: EVENT_2027.start,
    endDate: EVENT_2027.end,
    location: {
      "@type": "Place",
      name: VENUE.name,
      address: addressJsonLd(),
      geo: {
        "@type": "GeoCoordinates",
        latitude: VENUE.lat,
        longitude: VENUE.lng,
      },
    },
    organizer: { "@id": `${origin}/#organization` },
    performer: {
      "@type": "EducationalOrganization",
      name: "Desai Sethi School of Entrepreneurship",
      url: "https://www.dsse.iitb.ac.in/",
    },
  };
}

export function faqPageJsonLd() {
  return {
    "@type": "FAQPage",
    "@id": `${originForSeo()}/faq#faq`,
    mainEntity: CANONICAL_FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function graphJsonLd(
  ...nodes: Record<string, unknown>[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
