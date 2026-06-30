import Link from "next/link";
import {
  ArrowRight,
  Bitcoin,
  BriefcaseBusiness,
  CandlestickChart,
  Eye,
  HeartPulse,
  Home,
  Newspaper,
  Rocket,
  Settings,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { LiveMarketDataStatus } from "@/components/market/live-market-data-status";
import { I18nFoundationStatusCard } from "@/components/i18n/i18n-foundation-status-card";
import { LocalizationPreview } from "@/components/i18n/localization-preview";
import { TranslatedText } from "@/components/i18n/translated-text";
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
    descriptionKey: "portfolioCardDescription",
    href: "/my-ixai/portfolio",
    icon: BriefcaseBusiness,
    labelKey: "portfolio",
  },
  {
    descriptionKey: "riskCardDescription",
    href: "/my-ixai/risk",
    icon: ShieldAlert,
    labelKey: "risk",
  },
  {
    descriptionKey: "fcnCardDescription",
    href: "/my-ixai/fcn",
    icon: ShieldCheck,
    labelKey: "fcn",
  },
  {
    descriptionKey: "intelligenceCardDescription",
    href: "/my-ixai/intelligence",
    icon: Newspaper,
    labelKey: "intelligence",
  },
  {
    descriptionKey: "healthCardDescription",
    href: "/my-ixai/health",
    icon: HeartPulse,
    labelKey: "health",
  },
  {
    descriptionKey: "betaCardDescription",
    href: "/my-ixai/beta",
    icon: Rocket,
    labelKey: "beta",
  },
  {
    descriptionKey: "watchlistCardDescription",
    href: "/my-ixai/watchlist",
    icon: Eye,
    labelKey: "watchlist",
  },
  {
    descriptionKey: "settingsCardDescription",
    href: "/my-ixai/settings",
    icon: Settings,
    labelKey: "settings",
  },
];

const assetShortcutCards = [
  {
    descriptionKey: "assetShortcutStockDescription",
    href: "/my-ixai/input/stock",
    icon: CandlestickChart,
    labelKey: "assetShortcutStockLabel",
  },
  {
    descriptionKey: "assetShortcutCryptoDescription",
    href: "/my-ixai/input/crypto",
    icon: Bitcoin,
    labelKey: "assetShortcutCryptoLabel",
  },
  {
    descriptionKey: "assetShortcutFcnDescription",
    href: "/my-ixai/input/fcn",
    icon: ShieldCheck,
    labelKey: "assetShortcutFcnLabel",
  },
];

export default function MyIxaiHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          <TranslatedText k="heroEyebrow" namespace="workspace" />
        </p>
        <h1 className="mt-2 max-w-3xl font-serif text-2xl font-semibold leading-8 sm:mt-3 sm:text-5xl sm:leading-snug">
          <TranslatedText k="heroTitle" namespace="workspace" />
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:mt-4 sm:leading-7">
          <TranslatedText k="heroBody" namespace="workspace" />
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
            href="/my-ixai/portfolio"
          >
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            <TranslatedText k="heroCtaPrimary" namespace="workspace" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.055] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
            href="/my-ixai/fcn"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <TranslatedText k="heroCtaFcn" namespace="workspace" />
          </Link>
        </div>
      </section>

      <LiveMarketDataStatus autoLoad={false} compact />

      <I18nFoundationStatusCard />

      <LocalizationPreview />

      <WorkspaceMorningBriefV14Card autoLoad={false} compact />

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              <TranslatedText k="liveIntelligenceEyebrow" namespace="workspace" />
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              <TranslatedText k="snapshotTitle" namespace="workspace" />
            </h2>
          </div>
          <span className="inline-flex w-fit rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2 text-xs font-semibold text-[var(--ixai-forest-soft)]">
            <TranslatedText k="liveIntelligenceStatus" namespace="workspace" />
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            {
              href: "/my-ixai/intelligence",
              labelKey: "liveIntelligenceWorkspaceTitle",
              noteKey: "liveIntelligenceWorkspaceNote",
            },
            {
              href: "/my-ixai/portfolio",
              labelKey: "liveIntelligencePortfolioTitle",
              noteKey: "liveIntelligencePortfolioNote",
            },
            {
              href: "/my-ixai/fcn",
              labelKey: "liveIntelligenceFcnTitle",
              noteKey: "liveIntelligenceFcnNote",
            },
            {
              href: "/my-ixai/timeline",
              labelKey: "liveIntelligenceTimelineTitle",
              noteKey: "liveIntelligenceTimelineNote",
            },
          ].map((item) => (
            <Link
              className="group flex min-h-40 flex-col justify-between rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-[var(--ixai-forest)] transition hover:-translate-y-0.5 hover:bg-white/80"
              href={item.href}
              key={item.href}
            >
              <span>
                <span className="text-sm font-semibold">
                  <TranslatedText k={item.labelKey} namespace="workspace" />
                </span>
                <span className="mt-3 block text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  <TranslatedText k={item.noteKey} namespace="workspace" />
                </span>
              </span>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ixai-forest)]">
                <TranslatedText k="open" namespace="workspace" />
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
              <TranslatedText k="centersEyebrow" namespace="workspace" />
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              <TranslatedText k="centersTitle" namespace="workspace" />
            </h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2 text-xs font-semibold text-[var(--ixai-forest-soft)]">
            <Home className="h-3.5 w-3.5 text-[var(--ixai-gold)]" aria-hidden="true" />
            <TranslatedText k="safeShell" namespace="workspace" />
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
                    <TranslatedText k={card.labelKey} namespace="navigation" />
                  </span>
                  <ArrowRight
                    className="h-4 w-4 text-[var(--ixai-gold)] transition group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  <TranslatedText k={card.descriptionKey} namespace="workspace" />
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
              <TranslatedText k="assetOnboardingEyebrow" namespace="workspace" />
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              <TranslatedText k="assetInputTitle" namespace="workspace" />
            </h2>
          </div>
          <Link
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
            href="/my-ixai/input"
          >
            <TranslatedText k="assetInputCta" namespace="workspace" />
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
                  <TranslatedText k={card.labelKey} namespace="workspace" />
                </span>
                <span className="mt-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  <TranslatedText k={card.descriptionKey} namespace="workspace" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        <TranslatedText k="footerRuntimeSafe" namespace="workspace" />
      </p>
    </div>
  );
}
