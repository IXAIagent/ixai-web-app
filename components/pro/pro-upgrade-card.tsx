"use client";

import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import type { ProFeature } from "@/src/lib/membership/entitlements";
import { getUpgradeReason } from "@/src/lib/membership/entitlements";

const featureCopy: Record<ProFeature, { title: string; copy: string }> = {
  ai_alerts: {
    title: "將市場情報轉化為 AI 風險警示。",
    copy: "IXAI Pro 將把你的 Watchlist 與 market memory 連接到個人風險通知。",
  },
  fcn_risk_intelligence: {
    title: "把 FCN 監控帶入個人風險工作區。",
    copy: "從 FCN 教育延伸到 Worst-of、KI 距離與 coupon schedule 監控。",
  },
  portfolio_intelligence: {
    title: "讓 IXAI 成為你的個人情報系統。",
    copy: "Portfolio Intelligence 將連接市場結構、集中度與 Watchlist 行為。",
  },
  premium_daily: {
    title: "把 Daily Brief 延伸為個人晨間簡報。",
    copy: "IXAI Pro 會把 public intelligence 轉化為貼近個人資產的工作流。",
  },
  premium_weekly: {
    title: "將 Weekly Intelligence 連接到你的風險地圖。",
    copy: "IXAI Pro 會把每週市場敘事延伸為 portfolio 與 FCN 監控。",
  },
};

export function ProUpgradeCard({
  feature = "portfolio_intelligence",
  surface,
}: {
  feature?: ProFeature;
  surface: string;
}) {
  const reason = getUpgradeReason(feature);
  const copy = featureCopy[feature];

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            <p className="font-mono text-[11px] uppercase tracking-[0.22em]">
              IXAI Pro 開放能力
            </p>
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-7">{copy.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/68">{copy.copy}</p>
          <p className="mt-2 text-xs leading-6 text-white/48">{reason.reason}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
            href={`/pro?feature=${encodeURIComponent(feature)}`}
            onClick={() =>
              trackEvent("pro_cta_click", {
                membership_plan: "free",
                path: typeof window !== "undefined" ? window.location.pathname : "",
                requested_feature: feature,
                surface,
              })
            }
          >
            加入 Pro 等候名單
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/76"
            href="/pro-preview"
          >
            查看 Pro 情報示意
          </Link>
        </div>
      </div>
    </section>
  );
}
