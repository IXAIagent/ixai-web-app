import Link from "next/link";
import {
  FCN_MONITORING_DISCLAIMER,
  type FcnPositionSnapshot,
  type FcnRiskLevel,
  type FcnUnderlyingSnapshot,
} from "@/src/types/fcn";
import {
  formatFcnDate,
  formatFcnPercent,
  getFcnPortfolioSnapshot,
  getFcnRiskLabel,
} from "@/src/lib/fcn/engine";
import type { MarketDataStatus } from "@/src/lib/market-data/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "FCN 監控 | IXAI Pro",
  description: "IXAI Pro FCN Monitoring Phase 1：worst-of、KI / KO distance 與 coupon schedule 風險觀察。",
};

const riskClasses: Record<FcnRiskLevel, string> = {
  breached: "border-[#8f3326]/24 bg-[#8f3326]/10 text-[#6b241b]",
  highRisk: "border-[#9f5530]/24 bg-[#9f5530]/10 text-[#6f351f]",
  safe: "border-emerald-900/12 bg-emerald-900/[0.06] text-emerald-950",
  unavailable: "border-[var(--ixai-border)] bg-white/45 text-[var(--ixai-ink-muted)]",
  watch: "border-[rgba(176,141,87,0.3)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-forest)]",
};

const quoteStatusLabels: Record<MarketDataStatus, string> = {
  delayed: "延遲",
  fallback: "Fallback",
  real: "真實",
  realtime: "即時",
  simulated: "模擬",
  unavailable: "資料不可用",
};

function formatUpdatedAt(value?: string) {
  if (!value) {
    return "更新時間不明";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "更新時間不明";
  }

  return date.toLocaleString("zh-TW", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  });
}

function riskDescription(level: FcnRiskLevel) {
  return {
    breached: "至少一個 worst-of 標的已觸及或低於 KI 區域，需以發行文件與交易對手資料確認條款狀態。",
    highRisk: "Worst-of 距離 KI 已低於 5%，此 FCN 應進入高頻監控。",
    safe: "目前 worst-of 與 KI 仍有緩衝，但仍需留意觀察日與市場波動。",
    unavailable: "目前缺少可用 quote，IXAI 不使用模擬價格推算 FCN 距離。",
    watch: "Worst-of 接近 KI 緩衝區，應持續追蹤價格與下一個觀察日。",
  }[level];
}

function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "risk" | "calm";
}) {
  const toneClass = {
    calm: "text-emerald-950",
    neutral: "text-[var(--ixai-forest)]",
    risk: "text-[#6b241b]",
  }[tone];

  return (
    <div className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--ixai-ink-muted)]">
        {label}
      </p>
      <p className={`mt-2 font-mono text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function RiskBadge({ level }: { level: FcnRiskLevel }) {
  return (
    <span className={`rounded-md border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${riskClasses[level]}`}>
      {getFcnRiskLabel(level)}
    </span>
  );
}

function UnderlyingRiskTable({ underlyings }: { underlyings: FcnUnderlyingSnapshot[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-ink-muted)]">
            <th className="border-b border-[var(--ixai-border)] px-3 py-3 font-medium">Symbol</th>
            <th className="border-b border-[var(--ixai-border)] px-3 py-3 font-medium">Initial</th>
            <th className="border-b border-[var(--ixai-border)] px-3 py-3 font-medium">Current</th>
            <th className="border-b border-[var(--ixai-border)] px-3 py-3 font-medium">Change</th>
            <th className="border-b border-[var(--ixai-border)] px-3 py-3 font-medium">KI Price</th>
            <th className="border-b border-[var(--ixai-border)] px-3 py-3 font-medium">KI Distance</th>
            <th className="border-b border-[var(--ixai-border)] px-3 py-3 font-medium">Quote</th>
          </tr>
        </thead>
        <tbody>
          {underlyings.map((underlying) => (
            <tr className="text-[var(--ixai-forest-soft)]" key={underlying.symbol}>
              <td className="border-b border-[var(--ixai-border)] px-3 py-3">
                <span className="font-mono font-semibold text-[var(--ixai-forest)]">
                  {underlying.symbol}
                </span>
                <span className="ml-2 text-xs text-[var(--ixai-ink-muted)]">
                  {underlying.name}
                </span>
              </td>
              <td className="border-b border-[var(--ixai-border)] px-3 py-3 font-mono">
                {underlying.initialPrice.toFixed(2)}
              </td>
              <td className="border-b border-[var(--ixai-border)] px-3 py-3 font-mono">
                {underlying.isQuoteUsable ? underlying.formattedCurrentPrice : "資料不可用"}
              </td>
              <td className="border-b border-[var(--ixai-border)] px-3 py-3 font-mono">
                {formatFcnPercent(underlying.priceChangePercent)}
              </td>
              <td className="border-b border-[var(--ixai-border)] px-3 py-3 font-mono">
                {underlying.knockInPrice.toFixed(2)}
              </td>
              <td className="border-b border-[var(--ixai-border)] px-3 py-3 font-mono">
                {formatFcnPercent(underlying.knockInDistancePercent)}
              </td>
              <td className="border-b border-[var(--ixai-border)] px-3 py-3">
                <span className="rounded-md border border-[var(--ixai-border)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
                  {quoteStatusLabels[underlying.quoteStatus]}
                </span>
                <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">
                  {underlying.quoteSourceLabel} · {formatUpdatedAt(underlying.updatedAt)}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FcnRiskCard({ snapshot }: { snapshot: FcnPositionSnapshot }) {
  const worstOf = snapshot.worstOf;

  return (
    <article className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.05)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            Structured Product
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            {snapshot.position.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-ink-muted)]">
            {snapshot.position.underlyings.map((item) => item.symbol).join(" / ")}
          </p>
        </div>
        <RiskBadge level={snapshot.riskLevel} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Worst-of"
          tone={snapshot.riskLevel === "highRisk" || snapshot.riskLevel === "breached" ? "risk" : "neutral"}
          value={worstOf ? `${worstOf.symbol} ${formatFcnPercent(worstOf.priceChangePercent)}` : "等待市場資料"}
        />
        <Metric
          label="KI Distance"
          tone={snapshot.riskLevel === "highRisk" || snapshot.riskLevel === "breached" ? "risk" : "neutral"}
          value={formatFcnPercent(worstOf?.knockInDistancePercent)}
        />
        <Metric
          label="KO Distance"
          value={formatFcnPercent(worstOf?.knockOutDistancePercent)}
        />
        <Metric label="Next Coupon" value={formatFcnDate(snapshot.nextCouponDate)} />
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/40 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        {riskDescription(snapshot.riskLevel)}
      </p>

      <div className="mt-5">
        <UnderlyingRiskTable underlyings={snapshot.underlyings} />
      </div>
    </article>
  );
}

export default async function FcnPage() {
  const snapshot = await getFcnPortfolioSnapshot();
  const weakest = snapshot.highestRiskPosition?.worstOf;
  const nextTimeline = snapshot.positions
    .map((item) => ({
      fcnName: item.position.name,
      observation: item.nextObservation,
      riskLevel: item.riskLevel,
    }))
    .filter((item) => item.observation);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          IXAI Pro · FCN Monitoring
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h1 className="max-w-3xl font-serif text-3xl font-semibold leading-snug sm:text-5xl">
              FCN 風險監控，從 worst-of 開始。
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
              Free 告訴你市場正在發生什麼；IXAI Pro 會開始追蹤你的結構型商品正在承受什麼風險。
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              Current Focus
            </p>
            <p className="mt-2 text-sm leading-7 text-white/70">
              {weakest
                ? `${snapshot.highestRiskPosition?.position.name} 目前由 ${weakest.symbol} 驅動主要風險，worst-of 表現 ${formatFcnPercent(weakest.priceChangePercent)}。`
                : "等待市場資料後，IXAI 會標示最高風險 FCN 與 weakest underlying。"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Monitored FCNs" value={`${snapshot.totalFcns}`} />
        <Metric label="High Risk / Breached" tone={snapshot.highRiskCount > 0 ? "risk" : "calm"} value={`${snapshot.highRiskCount}`} />
        <Metric label="KI Breached" tone={snapshot.breachedCount > 0 ? "risk" : "calm"} value={`${snapshot.breachedCount}`} />
        <Metric label="Next Coupon" value={formatFcnDate(snapshot.nextCouponDate)} />
      </section>

      <section className="grid gap-4">
        {snapshot.positions.map((positionSnapshot) => (
          <FcnRiskCard key={positionSnapshot.position.id} snapshot={positionSnapshot} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Coupon Timeline
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            接下來觀察與配息日期
          </h2>
          <div className="mt-5 grid gap-3">
            {nextTimeline.map((item) => (
              <div
                className="grid gap-3 rounded-lg border border-[var(--ixai-border)] bg-white/42 p-4 sm:grid-cols-[0.8fr_1fr_auto]"
                key={item.fcnName}
              >
                <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                  {item.fcnName}
                </p>
                <p className="text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {item.observation?.periodLabel} · Observation {formatFcnDate(item.observation?.observationEnd)}
                  {" "}· Payment {formatFcnDate(item.observation?.couponPaymentDate)}
                </p>
                <RiskBadge level={item.riskLevel} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Concentration Exposure
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            重複標的曝險
          </h2>
          <div className="mt-5 grid gap-3">
            {snapshot.concentration.map((item) => (
              <div
                className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-4"
                key={item.symbol}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                      {item.symbol}
                    </p>
                    <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">
                      {item.name}
                    </p>
                  </div>
                  <span className="rounded-md border border-[var(--ixai-border)] px-2.5 py-1 font-mono text-xs text-[var(--ixai-forest-soft)]">
                    {item.count} FCN
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-[var(--ixai-ink-muted)]">
                  {item.fcnNames.join(" / ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.82)] p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          IXAI Interpretation
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
          目前應優先觀察 worst-of 與下一個 coupon date。
        </h2>
        <p className="mt-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {weakest
            ? `${weakest.symbol} 是目前最弱標的，會直接影響 ${snapshot.highestRiskPosition?.position.name} 的 KI 緩衝。若市場資料變成不可用，IXAI 會停止推算距離，避免使用模擬價格產生錯誤風險感。`
            : "目前沒有足夠 market quote 形成 worst-of 判讀。IXAI 會等到 real / delayed quote 可用後再更新 FCN risk state。"}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium text-[var(--ixai-cream)]"
            href="/market"
          >
            查看市場總覽
          </Link>
          <Link
            className="rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
            href="/account"
          >
            前往我的 IXAI
          </Link>
        </div>
        <p className="mt-5 border-t border-[var(--ixai-border)] pt-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
          {FCN_MONITORING_DISCLAIMER}
        </p>
      </section>
    </div>
  );
}
