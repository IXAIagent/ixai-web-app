import Link from "next/link";
import {
  ArrowRight,
  Bitcoin,
  BriefcaseBusiness,
  CandlestickChart,
  Eye,
  Home,
  Newspaper,
  Settings,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { LiveMarketDataStatus } from "@/components/market/live-market-data-status";
import { WorkspaceMorningBriefV14Card } from "@/components/workspace/workspace-morning-brief-v14-card";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/home",
  description:
    "IXAI Workspace Home 是登入後主入口，整理 Portfolio、Risk、FCN、Intelligence 與 Settings。",
  title: "Home | 我的 IXAI",
});

const workspaceCards = [
  {
    description: "查看 Portfolio、資產輸入、估值與資料狀態。",
    href: "/my-ixai/portfolio",
    icon: BriefcaseBusiness,
    label: "Portfolio Center",
  },
  {
    description: "查看集中度、曝險、風險摘要與資料品質。",
    href: "/my-ixai/risk",
    icon: ShieldAlert,
    label: "Risk Center",
  },
  {
    description: "管理 FCN 部位、underlyings、KI / KO 與 schedule。",
    href: "/my-ixai/fcn",
    icon: ShieldCheck,
    label: "FCN Center",
  },
  {
    description: "整理 workspace intelligence、brief 與 readback 入口。",
    href: "/my-ixai/intelligence",
    icon: Newspaper,
    label: "Intelligence Center",
  },
  {
    description: "查看 watchlist 與市場資料狀態。",
    href: "/my-ixai/watchlist",
    icon: Eye,
    label: "Watchlist",
  },
  {
    description: "查看設定、診斷與 platform readiness。",
    href: "/my-ixai/settings",
    icon: Settings,
    label: "Settings",
  },
];

const assetShortcutCards = [
  {
    description: "新增股票 / ETF 資料。",
    href: "/my-ixai/input/stock",
    icon: CandlestickChart,
    label: "新增股票",
  },
  {
    description: "新增 Crypto 資產資料。",
    href: "/my-ixai/input/crypto",
    icon: Bitcoin,
    label: "新增 Crypto",
  },
  {
    description: "使用 FCN Wizard 建立 FCN 部位。",
    href: "/my-ixai/input/fcn",
    icon: ShieldCheck,
    label: "新增 FCN",
  },
];

export default function MyIxaiHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          IXAI Workspace
        </p>
        <h1 className="mt-2 max-w-3xl font-serif text-2xl font-semibold leading-8 sm:mt-3 sm:text-5xl sm:leading-snug">
          歡迎回到 IXAI Workspace。
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:mt-4 sm:leading-7">
          V14 Sprint 2 將 Live Market、Portfolio Valuation、FCN Live Risk 串成 Workspace Intelligence 與 Morning Brief。Home 仍維持 runtime-safe：重型 readback 採手動刷新。
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
            href="/my-ixai/portfolio"
          >
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            進入 Portfolio Center
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.055] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
            href="/my-ixai/fcn"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            進入 FCN Center
          </Link>
        </div>
      </section>

      <LiveMarketDataStatus autoLoad={false} compact />

      <WorkspaceMorningBriefV14Card autoLoad={false} compact />

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V14 Sprint 2
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              Live Intelligence snapshot
            </h2>
          </div>
          <span className="inline-flex w-fit rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2 text-xs font-semibold text-[var(--ixai-forest-soft)]">
            On-demand refresh only
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              href: "/my-ixai/intelligence",
              label: "Workspace intelligence",
              note: "Intelligence Center now aggregates portfolio, risk, FCN, watchlist, alerts, timeline, and data quality into rule-based explain-only cards.",
            },
            {
              href: "/my-ixai/portfolio",
              label: "Live valuation",
              note: "Portfolio Center now estimates Stock and Crypto value from live quotes when available; FCN remains notional placeholder.",
            },
            {
              href: "/my-ixai/fcn",
              label: "FCN live risk",
              note: "FCN Center reads live underlying quotes where available for worst-of, KI, KO, strike distance, and schedule awareness.",
            },
            {
              href: "/my-ixai/timeline",
              label: "Timeline context",
              note: "Timeline groups FCN coupon, observation, maturity, alert, and data-quality events without inventing dates or activating a scheduler.",
            },
          ].map((item) => (
            <Link
              className="group flex min-h-40 flex-col justify-between rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-[var(--ixai-forest)] transition hover:-translate-y-0.5 hover:bg-white/80"
              href={item.href}
              key={item.href}
            >
              <span>
                <span className="text-sm font-semibold">{item.label}</span>
                <span className="mt-3 block text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {item.note}
                </span>
              </span>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ixai-forest)]">
                Open
                <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)] transition group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Workspace Centers
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              主要工作中心
            </h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2 text-xs font-semibold text-[var(--ixai-forest-soft)]">
            <Home className="h-3.5 w-3.5 text-[var(--ixai-gold)]" aria-hidden="true" />
            Static safe shell
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {workspaceCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                className="group flex min-h-36 flex-col justify-between rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-[var(--ixai-forest)] transition hover:-translate-y-0.5 hover:bg-white/80"
                href={card.href}
                key={card.href}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                    {card.label}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 text-[var(--ixai-gold)] transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {card.description}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Asset Onboarding
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              快速新增資產
            </h2>
          </div>
          <Link
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
            href="/my-ixai/input"
          >
            Asset Input Center
            <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {assetShortcutCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                className="group flex min-h-32 flex-col justify-between rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-[var(--ixai-forest)] transition hover:-translate-y-0.5 hover:bg-white/80"
                href={card.href}
                key={card.href}
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                  {card.label}
                </span>
                <span className="mt-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {card.description}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        Home shell 保持 runtime-safe：沒有自動 diagnostics loader、投資建議、交易指令或自動交易。Morning Brief 與 live quote 狀態可手動刷新，且所有外部來源都必須 fallback。
      </p>
    </div>
  );
}
