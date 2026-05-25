import { brandContact } from "@/src/lib/brand/contact";
import { ixaiSiteUrl } from "@/src/lib/brand/metadata";

// v1.33 — Structured data (JSON-LD) emitters. Server-rendered <script>
// tags so search engines / social platforms see Organization / WebSite /
// NewsArticle / BreadcrumbList without any client work. articleBody is
// intentionally short to avoid republishing full editorial content.

type StructuredDataProps = { data: Record<string, unknown> };

function StructuredDataScript({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function publisherNode() {
  const sameAs: string[] = [];
  if (brandContact.instagramUrl) sameAs.push(brandContact.instagramUrl);
  if (brandContact.facebookUrl) sameAs.push(brandContact.facebookUrl);
  if (brandContact.lineUrl) sameAs.push(brandContact.lineUrl);

  return {
    "@type": "Organization",
    name: "IXAI",
    legalName: "I-Xuan Investment Co., Ltd.",
    alternateName: ["一玄投資", "I-Xuan"],
    url: ixaiSiteUrl,
    logo: `${ixaiSiteUrl}/icons/ixai-icon-512.png`,
    sameAs,
  };
}

export function OrganizationStructuredData() {
  return (
    <StructuredDataScript
      data={{
        "@context": "https://schema.org",
        ...publisherNode(),
      }}
    />
  );
}

export function WebSiteStructuredData() {
  return (
    <StructuredDataScript
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "IXAI",
        url: ixaiSiteUrl,
        publisher: publisherNode(),
      }}
    />
  );
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return (
    <StructuredDataScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url.startsWith("http") ? item.url : `${ixaiSiteUrl}${item.url}`,
        })),
      }}
    />
  );
}

export function NewsArticleStructuredData({
  headline,
  description,
  url,
  imageUrl,
  publishedAt,
  modifiedAt,
  section,
  keywords,
}: {
  headline: string;
  description?: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  modifiedAt?: string;
  section?: string;
  keywords?: string[];
}) {
  return (
    <StructuredDataScript
      data={{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline,
        description,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url.startsWith("http") ? url : `${ixaiSiteUrl}${url}`,
        },
        image: imageUrl
          ? [imageUrl.startsWith("http") ? imageUrl : `${ixaiSiteUrl}${imageUrl}`]
          : undefined,
        datePublished: publishedAt,
        dateModified: modifiedAt ?? publishedAt,
        articleSection: section,
        keywords: keywords?.join(", "),
        author: {
          "@type": "Organization",
          name: "IXAI Editorial",
        },
        publisher: publisherNode(),
      }}
    />
  );
}
