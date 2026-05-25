import type { MetadataRoute } from "next";
import { ixaiSiteUrl } from "@/src/lib/brand/metadata";

// v1.33 — robots.txt. Public intelligence is indexable; internal /
// authenticated / API routes are not.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/daily-brief",
          "/daily-brief/",
          "/weekly-brief",
          "/weekly-brief/",
          "/market",
          "/fcn",
          "/about",
          "/pro",
          "/ixai",
          "/feedback",
          "/api/og",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/account",
          "/account/",
          "/login",
          "/register",
          "/auth",
          "/auth/",
          "/api/admin",
          "/api/admin/",
          "/api/auth",
          "/api/auth/",
          "/api/news/",
          "/api/market/",
          "/api/daily-briefs",
          "/api/weekly-briefs",
          "/settings",
          "/settings/",
          "/app-preview",
        ],
      },
    ],
    sitemap: `${ixaiSiteUrl}/sitemap.xml`,
    host: ixaiSiteUrl,
  };
}
