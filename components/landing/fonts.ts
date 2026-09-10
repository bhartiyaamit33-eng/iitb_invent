import { Inter, Playfair_Display } from "next/font/google";

export const landingInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const landingPlayfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export function landingFontClassName() {
  return `${landingInter.variable} ${landingPlayfair.variable}`;
}
