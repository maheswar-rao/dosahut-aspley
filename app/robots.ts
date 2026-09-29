import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// No admin routes, API routes, or private paths exist on this static
// marketing site, so every crawler is allowed everywhere.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE.siteUrl}/sitemap.xml`,
  };
}
