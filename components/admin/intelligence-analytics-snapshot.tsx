import { Activity, BarChart3, MousePointerClick, Share2 } from "lucide-react";

// v1.33.2 — Internal-only Intelligence Analytics Snapshot. Renders a
// mock surface so the future analytics integration has a UI to land
// against. No DB calls, no provider calls, no localStorage reads. The
// numbers below are deliberately illustrative; the component will be
// rewired to a real query once an analytics provider is registered via
// src/lib/analytics/provider.ts.

const MOCK_SNAPSHOT = {
  windowLabel: "Last 7 days · mock data",
  weeklyOpens: 0,
  dailyOpens: 0,
  shareClicks: 0,
  ctaClicks: 0,
  topSurfaces: [
    { label: "Daily Brief", opens: 0 },
    { label: "Weekly Intelligence", opens: 0 },
    { label: "Market Overview", opens: 0 },
  ],
};

type SnapshotMetricProps = {
  label: string;
  value: number;
  icon: typeof BarChart3;
};

function SnapshotMetric({ label, value, icon: Icon }: SnapshotMetricProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-cream)]">
        {value}
      </p>
    </article>
  );
}

export function IntelligenceAnalyticsSnapshot() {
  const snapshot = MOCK_SNAPSHOT;

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[#0a2119] p-5 text-[var(--ixai-cream)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Intelligence Analytics Snapshot
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7">
            Public Intelligence usage overview
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,240,230,0.62)]">
            {snapshot.windowLabel}. Numbers will populate once a real
            analytics provider is registered via
            <span className="font-mono">{" "}src/lib/analytics/provider.ts</span>.
          </p>
        </div>
        <span className="hidden rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.66)] sm:inline-flex">
          Mock
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <SnapshotMetric icon={BarChart3} label="Weekly opens" value={snapshot.weeklyOpens} />
        <SnapshotMetric icon={Activity} label="Daily opens" value={snapshot.dailyOpens} />
        <SnapshotMetric icon={Share2} label="Share clicks" value={snapshot.shareClicks} />
        <SnapshotMetric icon={MousePointerClick} label="CTA clicks" value={snapshot.ctaClicks} />
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          Top surfaces
        </p>
        <ul className="mt-2 grid gap-1.5">
          {snapshot.topSurfaces.map((row) => (
            <li
              className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.045] px-3 py-2 font-mono text-xs text-[rgba(245,240,230,0.78)]"
              key={row.label}
            >
              <span>{row.label}</span>
              <span className="font-semibold text-[var(--ixai-cream)]">{row.opens}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
