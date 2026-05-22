import type { Metadata } from "next";
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
