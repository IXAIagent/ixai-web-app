import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Layers3,
  LineChart,
  Network,
  PieChart,
} from "lucide-react";

import { PortfolioForm } from "@/components/portfolio/portfolio-form";
import { PortfolioReadbackSummary } from "@/components/portfolio/portfolio-readback-summary";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "投資組合分析 | IXAI Pro",
  description:
    "IXAI Pro 投資組合分析協助投資人理解資產配置、標的集中度、主題曝險與 FCN 重疊風險。",
  canonical: "/portfolio",
});

const WHY_IT_MATTERS = [
  "很多投資人同時持有股票、ETF、加密資產與 FCN，卻分散在不同帳戶與商品中。",
  "風險常常不是單一部位，而是集中在同一個主題、產業、幣別或流動性環境。",
  "AI、科技股、美元流動性與 Crypto 可能互相影響，單看報酬很容易低估關聯風險。",
];

const TRACKING_ITEMS = [
  {
    title: "資產配置",
    copy: "整理股票、ETF、現金、加密資產與結構型商品的整體分布。",
    icon: PieChart,
  },
  {
    title: "單一標的集中度",
    copy: "檢查部位是否過度依賴少數股票、產業或指數。",
    icon: BarChart3,
  },
  {
    title: "主題曝險",
    copy: "把 AI、半導體、美元、Crypto 等主題連成同一張風險地圖。",
    icon: Layers3,
  },
  {
    title: "FCN 與現股重疊",
    copy: "協助辨識現股、ETF 與 FCN 連結標的是否指向同一風險來源。",
    icon: Network,
  },
  {
    title: "市場風險連動",
    copy: "把利率、美元、波動率與市場 regime 接到投資組合脈絡中。",
    icon: LineChart,
  },
];

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(9,41,31,0.18)] bg-white/70 px-3 py-1 text-xs font-semibold text-[rgba(9,41,31,0.74)]">
              <FeatureIcon icon={BriefcaseBusiness} size="sm" shadow={false} />
              IXAI Pro 模組
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-[var(--ixai-forest)] sm:text-5xl">
                投資組合分析：看見你的資產配置與集中風險。
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[rgba(9,41,31,0.72)]">
                IXAI Pro 會把部位、主題與市場風險放在同一個工作區，協助你理解真正的曝險來源。
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
                href="/feedback?intent=portfolio_review"
              >
                預約投資組合診斷
              </Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-[rgba(9,41,31,0.14)] bg-white p-6 shadow-[0_22px_60px_rgba(9,41,31,0.08)]">
            <div className="flex items-start gap-4">
              <FeatureIcon icon={AlertTriangle} tone="cream" />
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgba(9,41,31,0.52)]">
                  Example
                </p>
                <p className="text-2xl font-semibold leading-snug text-[var(--ixai-forest)]">
                  不同商品，可能指向同一個風險。
                </p>
                <p className="text-sm leading-7 text-[rgba(9,41,31,0.72)]">
                  如果投資人同時持有 TSLA 現股、AI ETF，以及連結 TSLA 的 FCN，表面上是不同商品，實際上可能集中在同一個風險來源。
                </p>
              </div>
            </div>
          </aside>
        </div>

        <PortfolioReadbackSummary variant="portfolio" />

        <PortfolioForm />

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
              IXAI Pro 將協助追蹤
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
              從配置到風險連動，不只看單一部位。
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {TRACKING_ITEMS.map((item) => (
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
              實際監控屬於 IXAI Pro。
            </h2>
            <p className="text-sm leading-7 text-[rgba(9,41,31,0.72)]">
              App 會持續提供公開市場情報與教育內容；投資組合監控、FCN 風險整理與個別診斷會放在 Pro 與顧問服務中。本頁不讀取真實部位、不串接券商，也不提供買賣建議。
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
