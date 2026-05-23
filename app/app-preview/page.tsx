import Link from "next/link";
import { ArrowLeft, Smartphone } from "lucide-react";
import type { Metadata } from "next";
import { MarketIntelligenceLayer } from "@/components/market/market-intelligence-layer";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { MarketPulse } from "@/components/dashboard/market-pulse";
import { TodaysBrief } from "@/components/dashboard/todays-brief";
import { WatchlistTeaser } from "@/components/watchlist/watchlist-teaser";
import { ixaiDefaultDescription } from "@/src/lib/brand/metadata";
import { getLatestPublishedBriefAsync } from "@/src/lib/editorial/repository";

// v1.29.5 — Store Screenshot Preparation Layer.
//
// /app-preview is an INTERNAL surface used to capture App Store /
// Google Play screenshots and PWA beta marketing visuals. It is not
// linked from the public navigation and carries robots: noindex so it
// never appears in search.
//
// The page reuses real Public App components (Daily Brief, Market
// Intelligence, Market Pulse, Watchlist, FCN education) so the
// screenshots show the same intelligence that production renders. No
// inflated/fake numbers.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IXAI App Preview · Internal",
  description: ixaiDefaultDescription,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

const previewSections: Array<{
  label: string;
  title: string;
  copy: string;
  href: string;
}> = [
  {
    label: "Daily Brief",
    title: "今日市場觀察",
    copy: "AI-assisted 風險摘要與一玄觀點。",
    href: "/daily-brief",
  },
  {
    label: "Market Intelligence",
    title: "市場情報整合",
    copy: "宏觀資產、AI 供應鏈與新聞情報層。",
    href: "/market",
  },
  {
    label: "Watchlist",
    title: "個人自選觀察",
    copy: "預設八檔 + 自訂股票 / ETF / Crypto。",
    href: "/watchlist",
  },
  {
    label: "FCN Education",
    title: "FCN Education Hub",
    copy: "Coupon、worst-of、KI / KO 與波動率教育。",
    href: "/fcn",
  },
  {
    label: "IXAI Pro Preview",
    title: "未來個人化監控",
    copy: "FCN Risk Monitoring、AI Portfolio Intelligence。",
    href: "/pro",
  },
];

export default async function AppPreviewPage() {
  const latestDailyBrief = await getLatestPublishedBriefAsync();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-2xl border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.16)] sm:p-7">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-[rgba(176,141,87,0.18)] text-[var(--ixai-gold)]">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
            Internal · Screenshot Preview
          </p>
        </div>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-9 sm:text-4xl sm:leading-snug">
          IXAI App Preview
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
          這是 App Store / Google Play 截圖與 PWA Public Beta 行銷視覺的乾淨展示頁。
          所有區塊都使用 Production 組件，沒有額外的 fake data。此頁面 noindex，
          不出現在搜尋結果，也未加入公開導覽。
        </p>
        <p className="mt-3 text-xs leading-6 text-white/56">
          建議在 iPhone 12 / 13 / 14 viewport 截圖。Status bar 設為深綠。
        </p>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {previewSections.map((section) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-3.5"
            key={section.label}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              {section.label}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
              {section.title}
            </p>
            <p className="mt-1.5 text-xs leading-5 text-[var(--ixai-ink-muted)]">
              {section.copy}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Daily Brief
        </p>
        <h2 className="mt-2 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
          今日市場觀察
        </h2>
        <div className="mt-4">
          <TodaysBrief brief={latestDailyBrief} />
        </div>
      </section>

      <MarketPulse />

      <WatchlistTeaser />

      <section>
        <MarketOverview />
      </section>

      <MarketIntelligenceLayer />

      <Link
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
        href="/"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        返回 IXAI 首頁
      </Link>
    </div>
  );
}
