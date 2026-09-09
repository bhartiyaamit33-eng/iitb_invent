import { ReticleDev } from './reticle-dev';
import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME_LONG,
  SITE_TAGLINE,
  originForSeo,
} from "@/lib/seo";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(originForSeo()),
  title: {
    default: SITE_NAME_LONG,
    template: "%s · INVENT · IIT Bombay",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "INVENT",
  authors: [{ name: "Desai Sethi School of Entrepreneurship, IIT Bombay" }],
  creator: "DSSE, IIT Bombay",
  category: "education",
  keywords: [
    "INVENT",
    "INV.ENT",
    "iitbinvent",
    "iitb_invent",
    "DSSE",
    "DSSE Day",
    "IIT Bombay",
    "Desai Sethi School of Entrepreneurship",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME_LONG,
    title: SITE_NAME_LONG,
    description: `${SITE_TAGLINE}. ${DEFAULT_DESCRIPTION}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME_LONG,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} antialiased`}>
        {process.env.NODE_ENV === "development" ? <ReticleDev /> : null}
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
