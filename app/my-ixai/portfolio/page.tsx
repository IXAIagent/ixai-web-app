import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Layers3, ShieldAlert } from "lucide-react";

import { PortfolioCenterDashboard } from "@/components/portfolio/portfolio-center-dashboard";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/portfolio",
  description:
    "IXAI Portfolio Center 將 Portfolio、FCN 風險、Multi-Asset Allocation 與會員權限整理成同一個使用者主控台。",
  title: "Portfolio Center | 我的 IXAI",
});

export default function MyIxaiPortfolioPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                My IXAI
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                Portfolio Center：我的資產與風險主控台。
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                把 Portfolio、FCN 風險、Multi-Asset Allocation 與會員權限集中到同一個 App-native dashboard。
              </p>
            </div>

            <div className="grid gap-2 sm:flex sm:flex-wrap lg:justify-end">
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] transition hover:-translate-y-0.5"
                href="/portfolio"
              >
                建立 Portfolio
                <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
                href="/my-ixai/portfolio/assets"
              >
                管理資產
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
                href="/my-ixai/input/fcn"
              >
                建立 FCN
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              {
                copy: "讀取既有 Portfolio 與 multi-asset category summary。",
                icon: BriefcaseBusiness,
                title: "Portfolio Overview",
              },
              {
                copy: "呈現 Worst-of、Near KI、集中度與 FCN intelligence narrative。",
                icon: ShieldAlert,
                title: "FCN Risk",
              },
              {
                copy: "保留 FCN、Stock、Crypto、Grid、Dual、Cash 的未來擴充架構。",
                icon: Layers3,
                title: "Multi-Asset",
              },
            ].map((item) => (
              <article
                className="rounded-xl border border-white/10 bg-white/[0.06] p-4"
                key={item.title}
              >
                <FeatureIcon icon={item.icon} size="sm" shadow={false} />
                <h2 className="mt-3 text-base font-semibold text-[var(--ixai-cream)]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-white/68">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>

        <PortfolioCenterDashboard />
      </section>
    </main>
  );
}
