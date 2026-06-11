import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { FCNWizard } from "@/components/fcn/fcn-wizard";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/input/fcn",
  description:
    "在 IXAI Workspace Asset Input Center 建立 FCN 部位，作為 Portfolio、Risk 與 FCN Center 的資料來源。",
  title: "新增 FCN | Asset Input Center",
});

export default function MyIxaiFcnInputPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.055] px-3 py-2 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
                href="/my-ixai/input"
              >
                <ArrowLeft className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                回到 Asset Input
              </Link>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                Asset Input · FCN
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                建立 FCN 部位
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                FCN Wizard 現在屬於 Workspace Asset Input。建立後資料會成為 Portfolio、Risk、
                FCN Center 與未來 Intelligence workflow 的基礎。
              </p>
            </div>
            <FeatureIcon icon={ShieldCheck} shadow={false} tone="cream" />
          </div>
        </div>

        <FCNWizard />

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          本頁僅用於建立與整理 FCN 資料，作為風險監控與資訊閱讀的基礎，不構成投資建議、商品推薦、目標價、報酬承諾或自動交易。
        </p>
      </section>
    </main>
  );
}
