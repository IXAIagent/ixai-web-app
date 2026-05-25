import {
  BarChart3,
  Mail,
  MessageCircle,
  MousePointerClick,
} from "lucide-react";

// v1.34 — Admin Distribution Snapshot. Mock-only — no DB query, no
// provider call. Lives next to IntelligenceAnalyticsSnapshot on /admin
// as the landing surface for future real subscriber telemetry.

const MOCK_SNAPSHOT = {
  windowLabel: "Last 7 days · mock data",
  subscribers: 0,
  emailCaptures: 0,
  lineFollowers: 0,
  distributionClicks: 0,
  topSurfaces: [
    { label: "Home distribution strip", clicks: 0 },
    { label: "Weekly slug CTA", clicks: 0 },
    { label: "Daily slug CTA", clicks: 0 },
  ],
};

type MetricProps = {
  label: string;
  value: number;
  icon: typeof BarChart3;
};

function Metric({ label, value, icon: Icon }: MetricProps) {
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

export function DistributionSnapshot() {
  const snapshot = MOCK_SNAPSHOT;

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[#0a2119] p-5 text-[var(--ixai-cream)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Distribution Snapshot
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7">
            Subscribers · email · LINE · CTA clicks
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[rgba(245,240,230,0.62)]">
            {snapshot.windowLabel}. Numbers populate when a real subscriber
            store (email provider, LINE OA bridge, analytics provider) is
            wired in. v1.34 ships the capture architecture only.
          </p>
        </div>
        <span className="hidden rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(245,240,230,0.66)] sm:inline-flex">
          Mock
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Metric icon={BarChart3} label="Subscribers" value={snapshot.subscribers} />
        <Metric icon={Mail} label="Email captures" value={snapshot.emailCaptures} />
        <Metric icon={MessageCircle} label="LINE OA clicks" value={snapshot.lineFollowers} />
        <Metric
          icon={MousePointerClick}
          label="Distribution CTA clicks"
          value={snapshot.distributionClicks}
        />
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
              <span className="font-semibold text-[var(--ixai-cream)]">{row.clicks}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
