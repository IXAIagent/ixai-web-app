import Link from "next/link";
import { SectionCard } from "@/components/dashboard/section-card";

export function ProCta({ features }: { features: string[] }) {
  return (
    <SectionCard className="bg-[var(--ixai-forest)] text-[var(--ixai-cream)]">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
            IXAI Pro
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            升級 IXAI Pro，建立 AI wealth intelligence 的監控層
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/68">
            未來將延伸至結構型商品監控、AI 風險提醒、投資組合情報與 Crypto
            監控，讓每日閱讀進一步轉為個人化、可持續的 intelligence workflow。
          </p>
          <Link
            className="mt-5 inline-flex rounded-lg bg-[var(--ixai-cream)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
            href="/ixai"
          >
            了解 IXAI Pro
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
              key={feature}
            >
              <p className="text-sm font-medium">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
