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
import { PortfolioPersistenceSummary } from "@/components/portfolio/portfolio-persistence-summary";
import { PortfolioTruthSummary } from "@/components/portfolio/portfolio-truth-summary";
import { PortfolioValuationSummary } from "@/components/portfolio/portfolio-valuation-summary";
import { LivePortfolioValuationCard } from "@/components/portfolio/live-portfolio-valuation-card";
import { WorkspaceMarketStatus } from "@/components/market/workspace-market-status";
import { TranslatedText } from "@/components/i18n/translated-text";
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
    ctaKey: "addStock",
    descriptionKey: "stockDescription",
    href: "/my-ixai/input/stock",
    icon: CandlestickChart,
    titleKey: "stock",
  },
  {
    ctaKey: "addCrypto",
    descriptionKey: "cryptoDescription",
    href: "/my-ixai/input/crypto",
    icon: Bitcoin,
    titleKey: "crypto",
  },
  {
    ctaKey: "addFcn",
    descriptionKey: "fcnDescription",
    href: "/my-ixai/input/fcn",
    icon: ShieldCheck,
    titleKey: "fcn",
  },
];

const riskSnapshotCards = [
  {
    copyKey: "riskConcentrationCopy",
    icon: Layers3,
    titleKey: "riskConcentrationTitle",
  },
  {
    copyKey: "riskMonitoringCopy",
    icon: ShieldAlert,
    titleKey: "riskMonitoringTitle",
  },
  {
    copyKey: "riskFcnCopy",
    icon: ShieldCheck,
    titleKey: "riskFcnTitle",
  },
  {
    copyKey: "exposureCopy",
    icon: BriefcaseBusiness,
    titleKey: "exposureTitle",
  },
];

const quickActions = [
  { href: "/my-ixai/input/stock", labelKey: "addStock" },
  { href: "/my-ixai/input/crypto", labelKey: "addCrypto" },
  { href: "/my-ixai/input/fcn", labelKey: "addFcn" },
];

export default function MyIxaiPortfolioPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                <TranslatedText k="heroEyebrow" namespace="portfolio" />
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                <TranslatedText k="heroTitle" namespace="portfolio" />
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                <TranslatedText k="heroBody" namespace="portfolio" />
              </p>
            </div>

            <Link
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5 sm:w-fit"
              href="/my-ixai/input"
            >
              <TranslatedText k="addAssetCta" namespace="portfolio" />
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <PortfolioTruthSummary />

        <PortfolioPersistenceSummary />

        <PortfolioValuationSummary />

        <LivePortfolioValuationCard />

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                <TranslatedText k="holdingsEyebrow" namespace="portfolio" />
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                <TranslatedText k="holdingsTitle" namespace="portfolio" />
              </h2>
            </div>
            <Link
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] sm:w-fit"
              href="/my-ixai/input"
            >
              <TranslatedText k="assetInputLink" namespace="portfolio" />
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {holdingCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  className="flex min-h-56 flex-col justify-between rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                  key={card.titleKey}
                >
                  <div>
                    <FeatureIcon icon={Icon} size="sm" shadow={false} />
                    <h3 className="mt-3 text-lg font-semibold text-[var(--ixai-forest)]">
                      <TranslatedText k={card.titleKey} namespace="assetTypes" />
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                      <TranslatedText k={card.descriptionKey} namespace="portfolio" />
                    </p>
                  </div>
                  <Link
                    className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[rgba(9,41,31,0.18)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]"
                    href={card.href}
                  >
                    <TranslatedText k={card.ctaKey} namespace="portfolio" />
                    <PlusCircle className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            <TranslatedText k="riskSnapshotEyebrow" namespace="portfolio" />
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            <TranslatedText k="riskSnapshotTitle" namespace="portfolio" />
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            <TranslatedText k="riskSnapshotBody" namespace="portfolio" />
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {riskSnapshotCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                  key={card.titleKey}
                >
                  <FeatureIcon icon={Icon} size="sm" shadow={false} />
                  <h3 className="mt-3 text-base font-semibold text-[var(--ixai-forest)]">
                    <TranslatedText k={card.titleKey} namespace="portfolio" />
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                    <TranslatedText k={card.copyKey} namespace="portfolio" />
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
            <TranslatedText k="quickActionsEyebrow" namespace="portfolio" />
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            <TranslatedText k="quickActionsTitle" namespace="portfolio" />
          </h2>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5"
                href={action.href}
                key={action.href}
              >
                <TranslatedText k={action.labelKey} namespace="portfolio" />
                <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          <TranslatedText k="disclaimer" namespace="portfolio" />
        </p>
      </section>
    </main>
  );
}
