"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BellRing,
  CirclePause,
  CircleSlash,
  Clock8,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useIdentitySession } from "@/components/auth/identity-provider";
import {
  readLineDeliveryPreferences,
  setLineDeliveryStatus,
  toggleLineDeliveryPreference,
  type LineDeliveryPreferenceKey,
  type LineDeliveryPreferenceState,
} from "@/src/lib/intelligence/delivery";

const preferenceOptions: Array<{
  copy: string;
  key: LineDeliveryPreferenceKey;
  label: string;
}> = [
  {
    copy: "Public morning market context. Readiness only; no automated send yet.",
    key: "dailyMorningBrief",
    label: "Daily morning brief",
  },
  {
    copy: "Weekly Intelligence digest for public market awareness.",
    key: "weeklyIntelligence",
    label: "Weekly intelligence digest",
  },
  {
    copy: "Market Pulse, Macro Watch, and general risk context.",
    key: "marketPulse",
    label: "Market Pulse",
  },
  {
    copy: "Uses Watchlist Intelligence Lite topics without portfolio assumptions.",
    key: "watchlistLite",
    label: "Watchlist Intelligence Lite",
  },
  {
    copy: "Educational FCN structure updates and concept refreshers.",
    key: "fcnAwareness",
    label: "FCN Awareness",
  },
  {
    copy: "Public Risk Regime language for Calm / Neutral / Elevated / Stress.",
    key: "riskRegime",
    label: "Risk Regime",
  },
];

const layerCards = [
  {
    label: "Public Delivery",
    copy: "General Daily / Weekly / Market Intelligence. Educational and non-personalized.",
  },
  {
    label: "Account Delivery",
    copy: "Preference memory, watchlist-lite relevance, identity continuity, and LINE readiness.",
  },
  {
    label: "Future Pro Delivery",
    copy: "Portfolio Intelligence, AI Alerts, FCN workflow, and risk intelligence after explicit activation.",
  },
];

function statusCopy(preferences: LineDeliveryPreferenceState, lineConnected: boolean) {
  if (!lineConnected) {
    return "LINE 尚未連接";
  }

  if (preferences.deliveryStatus === "paused") {
    return "Delivery readiness 已暫停";
  }

  if (preferences.deliveryStatus === "ready") {
    return "LINE readiness preference 已保存";
  }

  return "可設定 LINE delivery preference";
}

export function LineDeliveryFoundationCard({
  source = "account_line_delivery_foundation",
}: {
  source?: string;
}) {
  const { lineConnected } = useIdentitySession();
  const [preferences, setPreferences] = useState<LineDeliveryPreferenceState | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPreferences(readLineDeliveryPreferences());
    }, 0);

    function refresh() {
      setPreferences(readLineDeliveryPreferences());
    }

    window.addEventListener("storage", refresh);
    window.addEventListener("ixai-line-delivery-preferences-change", refresh);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("ixai-line-delivery-preferences-change", refresh);
    };
  }, []);

  function togglePreference(key: LineDeliveryPreferenceKey) {
    if (!preferences) {
      return;
    }

    setPreferences(toggleLineDeliveryPreference(preferences, key));
  }

  function updateStatus(status: "not_connected" | "paused" | "ready") {
    if (!preferences) {
      return;
    }

    setPreferences(setLineDeliveryStatus(preferences, status, lineConnected));
  }

  return (
    <section
      className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.9)] p-4 shadow-[0_18px_48px_rgba(9,41,31,0.08)] sm:p-6"
      data-source={source}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
              <MessageCircle className="h-4 w-4 stroke-current" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                LINE Delivery Foundation
              </p>
              <h2 className="mt-1 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
                設定未來透過 LINE 接收 IXAI Intelligence 的偏好。
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            LINE Delivery is currently in readiness mode. Your preferences help IXAI prepare the
            intelligence you want to receive, but automated push delivery is not active yet.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
            href="/liff"
          >
            <MessageCircle className="h-4 w-4 stroke-current" aria-hidden="true" />
            連接 LINE 接收情報
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.34)] bg-white/60 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
            href="/weekly-brief"
          >
            View Weekly Intelligence
            <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {preferences ? (
        <>
          <div className="mt-5 grid gap-3 lg:grid-cols-[0.9fr_1.4fr]">
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                    Opt-in readiness
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
                    {statusCopy(preferences, lineConnected)}
                  </h3>
                </div>
                <span className="rounded-full border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.1)] px-3 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
                  {preferences.deliveryStatus}
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.12)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!lineConnected}
                  onClick={() => updateStatus("ready")}
                  type="button"
                >
                  <BellRing className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
                  Set delivery preferences
                </button>
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
                  onClick={() => updateStatus("paused")}
                  type="button"
                >
                  <CirclePause className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
                  Pause readiness
                </button>
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
                  onClick={() => updateStatus("not_connected")}
                  type="button"
                >
                  <CircleSlash className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
                  Remove LINE delivery preference
                </button>
              </div>
              <p className="mt-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                Pause / unsubscribe concepts are modeled here before production delivery exists.
                Real push requires durable opt-in, logs, and approval.
              </p>
            </article>

            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4">
              <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
                <Clock8 className="h-4 w-4 stroke-current" aria-hidden="true" />
                <p className="font-mono text-[11px] uppercase tracking-[0.16em]">
                  Delivery preference structure
                </p>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {preferenceOptions.map((option) => {
                  const active = preferences[option.key];

                  return (
                    <button
                      className={`min-h-24 rounded-lg border p-3 text-left transition ${
                        active
                          ? "border-[rgba(176,141,87,0.56)] bg-[rgba(176,141,87,0.13)]"
                          : "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.62)] hover:bg-white/70"
                      }`}
                      key={option.key}
                      onClick={() => togglePreference(option.key)}
                      type="button"
                    >
                      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-[var(--ixai-forest)]">
                        {option.label}
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            active ? "bg-[var(--ixai-gold)]" : "bg-[rgba(9,41,31,0.18)]"
                          }`}
                        />
                      </span>
                      <span className="mt-2 block text-xs leading-5 text-[var(--ixai-forest-soft)]">
                        {option.copy}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {layerCards.map((card) => (
              <article
                className="rounded-lg border border-[var(--ixai-border)] bg-white/50 p-4"
                key={card.label}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                  {card.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {card.copy}
                </p>
              </article>
            ))}
          </div>

          <aside className="mt-4 rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(255,250,240,0.72)] p-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.1)] text-[var(--ixai-gold)]">
                <ShieldCheck className="h-4 w-4 stroke-current" aria-hidden="true" />
              </span>
              <p className="text-xs leading-6 text-[var(--ixai-forest-soft)]">
                Delivery preferences organize the types of market intelligence you want IXAI to
                prepare. They are not trading instructions or personalized investment
                recommendations.
              </p>
            </div>
          </aside>
        </>
      ) : (
        <div className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/50 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          正在讀取此裝置的 LINE delivery preference...
        </div>
      )}
    </section>
  );
}
