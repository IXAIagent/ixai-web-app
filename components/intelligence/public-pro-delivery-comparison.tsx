import { BellRing, Crown, GraduationCap } from "lucide-react";

const TIERS = [
  {
    copy: "Morning Intelligence、Macro Intelligence、教育型 FCN preview。泛用、資訊型、無個人化風控。",
    icon: GraduationCap,
    label: "Public",
  },
  {
    copy: "Watchlist alert 與 Pro dashboard sample。用於理解未來工作流，不代表正式權限。",
    icon: BellRing,
    label: "Preview",
  },
  {
    copy: "Personalized watchlist、FCN KI proximity、portfolio concentration、AI risk monitor。未來需 entitlement。",
    icon: Crown,
    label: "Pro",
  },
] as const;

export function PublicProDeliveryComparison() {
  return (
    <section className="grid gap-3 rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5 lg:grid-cols-3">
      {TIERS.map(({ copy, icon: Icon, label }) => (
        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/50 p-4" key={label}>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            <Icon className="h-4 w-4 stroke-current" aria-hidden="true" />
            {label}
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">{copy}</p>
        </article>
      ))}
    </section>
  );
}
