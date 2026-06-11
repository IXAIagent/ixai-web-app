import Link from "next/link";
import {
  ArrowRight,
  Bitcoin,
  CandlestickChart,
  Database,
  FileSpreadsheet,
  Globe2,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";

import { AssetInputHub } from "@/components/portfolio/asset-input-hub";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/input",
  description:
    "IXAI Asset Input Center 是 Workspace 內建立股票、ETF、Crypto 與 FCN 的統一資產 onboarding 入口。",
  title: "Asset Input Center | 我的 IXAI",
});

const assetInputCards = [
  {
    cta: "新增股票",
    description: "輸入股票代號、成本、股數與市場資訊。",
    eyebrow: "Stock",
    href: "/my-ixai/input/stock",
    icon: CandlestickChart,
    title: "股票",
  },
  {
    cta: "新增 ETF",
    description: "管理 ETF 資產配置與長期投資部位。",
    eyebrow: "ETF",
    href: "/my-ixai/input/stock",
    icon: Database,
    title: "ETF",
  },
  {
    cta: "新增 Crypto",
    description: "管理 BTC、ETH 與其他數位資產。",
    eyebrow: "Crypto",
    href: "/my-ixai/input/crypto",
    icon: Bitcoin,
    title: "Crypto",
  },
  {
    cta: "新增 FCN",
    description: "建立 FCN、Worst Of、KI、KO、Observation 與 Coupon Tracking。",
    eyebrow: "Structured Product",
    href: "/my-ixai/input/fcn",
    icon: ShieldCheck,
    title: "FCN",
  },
];

export default function MyIxaiAssetInputPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/80 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                My IXAI · Workspace Input
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-[var(--ixai-forest)] sm:text-5xl">
                Asset Input Center
                <span className="block text-2xl sm:text-4xl">建立與管理投資資產</span>
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)] sm:text-base sm:leading-8">
                將股票、ETF、加密貨幣與 FCN 建立到 Workspace，作為 Portfolio、Risk 與 Intelligence 的基礎資料來源。
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:-translate-y-0.5 sm:w-fit"
              href="/my-ixai/input/fcn"
            >
              新增 FCN
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {assetInputCards.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className="group flex min-h-56 flex-col justify-between rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-[var(--ixai-forest)] transition hover:-translate-y-0.5 hover:bg-white/90"
                  href={item.href}
                  key={item.title}
                >
                  <span>
                    <FeatureIcon icon={Icon} size="sm" shadow={false} />
                    <span className="mt-4 block font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
                      {item.eyebrow}
                    </span>
                    <span className="mt-2 block text-lg font-semibold">
                      {item.title}
                    </span>
                    <span className="mt-2 block text-sm leading-7 text-[var(--ixai-forest-soft)]">
                      {item.description}
                    </span>
                  </span>
                  <span className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[rgba(9,41,31,0.18)] bg-white/65 px-3 py-2 text-sm font-semibold">
                    {item.cta}
                    <PlusCircle className="h-4 w-4 text-[var(--ixai-gold)] transition group-hover:scale-105" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
              <FeatureIcon icon={Database} size="sm" shadow={false} />
              <h2 className="mt-3 text-base font-semibold text-[var(--ixai-forest)]">
                Manual Input
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                登入後從 Workspace 建立資產，讓 Portfolio、Risk 與 Intelligence 使用同一份資料來源。
              </p>
            </article>
            <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
              <FeatureIcon icon={FileSpreadsheet} size="sm" shadow={false} />
              <h2 className="mt-3 text-base font-semibold text-[var(--ixai-forest)]">
                CSV Ready
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                保留 Legacy Pro 匯入需求的欄位與驗證方向；本版不做真實檔案上傳。
              </p>
            </article>
            <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
              <FeatureIcon icon={Globe2} size="sm" shadow={false} />
              <h2 className="mt-3 text-base font-semibold text-[var(--ixai-forest)]">
                Global Foundation
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                預留台灣、香港、中國、日本、韓國、美國、歐洲與加密資產輸入語言。
              </p>
            </article>
          </div>
        </div>

        <AssetInputHub />
      </section>
    </main>
  );
}
