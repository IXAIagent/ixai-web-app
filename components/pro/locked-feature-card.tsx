import { CheckCircle2, LockKeyhole } from "lucide-react";

export function LockedFeatureCard({
  description,
  enabled,
  name,
}: {
  description: string;
  enabled: boolean;
  name: string;
}) {
  return (
    <article
      className={`min-w-0 rounded-lg border px-3 py-3 ${
        enabled
          ? "border-emerald-700/20 bg-emerald-50/70 text-emerald-950"
          : "border-[rgba(176,141,87,0.3)] bg-[rgba(255,250,240,0.72)] text-[var(--ixai-forest)]"
      }`}
    >
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${
            enabled
              ? "border-emerald-700/20 bg-white/60 text-emerald-800"
              : "border-[rgba(176,141,87,0.34)] bg-white/55 text-[var(--ixai-gold)]"
          }`}
        >
          {enabled ? (
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-5">{name}</h3>
            <span className="rounded border border-current/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] opacity-80">
              {enabled ? "可使用" : "尚未開放"}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 opacity-80">{description}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] opacity-70">
            {enabled ? "功能已開放" : "Pro 保留功能"}
          </p>
          {!enabled ? (
            <p className="mt-1 text-xs leading-5 opacity-70">升級路徑規劃中。</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
