import { CalendarDays, Sparkles } from "lucide-react";
import type {
  WeeklyNarrativeBundle,
  WeeklyUpcomingEvent,
} from "@/src/types/editorial";

type ImportantEvent = {
  key: string;
  title: string;
  category: string;
  importance?: number;
  whyItMatters: string;
  relatedAssets?: string[];
  date?: string;
};

// v1.39.3 Phase 1A — high-importance branch routes through
// --ixai-risk-critical instead of off-brand Tailwind red. Mid (>=6) and
// neutral branches were already token-based and stay unchanged.
function importanceTone(importance?: number): string {
  if (!importance) {
    return "border-[var(--ixai-border)] bg-white/55 text-[var(--ixai-forest-soft)]";
  }
  if (importance >= 9) {
    return "border-[color-mix(in_srgb,var(--ixai-risk-critical)_32%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_14%,white)] text-[color-mix(in_srgb,var(--ixai-risk-critical)_70%,var(--ixai-forest))]";
  }
  if (importance >= 6) {
    return "border-[rgba(176,141,87,0.36)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-forest)]";
  }
  return "border-[var(--ixai-border)] bg-white/55 text-[var(--ixai-forest-soft)]";
}

function selectFromUpcoming(events: WeeklyUpcomingEvent[]): ImportantEvent[] {
  return events.slice(0, 3).map((event) => ({
    key: `upcoming-${event.date}-${event.title}`,
    title: event.title,
    category: event.category.replace(/_/g, " "),
    whyItMatters: event.whyItMatters,
    relatedAssets: event.relatedAssets,
    date: event.date,
  }));
}

function selectFromImportance(
  ranking: WeeklyNarrativeBundle["importanceRanking"] | undefined,
): ImportantEvent[] {
  if (!ranking) {
    return [];
  }

  return ranking.slice(0, 5).map((entry) => ({
    key: `ranked-${entry.source}-${entry.title}`,
    title: entry.title,
    category: entry.category,
    importance: entry.importance,
    whyItMatters: entry.importanceReason,
  }));
}

const FALLBACK_EVENTS: ImportantEvent[] = [
  {
    key: "fallback-fed",
    title: "Fed 路徑與通膨數據（CPI / PCE / NFP）",
    category: "fed_rates",
    whyItMatters: "利率預期直接影響美元、殖利率與美股風險資產折現率。",
  },
  {
    key: "fallback-ai",
    title: "AI capex 持續性（NVDA / AVGO / Hyperscaler）",
    category: "us_earnings",
    whyItMatters: "AI 資本支出能否延續決定半導體與伺服器供應鏈的資金集中度。",
  },
  {
    key: "fallback-tw",
    title: "台股 AI 供應鏈節奏（TSMC / 廣達 / 緯創）",
    category: "taiwan_event",
    whyItMatters: "外資權重與法說展望是台股 AI 主軸的主要觀察窗口。",
  },
];

// v1.33.2 — Compact timeline style. Smaller importance badge, tighter
// chip spacing, single-column timeline track on mobile so 390px viewport
// reads as a calendar marker list rather than five tall cards.

export function ImportantEvents({
  narrative,
  upcomingEvents,
}: {
  narrative: WeeklyNarrativeBundle | null;
  upcomingEvents: WeeklyUpcomingEvent[];
}) {
  const fromUpcoming = selectFromUpcoming(upcomingEvents);
  const fromImportance = selectFromImportance(narrative?.importanceRanking);
  const combined: ImportantEvent[] = [...fromUpcoming, ...fromImportance].slice(0, 5);
  const events = combined.length > 0 ? combined : FALLBACK_EVENTS;
  const isFallback = combined.length === 0;

  return (
    <section className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Important Intelligence Events
        </p>
      </div>
      <h2 className="mt-3 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
        本期最值得關注的市場催化點與訊號。
      </h2>
      {isFallback ? (
        <p className="mt-2 text-xs leading-6 text-[var(--ixai-ink-muted)]">
          目前尚未產出新的 importance ranking；以下為 IXAI editorial 提供的觀察類別。下一次 Daily / Weekly 發布後會自動更新。
        </p>
      ) : null}

      <ol className="relative mt-4 grid gap-2.5 border-l border-[rgba(176,141,87,0.30)] pl-4 sm:gap-3 sm:pl-5">
        {events.map((event) => (
          <li
            className="relative rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2.5 sm:px-4 sm:py-3"
            key={event.key}
          >
            <span
              aria-hidden="true"
              className="absolute -left-[7px] top-3 inline-block h-2 w-2 rounded-full border border-[rgba(176,141,87,0.55)] bg-[var(--ixai-forest)] sm:-left-[9px]"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {event.date ? (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--ixai-forest-soft)]">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  {event.date}
                </span>
              ) : null}
              {typeof event.importance === "number" ? (
                <span
                  className={`inline-flex h-5 items-center rounded-md border px-1.5 font-mono text-[10px] font-semibold ${importanceTone(event.importance)}`}
                >
                  {event.importance}/10
                </span>
              ) : null}
              <span className="rounded-md border border-[var(--ixai-border)] bg-white/45 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
                {event.category}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-semibold leading-6 text-[var(--ixai-forest)]">
              {event.title}
            </p>
            <p className="mt-1 text-xs leading-6 text-[var(--ixai-forest-soft)] sm:text-sm sm:leading-7">
              {event.whyItMatters}
            </p>
            {event.relatedAssets && event.relatedAssets.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {event.relatedAssets.slice(0, 4).map((symbol) => (
                  <span
                    className="rounded-md border border-[var(--ixai-border)] bg-white/45 px-1.5 py-0.5 font-mono text-[10px] text-[var(--ixai-forest-soft)]"
                    key={`${event.key}-${symbol}`}
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
