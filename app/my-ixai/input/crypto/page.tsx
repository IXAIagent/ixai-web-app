import Link from "next/link";
import { ArrowLeft, Bitcoin } from "lucide-react";

import { CryptoInputForm } from "@/components/portfolio/crypto-input-form";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/input/crypto",
  description:
    "IXAI Workspace Crypto 輸入 foundation，預留 BTC、ETH、Grid、Dual 與交易所同步流程。",
  title: "新增 Crypto | Asset Input Center",
});

export default function MyIxaiCryptoInputPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]"
            href="/my-ixai/input"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            回到 Asset Input
          </Link>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                Asset Input · Crypto
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                Crypto 輸入 Foundation
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)] sm:text-base sm:leading-8">
                本頁先建立 BTC、ETH、Grid、Dual 與交易所資料的 Workspace 入口。正式匯入、同步與行情連接會在後續版本接上。
              </p>
            </div>
            <FeatureIcon icon={Bitcoin} shadow={false} />
          </div>
        </div>

        <CryptoInputForm />

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          本頁僅用於資產資料整理與輸入流程規劃，不構成投資建議、買賣建議、目標價、報酬承諾或自動交易。
        </p>
      </section>
    </main>
  );
}
