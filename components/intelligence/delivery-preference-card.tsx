"use client";

import { useEffect, useState } from "react";
import { Bell, Check, MessageCircle } from "lucide-react";
import { useIdentitySession } from "@/components/auth/identity-provider";
import { trackEvent } from "@/src/lib/analytics/analytics";
import {
  INTELLIGENCE_INTERESTS,
  type IntelligenceInterest,
} from "@/src/lib/onboarding/profile";
import {
  readInitialDeliveryPreferences,
  writeDeliveryPreferences,
  type DeliveryPreferenceState,
  type IntelligenceDeliveryChannel,
} from "@/src/lib/intelligence/delivery";

function toggleInterest(values: IntelligenceInterest[], value: IntelligenceInterest) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function DeliveryPreferenceCard({ source = "delivery_preferences" }: { source?: string }) {
  const { lineConnected, membership } = useIdentitySession();
  const [preferences, setPreferences] = useState<DeliveryPreferenceState | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setPreferences(readInitialDeliveryPreferences());
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!preferences) {
      return;
    }

    writeDeliveryPreferences(preferences);
  }, [preferences]);

  function updatePreferences(next: DeliveryPreferenceState) {
    setPreferences(next);
    setSaved(false);
  }

  function enableDelivery() {
    if (!preferences) {
      return;
    }

    const next = {
      ...preferences,
      channels: (lineConnected ? ["app", "line"] : ["app"]) satisfies IntelligenceDeliveryChannel[],
      enabled: true,
    };
    setPreferences(next);
    setSaved(true);
    trackEvent("intelligence_delivery_enabled", {
      interest_count: next.interests.length,
      line_connected: lineConnected,
      membership: membership?.plan ?? "anonymous",
      path: window.location.pathname,
      source,
      tier: next.tier,
    });
    if (lineConnected) {
      trackEvent("intelligence_delivery_line_connect", {
        membership: membership?.plan ?? "anonymous",
        path: window.location.pathname,
        source,
        tier: next.tier,
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
            Delivery Preferences
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            選擇 IXAI 每天要優先提醒你的情報。
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-ink-muted)]">
            此版本先使用本機 / session-first preference。未來會接會員、LINE opt-in 與 Pro entitlement。
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ixai-border)] bg-white/55 px-3 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
          <Bell className="h-3.5 w-3.5 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          {preferences.enabled ? "Enabled" : "Preview"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {INTELLIGENCE_INTERESTS.map((interest) => {
          const active = preferences.interests.includes(interest.id);

          return (
            <button
              className={`min-h-20 rounded-lg border p-3 text-left transition ${
                active
                  ? "border-[rgba(176,141,87,0.62)] bg-[rgba(176,141,87,0.14)]"
                  : "border-[var(--ixai-border)] bg-white/48 hover:bg-white/70"
              }`}
              key={interest.id}
              onClick={() =>
                updatePreferences({
                  ...preferences,
                  interests: toggleInterest(preferences.interests, interest.id),
                })
              }
              type="button"
            >
              <span className="flex items-center justify-between gap-3 text-sm font-semibold text-[var(--ixai-forest)]">
                {interest.label}
                {active ? <Check className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" /> : null}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[var(--ixai-ink-muted)]">
                {interest.copy}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2 sm:flex sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-2 text-xs leading-5 text-[var(--ixai-ink-muted)]">
          <MessageCircle className="h-3.5 w-3.5 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          LINE 狀態：{lineConnected ? "可連接 delivery readiness" : "尚未連接，先保留 app delivery preference"}
        </p>
        <button
          className="ixai-cta-forest inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
          onClick={enableDelivery}
          type="button"
        >
          {saved ? "已保存 preference" : "啟用 Delivery Preview"}
        </button>
      </div>
    </section>
  );
}
