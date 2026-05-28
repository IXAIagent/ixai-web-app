import { BellRing, Brain, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Personal Portfolio Intelligence",
    copy: "把持倉、集中度與市場 regime 轉成個人化風險脈絡，而不是只看價格清單。",
  },
  {
    icon: ShieldCheck,
    title: "FCN Risk Intelligence",
    copy: "追蹤 worst-of、KI / KO distance、coupon schedule 與波動率壓力。",
  },
  {
    icon: BellRing,
    title: "AI Market Memory & Alerts",
    copy: "讓 IXAI 記住你的 watchlist 與關注主題，未來建立風險提醒工作流。",
  },
];

export function ProFeatureGrid() {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {FEATURES.map((feature) => {
        const Icon = feature.icon;

        return (
          <article
            className="min-w-0 rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5"
            key={feature.title}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)] opacity-100">
                <Icon className="h-4 w-4 stroke-current text-[var(--ixai-gold)] opacity-100" aria-hidden="true" fill="none" strokeWidth={2.25} />
              </span>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ixai-gold)] sm:text-[11px] sm:tracking-[0.18em]">
                Pro 能力支柱
              </p>
            </div>
            <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {feature.copy}
            </p>
          </article>
        );
      })}
    </section>
  );
}
