import { DirectionPill } from "@/components/dashboard/direction-pill";
import { SectionCard, SectionHeader } from "@/components/dashboard/section-card";
import type { MarketAsset } from "@/lib/mock-data";

export function MarketOverview({ markets }: { markets: MarketAsset[] }) {
  return (
    <SectionCard>
      <SectionHeader eyebrow="市場總覽" title="核心資產追蹤" />
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-1">
        {markets.map((asset) => (
          <div
            className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-4"
            key={asset.symbol}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                  {asset.symbol}
                </p>
                <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">
                  {asset.name}
                </p>
              </div>
              <DirectionPill direction={asset.direction} />
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="font-mono text-xl font-semibold text-[var(--ixai-forest)]">
                {asset.price}
              </p>
              <p className="font-mono text-sm font-medium text-[var(--ixai-forest-soft)]">
                {asset.dailyChange}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
