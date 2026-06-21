import Link from "next/link";
import {
  ArrowRight,
  Bitcoin,
  BriefcaseBusiness,
  CandlestickChart,
  Layers3,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { RecentInputsPanel } from "@/components/portfolio/recent-inputs-panel";
import { PortfolioTruthSummary } from "@/components/portfolio/portfolio-truth-summary";
import { WorkspaceMarketStatus } from "@/components/market/workspace-market-status";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/portfolio",
  description:
    "IXAI Portfolio Center 是 Workspace 內管理股票、Crypto、FCN 與未來多券商資產的首頁。",
  title: "Portfolio Center | 我的 IXAI",
});

const holdingCards = [
  {
    cta: "新增股票",
    description: "建立股票或 ETF 部位，作為 Portfolio 與 Risk 的基礎。",
    href: "/my-ixai/input/stock",
    icon: CandlestickChart,
    title: "股票",
  },
  {
    cta: "新增 Crypto",
    description: "管理 BTC、ETH 與未來 Grid / Dual 等數位資產入口。",
    href: "/my-ixai/input/crypto",
    icon: Bitcoin,
    title: "Crypto",
  },
  {
    cta: "新增 FCN",
    description: "使用 FCN Wizard 建立 FCN、Worst-of、KI / KO 與 coupon tracking 資料。",
    href: "/my-ixai/input/fcn",
    icon: ShieldCheck,
    title: "FCN",
  },
];

const riskSnapshotCards = [
  {
    copy: "未來會整理單一標的、類別、地區與券商來源是否過度集中。",
    icon: Layers3,
    title: "集中度",
  },
  {
    copy: "未來會把 Portfolio 風險、情境分析與壓力測試移到 Risk Center。",
    icon: ShieldAlert,
    title: "風險監控",
  },
  {
    copy: "FCN 建立後，Worst-of、KI / KO 與觀察節奏會由 FCN Center 承接。",
    icon: ShieldCheck,
    title: "FCN Worst-of",
  },
  {
    copy: "Portfolio Exposure 會協助理解資產類別、標的、區域與 provider 曝險。",
    icon: BriefcaseBusiness,
    title: "Portfolio Exposure",
  },
];

const quickActions = [
  { href: "/my-ixai/input/stock", label: "新增股票" },
  { href: "/my-ixai/input/crypto", label: "新增 Crypto" },
  { href: "/my-ixai/input/fcn", label: "新增 FCN" },
];

export default function MyIxaiPortfolioPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                Portfolio Workspace
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                Portfolio Center
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                管理股票、Crypto、FCN 與未來多券商資產。先建立資產資料，IXAI 才能逐步整理 Portfolio、Risk 與 Intelligence workflow。
              </p>
            </div>

            <Link
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5 sm:w-fit"
              href="/my-ixai/input"
            >
              開始新增資產
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <PortfolioTruthSummary />

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                Holdings Summary
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                建立與整理資產
              </h2>
            </div>
            <Link
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] sm:w-fit"
              href="/my-ixai/input"
            >
              前往 Asset Input
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {holdingCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  className="flex min-h-56 flex-col justify-between rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                  key={card.title}
                >
                  <div>
                    <FeatureIcon icon={Icon} size="sm" shadow={false} />
                    <h3 className="mt-3 text-lg font-semibold text-[var(--ixai-forest)]">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                      {card.description}
                    </p>
                  </div>
                  <Link
                    className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[rgba(9,41,31,0.18)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]"
                    href={card.href}
                  >
                    {card.cta}
                    <PlusCircle className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Risk Snapshot
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            風險快照
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            本區先用 placeholder 說明 Portfolio 未來會如何進入 Risk Center 與 FCN Center；本版不接真實風控引擎。
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {riskSnapshotCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                  key={card.title}
                >
                  <FeatureIcon icon={Icon} size="sm" shadow={false} />
                  <h3 className="mt-3 text-base font-semibold text-[var(--ixai-forest)]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                    {card.copy}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <RecentInputsPanel />

        <WorkspaceMarketStatus contextLabel="Portfolio Center" />

        <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.14)] sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Quick Actions
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            下一步：先新增一筆資產
          </h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5"
                href={action.href}
                key={action.href}
              >
                {action.label}
                <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          本頁僅用於資產整理、風險監控與資訊閱讀，不構成投資建議、買賣建議、目標價、報酬承諾或自動交易。
        </p>
      </section>
    </main>
  );
}
