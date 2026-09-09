import type { MetadataRoute } from "next";
import { originForSeo } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = originForSeo();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/api/", "/pay/", "/t/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
