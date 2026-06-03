import { CheckCircle2, LockKeyhole } from "lucide-react";
import { FeatureIcon } from "@/components/ui/feature-icon";

// v1.64.2 — Migrated to the shared <FeatureIcon> primitive so the
// dark-forest container + gold/cream glyph contract lives in exactly
// one place. Enabled state uses --ixai-risk-clear via color-mix();
// disabled state uses the gold-tinted ixai border / bg.

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
        <FeatureIcon
          className="mt-0.5"
          icon={enabled ? CheckCircle2 : LockKeyhole}
          size="md"
          tone={enabled ? "cream" : "gold"}
        />
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
