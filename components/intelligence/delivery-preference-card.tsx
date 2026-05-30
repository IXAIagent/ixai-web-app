"use client";

import { useEffect, useState } from "react";
import { Bell, CalendarDays, Check, Mail, MessageCircle, Send, Smartphone } from "lucide-react";
import { useIdentitySession } from "@/components/auth/identity-provider";
import { trackEvent } from "@/src/lib/analytics/analytics";
import {
  DISTRIBUTION_CATEGORY_OPTIONS,
  DISTRIBUTION_CHANNEL_OPTIONS,
  DISTRIBUTION_FREQUENCY_OPTIONS,
  readDistributionPreferences,
  setDistributionFrequency,
  toggleDistributionCategory,
  writeDistributionPreferences,
  type DistributionPreference,
} from "@/src/lib/intelligence/distribution";

const channelIcons = {
  email: Mail,
  in_app: Smartphone,
  line: MessageCircle,
  push: Bell,
} as const;

export function DeliveryPreferenceCard({ source = "delivery_preferences" }: { source?: string }) {
  const { lineConnected, membership } = useIdentitySession();
  const [preferences, setPreferences] = useState<DistributionPreference | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const initialPreferences = readDistributionPreferences();
      setPreferences(initialPreferences);
      trackEvent("intelligence_distribution_viewed", {
        category_count: initialPreferences.categories.length,
        channel_count: initialPreferences.channels.length,
        frequency: initialPreferences.frequency,
        membership: membership?.plan ?? "anonymous",
        path: window.location.pathname,
        source,
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, [membership?.plan, source]);

  useEffect(() => {
    if (!preferences) {
      return;
    }

    writeDistributionPreferences(preferences);
  }, [preferences]);

  function updatePreferences(next: DistributionPreference) {
    setPreferences(next);
    setSaved(false);
  }

  function saveDistributionPreferences() {
    if (!preferences) {
      return;
    }

    const next = writeDistributionPreferences(preferences);
    setPreferences(next);
    setSaved(true);
    trackEvent("intelligence_delivery_enabled", {
      category_count: next.categories.length,
      frequency: next.frequency,
      line_connected: lineConnected,
      membership: membership?.plan ?? "anonymous",
      path: window.location.pathname,
      source,
      tier: "public",
    });
    if (lineConnected) {
      trackEvent("intelligence_delivery_line_connect", {
        membership: membership?.plan ?? "anonymous",
        path: window.location.pathname,
        source,
        tier: "public",
      });
    }
  }

  if (!preferences) {
    return (
      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.84)] p-4 text-sm text-[var(--ixai-ink-muted)] sm:p-5">
        正在載入 delivery preferences...
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
            Distribution Preferences
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            設定 IXAI 要如何整理你的情報分發偏好。
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-ink-muted)]">
            v1.42.0 先建立 Generate → Review → Distribute → Measure 的 in-app preference layer。
            LINE、Email 與 Push 僅保留 future channel，不會在本版啟用真實推送。
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ixai-border)] bg-white/55 px-3 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
          <Bell className="h-3.5 w-3.5 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          {saved ? "Preference saved" : "In-App only"}
        </span>
      </div>

      <div className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3">
        <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
          <CalendarDays className="h-4 w-4 stroke-current" aria-hidden="true" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
            Frequency
          </p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {DISTRIBUTION_FREQUENCY_OPTIONS.map((option) => {
            const active = preferences.frequency === option.id;

            return (
              <button
                className={`min-h-24 rounded-lg border p-3 text-left transition ${
                  active
                    ? "border-[rgba(176,141,87,0.62)] bg-[rgba(176,141,87,0.14)]"
                    : "border-[var(--ixai-border)] bg-white/55 hover:bg-white/75"
                }`}
                key={option.id}
                onClick={() => updatePreferences(setDistributionFrequency(preferences, option.id))}
                type="button"
              >
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-[var(--ixai-forest)]">
                  {option.label}
                  {active ? <Check className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" /> : null}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--ixai-ink-muted)]">
                  {option.copy}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3">
        <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
          <Send className="h-4 w-4 stroke-current" aria-hidden="true" />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
            Intelligence Categories
          </p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {DISTRIBUTION_CATEGORY_OPTIONS.map((category) => {
            const active = preferences.categories.includes(category.id);

            return (
              <button
                className={`min-h-20 rounded-lg border p-3 text-left transition ${
                  active
                    ? "border-[rgba(176,141,87,0.62)] bg-[rgba(176,141,87,0.14)]"
                    : "border-[var(--ixai-border)] bg-white/55 hover:bg-white/75"
                }`}
                key={category.id}
                onClick={() => updatePreferences(toggleDistributionCategory(preferences, category.id))}
                type="button"
              >
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-[var(--ixai-forest)]">
                  {category.label}
                  {active ? <Check className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" /> : null}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--ixai-ink-muted)]">
                  {category.copy}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
          Channel Preferences
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {DISTRIBUTION_CHANNEL_OPTIONS.map((channel) => {
            const Icon = channelIcons[channel.id];
            const active = channel.status === "active";

            return (
              <article
                className={`min-h-28 rounded-lg border p-3 ${
                  active
                    ? "border-[rgba(176,141,87,0.62)] bg-[rgba(176,141,87,0.14)]"
                    : "border-[var(--ixai-border)] bg-white/45 opacity-80"
                }`}
                key={channel.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ixai-forest)]">
                    <Icon className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
                    {channel.label}
                  </span>
                  <span className="rounded-full border border-[rgba(176,141,87,0.28)] bg-white/55 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
                    {channel.status === "active" ? "active" : "future"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--ixai-ink-muted)]">
                  {channel.copy}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:flex sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 text-xs leading-5 text-[var(--ixai-ink-muted)]">
          <MessageCircle className="h-3.5 w-3.5 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          LINE 狀態：{lineConnected ? "已連接，但本版不啟用自動推送" : "尚未連接；本版仍只保存 In-App preference"}
        </p>
        <button
          className="ixai-cta-forest inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
          onClick={saveDistributionPreferences}
          type="button"
        >
          {saved ? "已保存 distribution preference" : "保存 Distribution Preference"}
        </button>
      </div>

      <p className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-white/40 p-3 text-xs leading-5 text-[var(--ixai-ink-muted)]">
        Distribution preferences organize what IXAI should prepare for in-app reading. They are
        not LINE push, email automation, notification opt-in, user profiling, or investment advice.
      </p>
    </section>
  );
}
