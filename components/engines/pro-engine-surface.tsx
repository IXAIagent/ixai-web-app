import Link from "next/link";
import { proEngineSurfaces, type ProEngineSurface } from "@/src/lib/engines/pro-engine-surfaces";

const toneClasses: Record<ProEngineSurface["metric"]["tone"], string> = {
  calm: "text-emerald-900/78 bg-emerald-900/[0.06] border-emerald-900/10",
  watch: "text-[var(--ixai-forest)] bg-[rgba(176,141,87,0.12)] border-[rgba(176,141,87,0.26)]",
  stress: "text-[#5c2d1d] bg-[#9f5530]/[0.08] border-[#9f5530]/20",
};

function EngineCard({ engine }: { engine: ProEngineSurface }) {
  return (
    <article className="relative overflow-hidden rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 shadow-[0_18px_48px_rgba(9,41,31,0.055)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
            {engine.label}
          </p>
          <h3 className="mt-2 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
            {engine.title}
          </h3>
        </div>
        <span className="rounded-md border border-[var(--ixai-border)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
          {engine.status === "preview" ? "Preview" : "Locked"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--ixai-ink-muted)]">
            {engine.metric.label}
          </p>
          <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${toneClasses[engine.metric.tone]}`}>
            {engine.metric.value}
          </span>
        </div>
        <p className="text-sm font-semibold text-[var(--ixai-forest)]">
          {engine.state}
        </p>
        <p className="text-sm leading-6 text-[var(--ixai-forest-soft)]">
          {engine.signal}
        </p>
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--ixai-ink-muted)]">
        {engine.summary}
      </p>

      <div className="mt-4 grid gap-2">
        {engine.lockedItems.map((item) => (
          <div
            className="flex items-center justify-between rounded-md border border-[var(--ixai-border)] bg-[rgba(9,41,31,0.025)] px-3 py-2"
            key={item}
          >
            <span className="text-xs font-medium text-[var(--ixai-forest-soft)]">
              {item}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ixai-gold)]">
              Pro
            </span>
          </div>
        ))}
      </div>

      {engine.status === "locked" ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(255,250,240,0.94)] to-transparent backdrop-blur-[1px]" />
      ) : null}
    </article>
  );
}

export function ProEngineSurface() {
  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.72)] p-4 shadow-[0_24px_72px_rgba(9,41,31,0.055)] sm:p-5">
      <div className="flex flex-col gap-4 border-b border-[var(--ixai-border)] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
            Your IXAI Intelligence
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-8 text-[var(--ixai-forest)]">
            Free 是市場情報，IXAI Pro 是你的情報引擎。
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-ink-muted)]">
            這些 engine surfaces 目前以 preview 呈現。未來會接上 portfolio、FCN、
            watchlist、風險提醒與 AI morning brief，形成個人化監控工作流。
          </p>
        </div>
        <Link
          className="w-fit rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
          href="/ixai"
        >
          查看 Pro 方向
        </Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {proEngineSurfaces.map((engine) => (
          <EngineCard engine={engine} key={engine.id} />
        ))}
      </div>
    </section>
  );
}
