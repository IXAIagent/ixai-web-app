import { AlertTriangle, BellRing, Cpu, Landmark } from "lucide-react";

const ALERTS = [
  {
    icon: Landmark,
    title: "Macro alert",
    copy: "Rates pressure remains the primary input for growth-stock valuation risk.",
  },
  {
    icon: Cpu,
    title: "AI supply chain alert",
    copy: "Taiwan AI supply chain stays relevant when NVDA / TSM / server names cluster.",
  },
  {
    icon: BellRing,
    title: "Crypto liquidity alert",
    copy: "BTC/ETH volatility is monitored as a risk-appetite signal, not a trade call.",
  },
  {
    icon: AlertTriangle,
    title: "FCN risk alert",
    copy: "Sample alert: worst-of sensitivity rises as volatility and concentration overlap.",
  },
];

export function ProAlertPreview() {
  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-4 sm:p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
        AI Alert Preview
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {ALERTS.map((alert) => {
          const Icon = alert.icon;
          return (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/48 p-4" key={alert.title}>
              <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-[var(--ixai-forest)]">
                  {alert.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">{alert.copy}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
