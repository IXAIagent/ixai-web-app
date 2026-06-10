import Link from "next/link";
import { ArrowRight, Database, FileSpreadsheet, Globe2 } from "lucide-react";

import { AssetInputHub } from "@/components/portfolio/asset-input-hub";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/input",
  description:
    "IXAI Asset Input Hub 建立多資產輸入入口，預留手動輸入、CSV 匯入、Broker Sync、全球市場與持倉新聞 intelligence foundation。",
  title: "Asset Input | 我的 IXAI",
});

export default function MyIxaiAssetInputPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/80 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                My IXAI
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-[var(--ixai-forest)] sm:text-5xl">
                Asset Input：多資產輸入基礎。
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)] sm:text-base sm:leading-8">
                這一頁建立 FCN、股票、Crypto、Grid、Dual、Cash 的統一輸入語言，作為後續 CSV 匯入、券商同步與持倉 intelligence 的基礎。
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:-translate-y-0.5 sm:w-fit"
              href="/my-ixai/portfolio"
            >
              查看 Portfolio Center
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              {
                copy: "保留手動輸入與未來表單流程，但本版不新增 CRUD。",
                icon: Database,
                title: "Manual First",
              },
              {
                copy: "先定義欄位與驗證方向，未來承接 Legacy Pro 匯入需求。",
                icon: FileSpreadsheet,
                title: "CSV Ready",
              },
              {
                copy: "預留台灣、香港、中國、日本、韓國、美國與歐洲市場。",
                icon: Globe2,
                title: "Global Foundation",
              },
            ].map((item) => (
              <article
                className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                key={item.title}
              >
                <FeatureIcon icon={item.icon} size="sm" shadow={false} />
                <h2 className="mt-3 text-base font-semibold text-[var(--ixai-forest)]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>

        <AssetInputHub />
      </section>
    </main>
  );
}
