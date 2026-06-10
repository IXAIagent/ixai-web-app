import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";

import { AssetList } from "@/components/portfolio/asset-list";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/portfolio/assets",
  description:
    "IXAI Portfolio Assets 是第一版 Asset Management Center，使用 mock data 驗證建立、閱讀、更新與刪除 UI foundation。",
  title: "Portfolio Assets | 我的 IXAI",
});

export default function PortfolioAssetsPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/80 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                Asset Management Center
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-[var(--ixai-forest)] sm:text-5xl">
                Portfolio CRUD Foundation
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)] sm:text-base sm:leading-8">
                使用 mock assets 驗證 Create、Read、Update、Delete 的第一版操作體驗。這一版不寫入 Supabase。
              </p>
            </div>
            <div className="grid gap-2 sm:flex sm:flex-wrap lg:justify-end">
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(9,41,31,0.16)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] transition hover:bg-[rgba(9,41,31,0.04)]"
                href="/my-ixai/portfolio"
              >
                <ArrowLeft className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                Portfolio Center
              </Link>
              <FeatureIcon icon={Database} shadow={false} />
            </div>
          </div>
        </div>

        <AssetList />
      </section>
    </main>
  );
}
