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

export function buildPublicMetadata({
  description,
  title,
}: {
  description: string;
  title: string;
}): Metadata {
  return {
    description,
    openGraph: {
      description,
      images: [ixaiOgImage],
      locale: "zh_TW",
      siteName: "IXAI",
      title,
      type: "website",
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [ixaiOgImage.url],
      title,
    },
  };
}
