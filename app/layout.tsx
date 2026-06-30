import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthEntryGate } from "@/components/auth/auth-entry-gate";
import { AuthProvider } from "@/components/auth/auth-provider";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { AppShell } from "@/components/layout/app-shell";
import { DistributionProvider } from "@/components/distribution/distribution-provider";
import { IdentityProvider } from "@/components/auth/identity-provider";
import {
  OrganizationStructuredData,
  WebSiteStructuredData,
} from "@/components/seo/structured-data";
import {
  ixaiDefaultDescription,
  ixaiDefaultTitle,
  ixaiMetadataBase,
  ixaiOgImage,
} from "@/src/lib/brand/metadata";
import { LocaleProvider, LocalizationProvider } from "@/src/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// v1.29 — viewport export so the IXAI deep-forest theme is reflected in
// iOS Safari + Android Chrome chrome bars and PWA standalone status bar.
export const viewport: Viewport = {
  themeColor: "#09291f",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: ixaiMetadataBase,
  title: {
    default: ixaiDefaultTitle,
    template: "%s | IXAI",
  },
  description: ixaiDefaultDescription,
  alternates: {
    canonical: "/",
  },
  applicationName: "IXAI",
  // v1.29 — Apple PWA meta so a standalone install matches the IXAI brand
  // (status bar tone, app title, web-app capability) instead of falling
  // back to generic Safari chrome.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IXAI",
  },
  icons: {
    icon: [
      { rel: "icon", url: "/favicon.ico" },
      { rel: "icon", sizes: "512x512", type: "image/png", url: "/icon.png" },
    ],
    apple: [{ rel: "apple-touch-icon", sizes: "180x180", url: "/apple-icon.png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    description: ixaiDefaultDescription,
    images: [ixaiOgImage],
    locale: "zh_TW",
    siteName: "IXAI",
    title: ixaiDefaultTitle,
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    description: ixaiDefaultDescription,
    images: [ixaiOgImage.url],
    title: ixaiDefaultTitle,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* v1.33 — site-wide structured data. Organization + WebSite JSON-LD
            so search engines associate every IXAI page with the brand and
            publisher entity without per-page boilerplate. */}
        <OrganizationStructuredData />
        <WebSiteStructuredData />
        {/* v1.34 — Distribution attribution. Captures UTM params once
            per session into sessionStorage before any distribution
            CTA reads them. No third-party tracking. */}
        <DistributionProvider />
        <PageViewTracker />
        <LocaleProvider>
          <LocalizationProvider>
            <AuthProvider>
              <IdentityProvider>
                <AuthEntryGate>
                  <AppShell>{children}</AppShell>
                </AuthEntryGate>
              </IdentityProvider>
            </AuthProvider>
          </LocalizationProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
