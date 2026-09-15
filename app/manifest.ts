import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "INV.ENT · IIT Bombay",
    short_name: "INV.ENT",
    description:
      "Entrepreneurship Research and Venture Practice Conference at DSSE, IIT Bombay. 30-31 January 2027. 30 January is Day Zero.",
    start_url: "/",
    display: "browser",
    background_color: "#07111F",
    theme_color: "#07111F",
    lang: "en-IN",
  };
}
