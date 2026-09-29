import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// This is a genuine single-page site (app/page.tsx is the only route) — every
// section (#menu, #catering, #location, #why-us, #our-story) is an anchor
// within that one page, not a separate crawlable URL, so only the homepage
// belongs in the sitemap. Search engines don't index URL fragments as
// distinct pages; listing them here would just be noise.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
