import { ReticleDev } from './reticle-dev';
import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { publicFontClass } from "@/app/landing-preview-fonts";
import {
  DEFAULT_DESCRIPTION,
  HOME_TITLE,
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
    default: HOME_TITLE,
    template: "%s · IITB INV.ENT",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: "IITB INV.ENT",
  authors: [{ name: "Desai Sethi School of Entrepreneurship, IIT Bombay" }],
  creator: "DSSE, IIT Bombay",
  category: "education",
  keywords: [
    "IITB INV.ENT",
    "INV.ENT",
    "INVENT",
    "iitbinvent",
    "iitb_invent",
    "DSSE",
    "Entrepreneurship Research and Venture Practice Conference",
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
      <body className={`${sora.variable} ${publicFontClass} antialiased`}>
        {process.env.NODE_ENV === "development" ? <ReticleDev /> : null}
        {children}
        <SiteAnalytics />
      </body>
    </html>
  );
}
