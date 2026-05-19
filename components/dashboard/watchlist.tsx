import { DirectionPill } from "@/components/dashboard/direction-pill";
import { SectionCard, SectionHeader } from "@/components/dashboard/section-card";
import type { WatchlistAsset } from "@/lib/mock-data";

export function Watchlist({ assets }: { assets: WatchlistAsset[] }) {
  return (
    <SectionCard>
      <SectionHeader eyebrow="自選觀察" title="重點資產追蹤" />
      <div className="divide-y divide-[var(--ixai-border)]">
        {assets.map((asset) => (
          <article className="px-5 py-4" key={asset.symbol}>
            <div className="flex items-start justify-between gap-4">
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
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {asset.thesis}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
              {asset.status}
            </p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
