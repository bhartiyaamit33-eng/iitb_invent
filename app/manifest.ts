import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IITB INV.ENT 2027",
    short_name: "IITB INV.ENT",
    description:
      "Where entrepreneurship research meets venture practice. IITB INV.ENT is an entrepreneurship research and practice conference at IIT Bombay, 30-31 January 2027.",
    start_url: "/",
    display: "browser",
    background_color: "#F7F7F2",
    theme_color: "#0B2545",
    lang: "en-IN",
  };
}
