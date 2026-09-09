import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "INVENT · DSSE Day · IIT Bombay",
    short_name: "INVENT",
    description:
      "Innovation and Entrepreneurship at DSSE, IIT Bombay. 31 January, annually.",
    start_url: "/",
    display: "browser",
    background_color: "#07111F",
    theme_color: "#07111F",
    lang: "en-IN",
  };
}
