import type { Metadata } from "next";

const fallbackSiteUrl = "https://app.ixuan.ai";

function normalizeSiteUrl(value?: string) {
  if (!value) {
    return fallbackSiteUrl;
  }

  try {
    return new URL(value).origin;
  } catch {
    return fallbackSiteUrl;
  }
}

export const ixaiSiteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
export const ixaiMetadataBase = new URL(ixaiSiteUrl);

export const ixaiDefaultTitle =
  "IXAI — AI Financial Intelligence & Risk Monitoring Platform";
export const ixaiDefaultDescription =
  "IXAI 是免費市場 intelligence 與 AI 風險觀察平台，提供 Daily Brief、Market Pulse、FCN 教育與 IXAI Pro 入口。";

export const ixaiOgImage = {
  alt: "IXAI — AI Financial Intelligence by I-Xuan",
  height: 630,
  url: "/og/ixai-og.png",
  width: 1200,
};

// v1.33 — extend so per-page generators can pass keywords / canonical /
// a dynamic OG image (e.g. /api/og/weekly?slug=...) and editorial article
// metadata (publishedTime, modifiedTime, tags). All new fields optional
// so existing call sites compile unchanged.
export type BuildPublicMetadataOptions = {
  description: string;
  title: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: { url: string; alt: string; width?: number; height?: number };
  ogType?: "website" | "article";
  articleMeta?: {
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
};

export function buildPublicMetadata({
  description,
  title,
  keywords,
  canonical,
  ogImage,
  ogType = "website",
  articleMeta,
}: BuildPublicMetadataOptions): Metadata {
  const resolvedOgImage = ogImage
    ? {
        alt: ogImage.alt,
        height: ogImage.height ?? 630,
        url: ogImage.url,
        width: ogImage.width ?? 1200,
      }
    : ixaiOgImage;

  const openGraph: NonNullable<Metadata["openGraph"]> = {
    description,
    images: [resolvedOgImage],
    locale: "zh_TW",
    siteName: "IXAI",
    title,
    type: ogType,
    ...(articleMeta && ogType === "article"
      ? {
          publishedTime: articleMeta.publishedTime,
          modifiedTime: articleMeta.modifiedTime,
          section: articleMeta.section,
          tags: articleMeta.tags,
        }
      : {}),
  };

  return {
    description,
    keywords,
    alternates: canonical ? { canonical } : undefined,
    openGraph,
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [resolvedOgImage.url],
      title,
    },
  };
}
