import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Brain,
  CalendarClock,
  Cpu,
  Landmark,
  LineChart,
  Radar,
  ShieldCheck,
} from "lucide-react";
import {
  PUBLIC_INTELLIGENCE_ENGINE_NOTE,
  PUBLIC_INTELLIGENCE_MODULES,
  type PublicIntelligenceModuleId,
} from "@/src/lib/intelligence/public-engine";

const moduleIcons: Record<PublicIntelligenceModuleId, typeof LineChart> = {
  ai_tech_watch: Cpu,
  crypto_watch: Radar,
  fcn_awareness: ShieldCheck,
  macro_watch: Landmark,
  market_pulse: LineChart,
  risk_regime: Activity,
};

type PublicIntelligenceEngineProps = {
  density?: "full" | "compact";
  surface: string;
};

export function PublicIntelligenceEngine({
  density = "full",
  surface,
}: PublicIntelligenceEngineProps) {
  const compact = density === "compact";

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.88)] p-4 sm:p-6">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Public Intelligence Engine
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-tight text-[var(--ixai-forest)] sm:text-3xl">
            IXAI 的公開市場情報架構。
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            v1.40.3 將 Daily、Weekly 與 Share Intelligence 連接到更清楚的
            Market Pulse、Macro Watch、AI / Tech Watch、Crypto Watch、FCN Awareness 與 Risk Regime。
          </p>
          <div className="mt-4 rounded-lg border border-[rgba(176,141,87,0.26)] bg-white/50 p-3 text-xs leading-6 text-[var(--ixai-ink-muted)]">
            {PUBLIC_INTELLIGENCE_ENGINE_NOTE}
          </div>
          {!compact ? (
            <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap">
              <Link
                className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
                href="/onboarding"
              >
                開始 Onboarding
                <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-cream)]" aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
                href="/daily-brief"
              >
                閱讀 Daily Intelligence
                <Brain className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>

        <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
          {PUBLIC_INTELLIGENCE_MODULES.map((module) => {
            const Icon = moduleIcons[module.id];

            return (
              <article
                className="min-w-0 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4"
                key={`${surface}-${module.id}`}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.1)] text-[var(--ixai-gold)]">
                    <Icon className="h-4 w-4 stroke-current" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                      {module.eyebrow}
                    </p>
                    <h3 className="mt-1 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                      {module.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  {module.summary}
                </p>
                {!compact ? (
                  <>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {module.watchExamples.map((item) => (
                        <span
                          className="rounded-md border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-2 py-1 text-[11px] font-medium text-[var(--ixai-forest)]"
                          key={item}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-3 grid gap-1.5 text-xs leading-5 text-[var(--ixai-ink-muted)]">
                      {module.signals.slice(0, 3).map((signal) => (
                        <li className="flex gap-2" key={signal}>
                          <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
                          <span>{signal}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
