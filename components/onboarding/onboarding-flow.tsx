"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LineChart,
  MessageCircle,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { ConnectLineCard } from "@/components/line/connect-line-card";
import { useIdentitySession } from "@/components/auth/identity-provider";
import { trackEvent } from "@/src/lib/analytics/analytics";
import {
  INTELLIGENCE_INTERESTS,
  INVESTMENT_STYLES,
  ONBOARDING_MARKETS,
  ONBOARDING_PROFILE_STORAGE_KEY,
  RISK_PREFERENCES,
  WATCHLIST_ASSET_TYPES,
  createInitialOnboardingProfile,
  normalizeWatchlistSymbol,
  parseOnboardingProfile,
  summarizeOnboardingProfile,
  type IntelligenceInterest,
  type InvestmentStyle,
  type OnboardingOption,
  type OnboardingProfile,
  type OnboardingWatchlistItem,
  type OnboardingMarket,
  type RiskPreference,
  type WatchlistAssetType,
} from "@/src/lib/onboarding/profile";

const STEPS = [
  "投資市場",
  "投資風格",
  "風險偏好",
  "情報偏好",
  "觀察名單",
  "LINE Intelligence",
] as const;

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function SelectionGrid<T extends string>({
  multiple = true,
  onSelect,
  options,
  selected,
}: {
  multiple?: boolean;
  onSelect: (id: T) => void;
  options: Array<OnboardingOption<T>>;
  selected: T[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const active = selected.includes(option.id);

        return (
          <button
            className={`min-h-24 rounded-lg border p-3 text-left transition ${
              active
                ? "border-[rgba(176,141,87,0.62)] bg-[rgba(176,141,87,0.14)] text-[var(--ixai-forest)]"
                : "border-[var(--ixai-border)] bg-white/45 text-[var(--ixai-forest-soft)] hover:border-[rgba(176,141,87,0.42)] hover:bg-white/70"
            }`}
            key={option.id}
            onClick={() => onSelect(option.id)}
            type="button"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold leading-6">{option.label}</span>
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                  active
                    ? "border-[var(--ixai-gold)] bg-[var(--ixai-gold)] text-[var(--ixai-forest)]"
                    : "border-[rgba(9,41,31,0.22)] text-transparent"
                }`}
              >
                <Check className="h-3 w-3 stroke-current" aria-hidden="true" />
              </span>
            </span>
            <span className="mt-2 block text-xs leading-5 text-[var(--ixai-ink-muted)]">
              {option.copy}
            </span>
            {!multiple ? (
              <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                single choice
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-[11px] font-medium text-[var(--ixai-ink-muted)]">
        <span>Step {currentStep + 1}</span>
        <span>{STEPS.length} steps</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {STEPS.map((label, index) => (
          <div
            aria-label={label}
            className={`h-1.5 rounded-full ${
              index <= currentStep ? "bg-[var(--ixai-gold)]" : "bg-[rgba(9,41,31,0.12)]"
            }`}
            key={label}
            title={label}
          />
        ))}
      </div>
    </div>
  );
}

export function OnboardingFlow() {
  const identity = useIdentitySession();
  const [profile, setProfile] = useState<OnboardingProfile>(() => createInitialOnboardingProfile());
  const [mounted, setMounted] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [assetType, setAssetType] = useState<WatchlistAssetType>("stock");
  const currentStep = Math.min(Math.max(profile.currentStep, 0), STEPS.length - 1);
  const summary = useMemo(() => summarizeOnboardingProfile(profile), [profile]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const stored = parseOnboardingProfile(window.localStorage.getItem(ONBOARDING_PROFILE_STORAGE_KEY));
      const startedAt = stored.startedAt ?? new Date().toISOString();
      const nextProfile = { ...stored, startedAt };

      setProfile(nextProfile);
      setMounted(true);
      window.localStorage.setItem(ONBOARDING_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));

      if (!stored.startedAt) {
        trackEvent("onboarding_started", {
          membership: identity.membership?.plan ?? "anonymous",
          path: window.location.pathname,
          source: "onboarding_flow",
        });
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [identity.membership?.plan]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    window.localStorage.setItem(ONBOARDING_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [mounted, profile]);

  function updateProfile(updater: (current: OnboardingProfile) => OnboardingProfile) {
    setProfile((current) => updater(current));
  }

  function setStep(step: number) {
    updateProfile((current) => ({
      ...current,
      currentStep: Math.min(Math.max(step, 0), STEPS.length - 1),
    }));
  }

  function completeStep(nextStep: number) {
    trackEvent("onboarding_step_completed", {
      interest_count: summary.interestCount,
      market_count: summary.marketCount,
      membership: identity.membership?.plan ?? "anonymous",
      path: window.location.pathname,
      step: STEPS[currentStep],
      step_index: currentStep + 1,
      watchlist_count: summary.watchlistCount,
    });
    setStep(nextStep);
  }

  function addWatchlistItem() {
    const normalized = normalizeWatchlistSymbol(symbol);

    if (!normalized) {
      return;
    }

    const nextItem: OnboardingWatchlistItem = {
      addedAt: new Date().toISOString(),
      symbol: normalized,
      type: assetType,
    };

    updateProfile((current) => {
      const exists = current.watchlist.some(
        (item) => item.symbol === normalized && item.type === assetType,
      );

      return exists
        ? current
        : {
            ...current,
            watchlist: [...current.watchlist, nextItem].slice(0, 12),
          };
    });
    setSymbol("");
    trackEvent("onboarding_watchlist_added", {
      item_type: assetType,
      membership: identity.membership?.plan ?? "anonymous",
      path: window.location.pathname,
      source: "onboarding_watchlist",
    });
  }

  function completeOnboarding() {
    const completedAt = new Date().toISOString();
    const completedProfile = {
      ...profile,
      completedAt,
      currentStep,
      lineIntent: true,
    };

    setProfile(completedProfile);
    window.localStorage.setItem(ONBOARDING_PROFILE_STORAGE_KEY, JSON.stringify(completedProfile));
    trackEvent("onboarding_completed", {
      interest_count: completedProfile.interests.length,
      interests: completedProfile.interests.join(","),
      market_count: completedProfile.markets.length,
      markets: completedProfile.markets.join(","),
      membership: identity.membership?.plan ?? "anonymous",
      path: window.location.pathname,
      risk_preference: completedProfile.riskPreference ?? "unset",
      watchlist_count: completedProfile.watchlist.length,
    });
  }

  const stepContent = [
    <SelectionGrid<OnboardingMarket>
      key="markets"
      onSelect={(id) =>
        updateProfile((current) => ({
          ...current,
          markets: toggleValue(current.markets, id),
        }))
      }
      options={ONBOARDING_MARKETS}
      selected={profile.markets}
    />,
    <SelectionGrid<InvestmentStyle>
      key="styles"
      onSelect={(id) =>
        updateProfile((current) => ({
          ...current,
          styles: toggleValue(current.styles, id),
        }))
      }
      options={INVESTMENT_STYLES}
      selected={profile.styles}
    />,
    <SelectionGrid<RiskPreference>
      key="risk"
      multiple={false}
      onSelect={(id) =>
        updateProfile((current) => ({
          ...current,
          riskPreference: id,
        }))
      }
      options={RISK_PREFERENCES}
      selected={profile.riskPreference ? [profile.riskPreference] : []}
    />,
    <SelectionGrid<IntelligenceInterest>
      key="interests"
      onSelect={(id) =>
        updateProfile((current) => ({
          ...current,
          interests: toggleValue(current.interests, id),
        }))
      }
      options={INTELLIGENCE_INTERESTS}
      selected={profile.interests}
    />,
    <div className="grid gap-4" key="watchlist">
      <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3">
        <p className="text-sm font-semibold text-[var(--ixai-forest)]">先建立一份可攜帶的觀察名單。</p>
        <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">
          目前先保存在此裝置。未來可接 portfolio intelligence、AI alerts 與 Pro 風險工作流。
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
        <input
          className="min-h-11 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 text-sm text-[var(--ixai-forest)] outline-none transition placeholder:text-[rgba(9,41,31,0.42)] focus:border-[var(--ixai-gold)]"
          onChange={(event) => setSymbol(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addWatchlistItem();
            }
          }}
          placeholder="例如 NVDA、2330.TW、BTC"
          value={symbol}
        />
        <select
          className="min-h-11 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 text-sm text-[var(--ixai-forest)] outline-none focus:border-[var(--ixai-gold)]"
          onChange={(event) => setAssetType(event.target.value as WatchlistAssetType)}
          value={assetType}
        >
          {WATCHLIST_ASSET_TYPES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
          onClick={addWatchlistItem}
          type="button"
        >
          <Plus className="h-4 w-4 stroke-current text-[var(--ixai-cream)]" aria-hidden="true" />
          <span className="translate-y-px">加入</span>
        </button>
      </div>
      {profile.watchlist.length ? (
        <div className="flex flex-wrap gap-2">
          {profile.watchlist.map((item) => (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.12)] px-3 py-1.5 text-xs font-semibold text-[var(--ixai-forest)]"
              key={`${item.type}-${item.symbol}`}
            >
              {item.symbol}
              <span className="font-normal text-[var(--ixai-ink-muted)]">{item.type}</span>
              <button
                aria-label={`移除 ${item.symbol}`}
                className="text-[var(--ixai-forest-soft)] hover:text-[var(--ixai-forest)]"
                onClick={() =>
                  updateProfile((current) => ({
                    ...current,
                    watchlist: current.watchlist.filter(
                      (candidate) => !(candidate.symbol === item.symbol && candidate.type === item.type),
                    ),
                  }))
                }
                type="button"
              >
                <X className="h-3.5 w-3.5 stroke-current" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>,
    <div className="grid gap-4" key="line">
      <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ixai-forest)]">
          <MessageCircle className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          LINE Intelligence
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--ixai-ink-muted)]">
          此步只連到既有 LINE connect / LINE Login infrastructure。未來通知與情報推送都需要使用者明確 opt-in。
        </p>
      </div>
      <div
        onClick={() => {
          updateProfile((current) => ({ ...current, lineIntent: true }));
          trackEvent("onboarding_line_connect_open", {
            membership: identity.membership?.plan ?? "anonymous",
            path: window.location.pathname,
            source: "onboarding_line_step",
          });
        }}
      >
        <ConnectLineCard source="onboarding_line_step" />
      </div>
    </div>,
  ];

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-4 px-3 py-3 sm:px-6 sm:py-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:py-8">
      <aside className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Intelligence Activation
        </p>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:text-4xl">
          建立你的 IXAI 情報輪廓。
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/68">
          IXAI 會先理解你關注的市場、風格、風險偏好與自選觀察。這不是投資建議，
          而是未來 Daily Intelligence relationship 的基礎。
        </p>
        <div className="mt-5 grid gap-2 text-xs leading-5 text-white/62">
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <LineChart className="mb-2 h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
            Public Intelligence 會維持 curated-first；personalization 只做優先排序。
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
            <ShieldCheck className="mb-2 h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
            Watchlist 與 LINE 都先建立 foundation，未來再接 persistence 與 Pro entitlement。
          </div>
        </div>
      </aside>

      <main className="min-w-0 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.88)] p-4 shadow-[0_24px_80px_rgba(9,41,31,0.08)] sm:p-6">
        <ProgressIndicator currentStep={currentStep} />
        <div className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
            {STEPS[currentStep]}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
            {currentStep === 0
              ? "你主要想追蹤哪些市場？"
              : currentStep === 1
                ? "你的投資節奏比較接近哪一種？"
                : currentStep === 2
                  ? "你的風險偏好？"
                  : currentStep === 3
                    ? "你希望 IXAI 優先整理哪些情報？"
                    : currentStep === 4
                      ? "先加入幾個觀察標的。"
                      : "準備連接 LINE intelligence entry。"}
          </h2>
        </div>

        <div className="mt-5">{stepContent[currentStep]}</div>

        <div className="mt-6 grid gap-3 border-t border-[rgba(9,41,31,0.1)] pt-4 sm:flex sm:items-center sm:justify-between">
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-not-allowed disabled:opacity-45"
            disabled={currentStep === 0}
            onClick={() => setStep(currentStep - 1)}
            type="button"
          >
            <ArrowLeft className="h-4 w-4 stroke-current text-[var(--ixai-forest)]" aria-hidden="true" />
            上一步
          </button>

          <div className="grid gap-2 sm:flex sm:items-center">
            {profile.completedAt ? (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
                href="/pro-preview"
              >
                查看 Intelligence Preview
              </Link>
            ) : null}
            {currentStep < STEPS.length - 1 ? (
              <button
                className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
                onClick={() => completeStep(currentStep + 1)}
                type="button"
              >
                下一步
                <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-cream)]" aria-hidden="true" />
              </button>
            ) : (
              <button
                className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
                onClick={completeOnboarding}
                type="button"
              >
                完成 Intelligence Profile
                <Check className="h-4 w-4 stroke-current text-[var(--ixai-cream)]" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </main>
    </section>
  );
}
