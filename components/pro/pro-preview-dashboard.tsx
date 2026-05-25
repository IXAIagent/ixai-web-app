"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, BarChart3, CalendarClock, Radar, ShieldCheck } from "lucide-react";
import { ProAlertPreview } from "@/components/pro/pro-alert-preview";
import { ProPreviewCard } from "@/components/pro/pro-preview-card";
import { ProRiskMap } from "@/components/pro/pro-risk-map";
import { ProWaitlistCta } from "@/components/pro/pro-waitlist-cta";
import { PreviewBadge } from "@/components/pro/preview-badge";
import { UpgradeIntelligenceCta } from "@/components/pro/upgrade-intelligence-cta";
import { trackEvent } from "@/src/lib/analytics/analytics";

export function ProPreviewDashboard() {
  useEffect(() => {
    trackEvent("pro_preview_open", {
      path: window.location.pathname,
      surface: "pro_preview",
    });
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          僅供展示的 Pro 介面
        </p>
        <div className="mt-3">
          <PreviewBadge />
        </div>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
          IXAI Pro 預覽控制台
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          未來 IXAI Pro 會員可能看到的情報控制台展示，用於呈現投資組合關聯性、
          FCN 風險、市場記憶與 AI 警示的可能工作流。本頁僅使用示意資料。
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ProPreviewCard
          eyebrow="風險狀態"
          icon={ShieldCheck}
          note="示意狀態：AI 集中度提高投資組合觀察權重，並非交易建議。"
          title="投資組合風險狀態"
          value="觀察"
        />
        <ProPreviewCard
          eyebrow="市場結構"
          icon={Radar}
          note="市場結構關聯性將對應未來 Watchlist 與曝險輪廓。"
          title="市場結構關聯性"
          value="利率敏感"
        />
        <ProPreviewCard
          eyebrow="觀察名單"
          icon={BarChart3}
          note="示意訊號：半導體與 AI server 標的主導個人觀察雷達。"
          title="個人觀察名單訊號"
          value="AI 供應鏈"
        />
        <ProPreviewCard
          eyebrow="風險窗口"
          icon={CalendarClock}
          note="示意時程：總經數據、財報與 FCN 觀察日整合為單一風險行事曆。"
          title="下一個風險窗口"
          value="7 天"
        />
      </section>

      <ProRiskMap />

      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            FCN 風險情報預覽
          </p>
          <PreviewBadge surface="pro_fcn_risk" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Worst-of 監控", "TSLA 為示意 basket 落後標的"],
            ["KI 距離", "示意緩衝：18.4%"],
            ["KO / coupon 行事曆", "下一次觀察：示意 14 天"],
            ["波動敏感度", "AI basket 波動仍是關鍵輸入"],
          ].map(([label, value]) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/48 p-4" key={label}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                {label}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
                {value}
              </p>
            </article>
          ))}
        </div>
      </section>

      <ProAlertPreview />

      <section className="grid gap-4 rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            升級路徑
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
            加入 Pro 等候名單，取得未來開放通知。
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            此控制台為示意預覽。未來 Pro access 將需要 membership entitlement
            與符合人工審閱原則的風險控管。此階段尚未進行任何收費。
          </p>
          <Link
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
            href="/daily-brief"
          >
            返回 Public Intelligence
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <UpgradeIntelligenceCta
            className="mt-3"
            source="pro_preview_dashboard"
            surface="pro_portfolio"
            tone="light"
          />
        </div>
        <ProWaitlistCta requestedFeature="portfolio_intelligence" surface="pro_preview" />
      </section>
    </div>
  );
}
