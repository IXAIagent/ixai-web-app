const PRODUCTION_SITE_URL = "https://app.ixuan.ai";

export function getAuthRedirectUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_SITE_URL;
  const withoutAuthQuery = siteUrl.split("?")[0]?.split("#")[0] || PRODUCTION_SITE_URL;
  const normalized =
    withoutAuthQuery.includes("localhost") || withoutAuthQuery.includes("127.0.0.1")
      ? PRODUCTION_SITE_URL
      : withoutAuthQuery.replace(/\/$/, "");
  const redirectUrl = `${normalized}/auth/callback`;

  if (process.env.NODE_ENV === "development") {
    console.log("[IXAI AUTH REDIRECT]", redirectUrl);
  }

  return redirectUrl;
}
