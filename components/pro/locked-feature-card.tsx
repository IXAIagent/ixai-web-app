import { CheckCircle2, LockKeyhole } from "lucide-react";

// v1.64.1 — Reusable card replacing the pre-v1.64.0 pale-gold-icon-on-cream
// pattern with the IXAI icon-contrast rule:
//   - dark forest icon container (≥ 36×36)
//   - gold or cream symbol depending on state
//   - visible border on the container
// Enabled state uses --ixai-risk-clear tokens via color-mix() instead of the
// off-brand emerald-* utility classes. Disabled state uses gold-tinted ixai
// tokens so it remains legible on cream surfaces.

export function LockedFeatureCard({
  description,
  enabled,
  name,
}: {
  description: string;
  enabled: boolean;
  name: string;
}) {
  const cardClass = enabled
    ? "min-w-0 rounded-lg border px-3 py-3 border-[color-mix(in_srgb,var(--ixai-risk-clear)_38%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_10%,white)] text-[color-mix(in_srgb,var(--ixai-risk-clear)_60%,var(--ixai-forest))]"
    : "min-w-0 rounded-lg border px-3 py-3 border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.72)] text-[var(--ixai-forest)]";

  return (
    <article className={cardClass}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(9,41,31,0.34)] bg-[var(--ixai-forest)] shadow-[0_6px_14px_rgba(9,41,31,0.12)]">
          {enabled ? (
            <CheckCircle2 className="h-4 w-4 text-[var(--ixai-cream)]" aria-hidden="true" />
          ) : (
            <LockKeyhole className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
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
