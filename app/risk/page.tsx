import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Gauge,
  Globe2,
  Radar,
  ShieldAlert,
  Waves,
} from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "風險中心 | IXAI Pro",
  description:
    "IXAI Pro 風險中心協助投資人追蹤市場 regime、重大事件、集中度、FCN 風險與情境提醒。",
  canonical: "/risk",
});

const WHY_IT_MATTERS = [
  "市場風險不只來自單一股票，常常來自利率、美元、估值與流動性的共同變化。",
  "科技股、加密市場與地緣政治會同時影響投資組合與結構型商品的風險狀態。",
  "FCN 投資人更需要知道 Worst-of 標的與 KI 距離是否正在惡化，而不是只看配息。",
];

const RISK_ITEMS = [
  {
    title: "市場 regime",
    copy: "辨識市場處於風險偏好、估值壓力、高波動或流動性緊縮狀態。",
    icon: Gauge,
  },
  {
    title: "重大事件",
    copy: "整理央行、財報、法說、監管與地緣政治事件對風險的影響。",
    icon: Globe2,
  },
  {
    title: "集中度",
    copy: "觀察部位是否過度集中在同一標的、主題、產業或市場因子。",
    icon: Radar,
  },
  {
    title: "FCN 風險",
    copy: "追蹤 Worst-of、KI / KO 距離與配息觀察日附近的風險變化。",
    icon: ShieldAlert,
  },
  {
    title: "情境提醒",
    copy: "把利率、波動率、科技股回檔與美元走勢轉成可檢查的情境。",
    icon: Waves,
  },
  {
    title: "AI 風險摘要",
    copy: "用清楚語言整理市場壓力來源；不產生買賣訊號或自動交易。",
    icon: Bell,
  },
];

export default function RiskPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(9,41,31,0.18)] bg-white/70 px-3 py-1 text-xs font-semibold text-[rgba(9,41,31,0.74)]">
              <FeatureIcon icon={Activity} size="sm" shadow={false} />
              IXAI Pro 模組
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-[var(--ixai-forest)] sm:text-5xl">
                風險中心：不要等市場大跌才發現風險。
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[rgba(9,41,31,0.72)]">
                IXAI Pro 會把市場 regime、FCN 風險、集中度與重大事件整理成同一個風險工作流。
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="ixai-cta-forest inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ixai-forest)] px-5 py-3 text-sm font-semibold shadow-[0_14px_32px_rgba(9,41,31,0.18)] transition hover:-translate-y-0.5"
                href="/account"
              >
                申請 Pro 測試
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-[rgba(9,41,31,0.22)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ixai-forest)] transition hover:border-[var(--ixai-green)] hover:text-[var(--ixai-green)]"
                href="/feedback?intent=risk_review"
              >
                預約風險健檢
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-[rgba(9,41,31,0.14)] bg-white p-6 shadow-[0_22px_60px_rgba(9,41,31,0.08)]">
            <div className="flex items-start gap-4">
              <FeatureIcon icon={AlertTriangle} tone="cream" />
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgba(9,41,31,0.52)]">
                  Scenario
                </p>
                <p className="text-2xl font-semibold leading-snug text-[var(--ixai-forest)]">
                  配息正常，不代表風險沒有改變。
                </p>
                <p className="text-sm leading-7 text-[rgba(9,41,31,0.72)]">
                  如果市場進入高波動狀態，FCN 的 Worst-of 標的又接近 KI，投資人不應只看配息，而要重新檢查整體曝險。
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {WHY_IT_MATTERS.map((item) => (
            <div
              className="rounded-2xl border border-[rgba(9,41,31,0.12)] bg-white p-5 shadow-[0_14px_34px_rgba(9,41,31,0.06)]"
              key={item}
            >
              <p className="text-sm leading-7 text-[rgba(9,41,31,0.74)]">{item}</p>
            </div>
          ))}
        </section>

        <section className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[rgba(9,41,31,0.52)]">
              IXAI Pro 風險中心將追蹤
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
              從市場壓力到 FCN Worst-of，一起放進風險脈絡。
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {RISK_ITEMS.map((item) => (
              <article
                className="rounded-2xl border border-[rgba(9,41,31,0.12)] bg-white p-5 shadow-[0_14px_34px_rgba(9,41,31,0.06)]"
                key={item.title}
              >
                <FeatureIcon icon={item.icon} />
                <h3 className="mt-4 text-lg font-semibold text-[var(--ixai-forest)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[rgba(9,41,31,0.70)]">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[rgba(9,41,31,0.14)] bg-[rgba(9,41,31,0.04)] p-6 sm:p-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-semibold text-[var(--ixai-forest)]">
              風險提醒不是買賣指令。
            </h2>
            <p className="text-sm leading-7 text-[rgba(9,41,31,0.72)]">
              IXAI Pro 風險中心用於風險意識、教育與監控工作流。本頁不讀取真實部位、不連接券商，也不提供目標價、報酬承諾或交易建議。
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
