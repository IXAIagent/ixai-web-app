import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
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
  title: {
    default: "IXAI — AI Financial Intelligence & Risk Monitoring Platform",
    template: "%s | IXAI",
  },
  description:
    "IXAI 是免費市場 intelligence 與 AI 風險觀察平台，提供 Daily Brief、Market Pulse、FCN 教育與 IXAI Pro 入口。",
  openGraph: {
    description:
      "每日市場情報、AI 風險觀察與 IXAI Pro AI Wealth Operating System 入口。",
    locale: "zh_TW",
    siteName: "IXAI",
    title: "IXAI — AI Financial Intelligence & Risk Monitoring Platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    description:
      "免費市場 intelligence 與 AI 風險觀察平台，清楚連向 IXAI Pro。",
    title: "IXAI — AI Financial Intelligence & Risk Monitoring Platform",
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
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
