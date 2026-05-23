import { EcosystemBridge } from "@/components/layout/ecosystem-bridge";
import { ProInterestCard } from "@/components/pro/pro-interest-card";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  CalendarCheck,
  Coins,
  Compass,
  Layers,
  LineChart,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { getPrimaryContactLinks } from "@/src/lib/brand/contact";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
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
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";
import type { MarketDataStatus } from "@/src/lib/market-data/types";

export const dynamic = "force-dynamic";

export const metadata = buildPublicMetadata({
  title: "IXAI FCN Education Hub — 從理解 FCN 開始",
  description:
    "IXAI FCN Education Hub：用教育、視覺化與 FAQ，建立 coupon、worst-of、KI / KO 與波動率的正確認識。完整風控保留在 IXAI Pro。",
});

const riskClasses: Record<FcnRiskLevel, string> = {
  breached: "border-[#8f3326]/24 bg-[#8f3326]/10 text-[#6b241b]",
  highRisk: "border-[#9f5530]/24 bg-[#9f5530]/10 text-[#6f351f]",
  safe: "border-emerald-900/12 bg-emerald-900/[0.06] text-emerald-950",
  unavailable: "border-[var(--ixai-border)] bg-white/45 text-[var(--ixai-ink-muted)]",
  watch: "border-[rgba(176,141,87,0.3)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-forest)]",
};

const quoteStatusLabels: Record<MarketDataStatus, string> = {
  delayed: "延遲",
  fallback: "參考",
  real: "真實",
  realtime: "即時",
  simulated: "參考",
  unavailable: "資料不可用",
};

type EducationCard = {
  icon: typeof BookOpen;
  eyebrow: string;
  title: string;
  body: string;
  whyItMatters: string;
};

const educationCards: EducationCard[] = [
  {
    icon: Coins,
    eyebrow: "Coupon",
    title: "Coupon 是什麼？",
    body: "依條款規定的配息頻率支付的固定報酬。Coupon 是 FCN 最常被行銷的亮點，但配息與本金保證是兩件事。",
    whyItMatters: "Coupon 拿得到不代表本金安全；真正影響本金的是觀察期內 worst-of 是否觸碰 KI。",
  },
  {
    icon: TrendingDown,
    eyebrow: "Worst-of",
    title: "Worst-of 是什麼？",
    body: "多標的 FCN 由「表現最弱」的那一檔決定主要風險。每天的價格觀察都重新檢視誰是 worst-of。",
    whyItMatters: "Coupon 看起來再高，最後的還本結構幾乎完全由 worst-of 決定，這是 FCN 最被忽略的細節。",
  },
  {
    icon: Layers,
    eyebrow: "KO / KI",
    title: "KO 與 KI 是兩個障礙",
    body: "KO（Knock-Out）達成時，FCN 提前出場；KI（Knock-In）觸碰時，最終還本可能轉為股票交割或本金損失。",
    whyItMatters: "KO 是「好事的觸發」、KI 是「風險的觸發」。理解這兩個障礙，就理解 FCN 的兩面性。",
  },
  {
    icon: AlertTriangle,
    eyebrow: "FCN ≠ 高利定存",
    title: "為什麼 FCN 不等於高利定存",
    body: "定存的本金與利息都受保障；FCN 的高 coupon 是換取「願意承擔下檔風險」的對價。",
    whyItMatters: "若把 FCN 當作存款，KI 觸發那一刻會以為「銀行欺騙」，但這其實是條款一開始就寫好的風險。",
  },
  {
    icon: LineChart,
    eyebrow: "Volatility",
    title: "波動率為什麼重要",
    body: "Coupon 的高低，本質上是由標的波動率定價。波動越高 → 越容易觸 KI → 為了吸引投資人 coupon 越高。",
    whyItMatters: "看到「高 coupon」的第一直覺應該是：這籃子標的是不是特別波動？波動換 coupon 是 FCN 的核心數學。",
  },
  {
    icon: Boxes,
    eyebrow: "AI Tech Basket",
    title: "為什麼 AI 科技股常被放進 FCN",
    body: "高波動 + 高市場熱度 + 高個股關聯 = 適合 FCN 結構發行的素材。NVDA、TSM、AMD 等 AI 主線是熱門 underlying。",
    whyItMatters: "同一籃 AI 科技股若同步回檔，worst-of 與集中度風險會同時放大；這也是為什麼 FCN 容易在 regime 轉變時集中受傷。",
  },
];

type FaqItem = {
  question: string;
  answer: string;
};

const faqItems: FaqItem[] = [
  {
    question: "FCN 保本嗎？",
    answer:
      "原則上不保本。FCN 屬於結構型商品，最終還本是否完整，取決於觀察期內 worst-of 是否觸碰 KI 與條款細節。發行文件才是最終依據。",
  },
  {
    question: "高 coupon 為什麼代表高風險？",
    answer:
      "Coupon 的定價來自標的波動率與下檔風險。市場願意給的高配息，通常是因為這籃子標的下檔機率更高 — 高 coupon 是補償你承擔的風險。",
  },
  {
    question: "為什麼 worst-of 比平均值重要？",
    answer:
      "FCN 的最終情境由「最弱的那一檔」決定，不是平均。即使其他標的都表現亮眼，一檔跌破 KI 就可能改變整個 FCN 的還本結果。",
  },
  {
    question: "KI 發生會怎樣？",
    answer:
      "KI 觸碰後，到期還本方式可能轉為以 worst-of 標的進行股票交割，或依條款公式承擔本金損失。具體結果仍以發行文件為準。",
  },
  {
    question: "FCN 適合誰？",
    answer:
      "FCN 適合理解結構型商品條款、能承擔下檔風險、並把它視為投資組合一部分（而非定存替代品）的投資者。IXAI 不提供交易建議。",
  },
  {
    question: "IXAI Pro 未來會做什麼？",
    answer:
      "IXAI Pro 將提供個人化 FCN 風險監控、worst-of 與 KI 距離追蹤、波動率觀察與 AI portfolio intelligence。目前尚未開放，可登記優先通知。",
  },
];

type ProPreviewItem = {
  icon: typeof ShieldCheck;
  title: string;
  copy: string;
};

const proPreviewItems: ProPreviewItem[] = [
  {
    icon: ShieldCheck,
    title: "FCN Risk Monitoring",
    copy: "把你的每一檔 FCN 條款、worst-of 與觀察日納入一個風險視角，而不是逐張對 PDF。",
  },
  {
    icon: AlertTriangle,
    title: "Worst-of Alert",
    copy: "當任何 underlying 接近 KI 緩衝區，提前在你關注的閾值上提醒。",
  },
  {
    icon: Compass,
    title: "KI Distance Tracking",
    copy: "持續追蹤每一檔標的距離 KI 的緩衝百分比，並與市場波動率交叉觀察。",
  },
  {
    icon: LineChart,
    title: "Volatility Observation",
    copy: "把標的隱含與實現波動率，放回 coupon 與下檔風險的解讀脈絡。",
  },
  {
    icon: Sparkles,
    title: "AI Portfolio Intelligence",
    copy: "把 FCN、股票、ETF、Crypto 與總經 regime 整合在同一個個人風險語境。",
  },
];

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
    unavailable: "目前缺少可用 quote，IXAI 不使用非市場資料推算 FCN 距離。",
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
    <div className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3.5 sm:p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--ixai-ink-muted)]">
        {label}
      </p>
      <p className={`mt-1.5 font-mono text-lg font-semibold sm:mt-2 sm:text-xl ${toneClass}`}>{value}</p>
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

function UnderlyingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--ixai-border)] py-2 last:border-b-0">
      <span className="text-[11px] uppercase tracking-[0.14em] text-[var(--ixai-ink-muted)]">
        {label}
      </span>
      <span className="font-mono text-sm font-medium text-[var(--ixai-forest)]">{value}</span>
    </div>
  );
}

function UnderlyingRiskTable({ underlyings }: { underlyings: FcnUnderlyingSnapshot[] }) {
  return (
    <div className="w-full">
      {/* Mobile: stacked cards so iPhone widths don't force horizontal scroll. */}
      <div className="grid gap-3 md:hidden">
        {underlyings.map((underlying) => (
          <div
            className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3.5"
            key={underlying.symbol}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">
                  {underlying.symbol}
                </p>
                <p className="mt-1 truncate text-xs text-[var(--ixai-ink-muted)]">
                  {underlying.name}
                </p>
              </div>
              <span className="shrink-0 rounded-md border border-[var(--ixai-border)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
                {quoteStatusLabels[underlying.quoteStatus]}
              </span>
            </div>
            <div className="mt-3">
              <UnderlyingRow label="Initial" value={underlying.initialPrice.toFixed(2)} />
              <UnderlyingRow
                label="Current"
                value={underlying.isQuoteUsable ? underlying.formattedCurrentPrice : "資料不可用"}
              />
              <UnderlyingRow
                label="Change"
                value={formatFcnPercent(underlying.priceChangePercent)}
              />
              <UnderlyingRow label="KI Price" value={underlying.knockInPrice.toFixed(2)} />
              <UnderlyingRow
                label="KI Distance"
                value={formatFcnPercent(underlying.knockInDistancePercent)}
              />
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[var(--ixai-ink-muted)]">
              {underlying.quoteSourceLabel} · {formatUpdatedAt(underlying.updatedAt)}
            </p>
          </div>
        ))}
      </div>

      {/* Tablet / desktop: full table with horizontal scroll fallback. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
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
    </div>
  );
}

function FcnRiskCard({ snapshot }: { snapshot: FcnPositionSnapshot }) {
  const worstOf = snapshot.worstOf;

  return (
    <article className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-5 sm:shadow-[0_18px_48px_rgba(9,41,31,0.05)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            Education Example
          </p>
          <h3 className="mt-1.5 text-lg font-semibold leading-6 text-[var(--ixai-forest)] sm:mt-2 sm:text-xl">
            {snapshot.position.name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-ink-muted)]">
            {snapshot.position.underlyings.map((item) => item.symbol).join(" / ")}
          </p>
        </div>
        <RiskBadge level={snapshot.riskLevel} />
      </div>

      <div className="mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
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

      <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/40 p-3.5 text-sm leading-6 text-[var(--ixai-forest-soft)] sm:mt-5 sm:p-4 sm:leading-7">
        {riskDescription(snapshot.riskLevel)}
      </p>

      <div className="mt-4 sm:mt-5">
        <UnderlyingRiskTable underlyings={snapshot.underlyings} />
      </div>
    </article>
  );
}

function EducationCardItem({ card }: { card: EducationCard }) {
  const Icon = card.icon;

  return (
    <article className="flex h-full flex-col rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_12px_30px_rgba(9,41,31,0.04)] sm:p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          {card.eyebrow}
        </p>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
        {card.title}
      </h3>
      <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">{card.body}</p>
      <p className="mt-3 border-t border-[var(--ixai-border)] pt-3 text-sm leading-6 text-[var(--ixai-ink-muted)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
          Why it matters
        </span>
        <span className="mt-1.5 block">{card.whyItMatters}</span>
      </p>
    </article>
  );
}

function FlowNode({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-1 flex-col rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3.5 sm:p-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
        {step}
      </span>
      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--ixai-forest)]">{title}</p>
      <p className="mt-2 text-xs leading-6 text-[var(--ixai-ink-muted)] sm:text-sm sm:leading-6">
        {body}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center text-[var(--ixai-gold)]"
    >
      <ArrowDown className="h-4 w-4 md:hidden" />
      <ArrowRight className="hidden h-4 w-4 md:block" />
    </div>
  );
}

function VolatilityTriangleStep({
  label,
  body,
  tone,
}: {
  label: string;
  body: string;
  tone: "input" | "trade" | "risk";
}) {
  const toneClass = {
    input: "border-[var(--ixai-border)] bg-white/55 text-[var(--ixai-forest)]",
    trade: "border-[rgba(176,141,87,0.42)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-forest)]",
    risk: "border-[#9f5530]/26 bg-[#9f5530]/[0.08] text-[#6b241b]",
  }[tone];

  return (
    <div className={`rounded-lg border p-3.5 sm:p-4 ${toneClass}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6">{body}</p>
    </div>
  );
}

export default async function FcnPage() {
  const contactLinks = getPrimaryContactLinks();
  const lineUrl = contactLinks.line?.value ?? ixaiEcosystem.contactUrl;
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-7 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      {/* 1. FCN Education Hero — narrative-first, two CTAs to learn or preview Pro. */}
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          FCN Education Hub
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-end">
          <div>
            <h1 className="max-w-3xl font-serif text-2xl font-semibold leading-8 sm:text-5xl sm:leading-snug">
              FCN 不只是 Coupon。真正重要的是 worst-of、KI、波動率與風險管理。
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72 sm:mt-4 sm:text-base sm:leading-8">
              這裡是 IXAI 的 FCN 教育入口。一玄相信，亞洲投資者長期被「高配息」三個字主導 FCN 的認知。
              在開始談監控之前，先把 coupon、worst-of、KI / KO 與波動率的關係，講清楚。
            </p>
            <p className="mt-3 text-xs leading-6 text-white/55 sm:mt-4 sm:text-sm">
              IXAI Pro 將提供真正的個人化 FCN 風險監控；Public App 只負責教育、理解與信任建立。
            </p>
            <div className="mt-5 grid grid-cols-1 gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
              <a
                className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
                href="#learn-fcn"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Learn FCN
              </a>
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/30 px-4 py-2.5 text-sm font-medium text-[var(--ixai-cream)]"
                href="#pro-preview"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                IXAI Pro Preview
              </a>
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3.5 sm:p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              一玄 FCN Philosophy
            </p>
            <p className="mt-2 text-sm leading-7 text-white/72 sm:leading-7">
              「Coupon 是價格，不是價值。
              真正決定 FCN 結局的是 worst-of、KI 與波動率，而不是配息表上的數字。」
            </p>
            <p className="mt-3 text-xs leading-6 text-white/45">
              — IXAI 一玄 FCN 風險觀點
            </p>
          </div>
        </div>
      </section>

      <EcosystemBridge />

      {/* 2. FCN Education Cards — six fundamentals in plain language. */}
      <section
        className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.62)] p-4 sm:p-6"
        id="learn-fcn"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Learn FCN
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          從 0 開始理解 FCN — 不再只看 Coupon。
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)] sm:mt-3 sm:leading-8">
          這六張卡片涵蓋 FCN 投資者最常忽略的核心觀念。先建立認知，再談監控與風險管理。
        </p>
        <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {educationCards.map((card) => (
            <EducationCardItem card={card} key={card.eyebrow} />
          ))}
        </div>
      </section>

      {/* 3. Risk Concept Visualization — conceptual, no real engine. */}
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-4 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Risk Concept
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          當 FCN 觀察期內發生壞情境，是怎麼一步一步走到結局的？
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)] sm:mt-3 sm:leading-8">
          以下是 FCN 風險路徑的概念圖 — 不是任何個人 FCN 的風控引擎，只是讓你「看見」結構型商品的流程。
        </p>

        <div className="mt-5 grid gap-2.5 sm:mt-6 sm:gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-stretch">
          <FlowNode
            body="Issuer 把 3 至 5 檔股票放進同一張 FCN 條款，例如 NVDA / TSM / AMD。"
            step="01 · Underlying Basket"
            title="一籃子標的"
          />
          <FlowArrow />
          <FlowNode
            body="每個觀察日，重新檢查誰是表現最弱的那一檔。Worst-of 不是固定的。"
            step="02 · Worst-of"
            title="表現最弱者主導"
          />
          <FlowArrow />
          <FlowNode
            body="若 worst-of 跌破 KI 價格水準，FCN 從「正常配息」狀態轉為「下檔風險已啟動」。"
            step="03 · KI Triggered"
            title="KI 障礙觸碰"
          />
          <FlowArrow />
          <FlowNode
            body="到期還本可能以 worst-of 標的股票交割，或承擔本金損失；最終結果以發行文件為準。"
            step="04 · Settlement"
            title="可能股票交割"
          />
        </div>

        <div className="mt-6 grid gap-3 sm:mt-7 sm:gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
          <VolatilityTriangleStep
            body="標的波動率越高，發生 worst-of 跌破 KI 的可能性越大。"
            label="輸入"
            tone="input"
          />
          <FlowArrow />
          <VolatilityTriangleStep
            body="為了讓投資人願意承擔下檔風險，issuer 會用更高的 coupon 作為定價補償。"
            label="定價"
            tone="trade"
          />
          <FlowArrow />
          <VolatilityTriangleStep
            body="高 coupon 換來的，是更高的下檔風險、更敏感的 KI 觸碰機率與更需要監控的觀察期。"
            label="代價"
            tone="risk"
          />
        </div>

        <p className="mt-5 border-t border-[var(--ixai-border)] pt-3 text-xs leading-6 text-[var(--ixai-ink-muted)] sm:mt-6 sm:pt-4">
          視覺化為教育用途；任何 FCN 的實際條款、KI / KO 水準與還本方式，仍以發行文件與條款書為準。
        </p>
      </section>

      {/* 4. Read-only education example — same demo as before, reframed as教學示例 only. */}
      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.82)] p-4 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Education Example
        </p>
        <h2 className="mt-2 text-lg font-semibold leading-6 text-[var(--ixai-forest)] sm:text-xl">
          範例：一個 FCN 組合，在 worst-of 觀點下會怎麼呈現？
        </h2>
        <p className="mt-2.5 text-sm leading-7 text-[var(--ixai-ink-muted)] sm:mt-3">
          這不是你的持倉，也不是即時風控系統，而是用範例 FCN 組合說明 worst-of、KI distance 與 coupon
          schedule 如何被同一個風險視角呈現。完整個人化監控保留在 IXAI Pro。
        </p>
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
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-4 sm:p-5">
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

        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-4 sm:p-5">
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

      {/* 5. FAQ — plain language, no salesy guarantees. */}
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-4 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          FAQ
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          常被問到的 FCN 問題
        </h2>
        <div className="mt-5 grid gap-2.5 sm:mt-6 sm:gap-3 md:grid-cols-2">
          {faqItems.map((item) => (
            <details
              className="group rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4 transition open:bg-white/65 sm:p-5"
              key={item.question}
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold leading-6 text-[var(--ixai-forest)] sm:text-base">
                <span>{item.question}</span>
                <span className="font-mono text-xs text-[var(--ixai-gold)] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:leading-8">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
        <p className="mt-5 border-t border-[var(--ixai-border)] pt-3 text-xs leading-6 text-[var(--ixai-ink-muted)] sm:mt-6 sm:pt-4">
          FAQ 內容為教育用途，不構成投資建議；任何 FCN 的最終條款仍以發行文件為準。
        </p>
      </section>

      {/* 6. IXAI Pro Soft Conversion — preview cards, roadmap narrative, ProInterestCard. */}
      <section
        className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6"
        id="pro-preview"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          IXAI Pro Preview
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          未來 IXAI Pro 將把 FCN 風控帶進個人化監控。
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)] sm:mt-3 sm:leading-8">
          Public App 負責教育與認知；IXAI Pro 才是真正的 FCN intelligence —— 你的 FCN、你的 worst-of、
          你的 KI distance、你的 portfolio risk regime。以下是 Pro 將提供的核心能力預覽。
        </p>

        <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {proPreviewItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                className="flex h-full flex-col rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 sm:p-5"
                key={item.title}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                    Pro Preview
                  </p>
                </div>
                <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">{item.copy}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:mt-7 lg:grid-cols-[1.05fr_0.95fr]">
          <ProInterestCard />
          <div className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 sm:p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              一玄諮詢
            </p>
            <h3 className="mt-2 text-lg font-semibold leading-6 text-[var(--ixai-forest)]">
              想了解你的 FCN，從條款與風險開始。
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
              IXAI Pro 尚未開放；若你想提前討論 FCN 風險、worst-of 與條款結構，可透過 LINE 預約一玄顧問。
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <a
                className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium"
                href={lineUrl}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                加入 LINE 諮詢
              </a>
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
                href={lineUrl}
                rel="noreferrer"
                target="_blank"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                預約一玄顧問
              </a>
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
                href={ixaiEcosystem.proDashboardUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {ixaiEcosystem.cta.enterPro}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 border-t border-[var(--ixai-border)] pt-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
          {weakest
            ? `${weakest.symbol} 是範例組合中目前最弱的標的；IXAI Public App 不對個人持倉做 KI 判讀，所有風險推算保留在 IXAI Pro。`
            : "目前範例組合沒有足夠 market quote 形成 worst-of 判讀；IXAI Public App 不會用非市場資料製造錯誤風險感。"}
        </p>
        <p className="mt-3 text-xs leading-6 text-[var(--ixai-ink-muted)]">{FCN_MONITORING_DISCLAIMER}</p>
      </section>
    </div>
  );
}
