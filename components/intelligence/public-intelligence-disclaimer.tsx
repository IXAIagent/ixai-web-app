import { ShieldCheck } from "lucide-react";

type PublicIntelligenceDisclaimerProps = {
  compact?: boolean;
};

export function PublicIntelligenceDisclaimer({
  compact = false,
}: PublicIntelligenceDisclaimerProps) {
  return (
    <aside
      className={`rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(255,250,240,0.72)] ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[rgba(176,141,87,0.24)] bg-[rgba(176,141,87,0.1)] text-[var(--ixai-gold)]">
          <ShieldCheck className="h-4 w-4 stroke-current" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            Public Intelligence Notice
          </p>
          <p className="mt-1 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            IXAI provides market intelligence, educational content, and risk-awareness context.
            Public Intelligence is not personalized investment advice, portfolio analysis,
            trading instruction, or a recommendation to buy or sell any security or financial
            product.
          </p>
        </div>
      </div>
    </aside>
  );
}
