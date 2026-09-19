import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IITB INV.ENT · IIT Bombay",
    short_name: "IITB INV.ENT",
    description:
      "IITB INV.ENT is an entrepreneurship research and practice conference conducted by the Desai Sethi School of Entrepreneurship, IIT Bombay. 30-31 January 2027.",
    start_url: "/",
    display: "browser",
    background_color: "#f6f3ec",
    theme_color: "#f6f3ec",
    lang: "en-IN",
  };
}
