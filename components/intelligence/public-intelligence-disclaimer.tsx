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
            公開市場情報提醒
          </p>
          <p className="mt-1 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            IXAI 提供市場情報、教育內容與風險意識脈絡；公開市場情報不是個人化投資建議、
            投資組合分析、交易指令，也不是任何證券或金融商品的買賣建議。
          </p>
        </div>
      </div>
    </aside>
  );
}
