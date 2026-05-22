import { SectionCard } from "@/components/dashboard/section-card";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";
import { ixaiIdentity } from "@/src/lib/ixai/identity";

export function ProCta({ features }: { features: string[] }) {
  return (
    <SectionCard className="bg-[var(--ixai-forest)] text-[var(--ixai-cream)]">
      <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
            IXAI Pro
          </p>
          <h2 className="mt-2 text-lg font-semibold leading-6 sm:text-xl">
            升級 IXAI Pro，建立 AI wealth intelligence 的監控層
          </h2>
          <p className="mt-2.5 text-sm leading-6 text-[rgba(245,240,230,0.68)] sm:mt-3 sm:leading-7">
            未來將延伸至結構型商品監控、AI 風險提醒、投資組合情報與 Crypto
            監控，讓每日閱讀進一步轉為個人化、可持續的 intelligence workflow。
          </p>
          <p className="mt-3 text-xs leading-6 text-[rgba(245,240,230,0.50)]">
            {ixaiIdentity.sharedAccountMessage}
          </p>
          <a
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--ixai-cream)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)] sm:mt-5 sm:w-fit"
            href={ixaiEcosystem.proDashboardUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {ixaiEcosystem.cta.enterPro}
          </a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <div
                className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-3.5 sm:p-4"
              key={feature}
            >
              <span className="absolute right-3 top-3 rounded-md border border-white/10 bg-white/[0.055] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[rgba(245,240,230,0.54)]">
                Pro
              </span>
              <p className="text-sm font-medium">{feature}</p>
              <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.42)]">
                Available in IXAI Pro
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
