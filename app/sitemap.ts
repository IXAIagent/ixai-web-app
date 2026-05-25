import type { MetadataRoute } from "next";
import { getAllDailyBriefs } from "@/src/lib/dailyBriefs";
import { getAllWeeklyBriefs } from "@/src/lib/weeklyBriefs";
import { ixaiSiteUrl } from "@/src/lib/brand/metadata";

// v1.33 — IXAI sitemap.xml. Public intelligence routes only; admin /
// account / API / settings are intentionally omitted (they are also
// disallowed via robots.txt).

const STATIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/daily-brief", changeFrequency: "daily", priority: 0.9 },
  { path: "/weekly-brief", changeFrequency: "weekly", priority: 0.9 },
  { path: "/market", changeFrequency: "daily", priority: 0.8 },
  { path: "/fcn", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/pro", changeFrequency: "monthly", priority: 0.5 },
  { path: "/ixai", changeFrequency: "monthly", priority: 0.5 },
  { path: "/feedback", changeFrequency: "monthly", priority: 0.3 },
];

function buildUrl(path: string): string {
  return `${ixaiSiteUrl}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: buildUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const dailyEntries: MetadataRoute.Sitemap = getAllDailyBriefs().map((brief) => ({
    url: buildUrl(`/daily-brief/${brief.slug}`),
    lastModified: brief.publishedAt ?? now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const weeklyEntries: MetadataRoute.Sitemap = getAllWeeklyBriefs().map((brief) => ({
    url: buildUrl(`/weekly-brief/${brief.slug}`),
    lastModified: brief.publishedAt ?? now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...dailyEntries, ...weeklyEntries];
}
