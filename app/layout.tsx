import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthEntryGate } from "@/components/auth/auth-entry-gate";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import {
  ixaiDefaultDescription,
  ixaiDefaultTitle,
  ixaiMetadataBase,
  ixaiOgImage,
} from "@/src/lib/brand/metadata";
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
        <AuthProvider>
          <AuthEntryGate>
            <AppShell>{children}</AppShell>
          </AuthEntryGate>
        </AuthProvider>
      </body>
    </html>
  );
}
