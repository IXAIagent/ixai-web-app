import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  Layers3,
  Newspaper,
  ShieldCheck,
} from "lucide-react";
import { ProWorkspaceHub } from "@/components/pro/pro-workspace-hub";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

// v1.64.0 — /pro is the conversion surface. The marketing prelude
// (hero / App-vs-Pro line / pain points / consulting CTA) lives in
// this page-level file. The workspace hub below it owns all
// entitlement, backend health, and account-link logic.

export const metadata = buildPublicMetadata({
  title: "IXAI Pro — 進階投資情報工作區",
  description:
    "IXAI Pro 把市場情報延伸為 FCN 監控、投資組合分析與風險中心。App 提供市場教育與公開情報，Pro 提供進階監控與工作區。",
  canonical: "/pro",
});

const PAIN_POINTS = [
  {
    title: "FCN 不只看配息",
    copy: "Worst-of、KI / KO 距離、觀察日與波動率會持續改變。配息看起來穩，但風險可能在你沒注意時擴大。",
    icon: ShieldCheck,
  },
  {
    title: "投資組合風險會集中",
    copy: "多檔 FCN、多個券商、多檔股票之間，會出現標的重複曝險與類股集中度。對帳單上很難看到全貌。",
    icon: Layers3,
  },
  {
    title: "市場資訊太多，人工追蹤容易漏",
    copy: "新聞、利率、財報、配息日、觀察日各自分散；多檔商品同時管理時，重要事件很容易被錯過。",
    icon: Newspaper,
  },
];

export default function ProPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* 1. Hero — value proposition first, status notice second */}
      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ixai-gold)] sm:text-[11px]">
          IXAI Pro
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-2xl font-semibold leading-tight sm:text-5xl sm:leading-snug">
          給需要持續監控風險的投資人與顧問。
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
          App 提供市場教育、公開情報與顧問服務導流。Pro 提供進階的 FCN 監控、投資組合分析、風險中心，
          以及未來的 AI 投資工作台。Pro 屬於受邀測試 / 未來付費的進階工作區，不是免費 App 的延伸。
        </p>
        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
          <Link
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
            href="/account"
          >
            申請 Pro 測試
            <ArrowRight className="h-4 w-4 text-[var(--ixai-forest)]" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
            href="#pro-modules"
          >
            查看 Pro 模組
            <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.55)] bg-[rgba(176,141,87,0.18)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-[rgba(176,141,87,0.28)]"
            href="/feedback?intent=consulting"
          >
            預約顧問諮詢
            <CalendarCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 2. Pain points */}
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          為什麼需要 Pro
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          App 看市場，Pro 看風險。多檔 FCN 與投資組合需要持續整理。
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {PAIN_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <article
                className="flex h-full flex-col rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4"
                key={point.title}
              >
                {/* v1.64.2 — migrated to shared <FeatureIcon> */}
                <FeatureIcon icon={Icon} size="md" tone="gold" />
                <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  {point.copy}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. Pro modules — workspace hub owns entitlement state */}
      <div id="pro-modules" className="scroll-mt-24">
        <ProWorkspaceHub />
      </div>

      {/* 4. App-vs-Pro reaffirmation */}
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:p-5">
        <div className="flex items-start gap-3">
          {/* v1.64.2 — migrated to shared <FeatureIcon> */}
          <FeatureIcon icon={AlarmClock} size="md" tone="gold" shadow={false} />
          <p>
            <span className="font-semibold text-[var(--ixai-forest)]">App 提供市場教育與公開情報，Pro 提供進階監控與工作區。</span>
            完成綁定帳號後，已開放測試資格的使用者可進入 Pro 測試模組；本階段不含付款、券商串接、真實部位資料或投資建議。
          </p>
        </div>
      </section>

      {/* 5. Consulting CTA — 顧問服務 is the human-touch path */}
      <section className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(255,250,240,0.92)] p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
              一玄投資顧問服務
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
              需要人為審視？預約 FCN 健檢或投資組合診斷。
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              一玄投資顧問團隊提供 FCN 健檢、投資組合診斷與高資產客戶諮詢，
              以投資顧問經驗整理風險意識；屬 1:1 顧問流程，非系統自動分析，亦不構成個別投資建議。
            </p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap lg:flex-col">
            <Link
              className="ixai-cta-forest inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-5 py-3 text-sm font-semibold text-[var(--ixai-cream)]"
              href="/feedback?intent=fcn_consultation"
            >
              預約 FCN 健檢
              <CalendarCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-5 py-3 text-sm font-semibold text-[var(--ixai-forest)] transition hover:bg-white/75"
              href="/feedback?intent=portfolio_review"
            >
              申請投資組合診斷
              <BriefcaseBusiness className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
