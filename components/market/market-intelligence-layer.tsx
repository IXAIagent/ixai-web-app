"use client";

import { SectionCard, SectionHeader } from "@/components/dashboard/section-card";
import { useLiveResource } from "@/src/hooks/use-live-resource";
import type { MarketIntelligenceResponse } from "@/src/lib/market-data/intelligence";
import type { MarketDataStatus, MarketQuote } from "@/src/lib/market-data/types";
import type { NewsIntelligenceItem } from "@/src/lib/news/intelligence";
import { useCallback } from "react";

const statusLabels: Record<MarketDataStatus, string> = {
  real: "真實",
  realtime: "即時",
  delayed: "延遲",
  fallback: "參考",
  simulated: "參考",
  unavailable: "資料不可用",
};

const stateClasses: Record<string, string> = {
  calm: "border-emerald-700/15 bg-emerald-50/70 text-emerald-900",
  neutral: "border-[var(--ixai-border)] bg-white/55 text-[var(--ixai-forest-soft)]",
  watch: "border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.12)] text-[var(--ixai-forest)]",
  risk: "border-red-900/15 bg-red-50/75 text-red-900",
};

const impactLevelClasses: Record<string, string> = {
  HIGH: "border-red-900/20 bg-red-50/80 text-red-900",
  MEDIUM: "border-[rgba(176,141,87,0.36)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-forest)]",
  LOW: "border-[var(--ixai-border)] bg-white/55 text-[var(--ixai-forest-soft)]",
};

function formatUpdatedAt(updatedAt: string) {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "更新時間不明";
  }

  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function supplyBadge(quote: MarketQuote) {
  if (quote.status === "unavailable") {
    return "待更新";
  }

  if (quote.direction === "up") {
    return "資金偏強";
  }

  if (quote.direction === "down") {
    return "短線承壓";
  }

  return "中性觀察";
}

function SupplyChainCard({ quote }: { quote: MarketQuote }) {
  return (
    <div className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3.5 transition active:scale-[0.995] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--ixai-forest)]">{quote.name}</p>
          <p className="mt-1 font-mono text-xs text-[var(--ixai-ink-muted)]">{quote.symbol}</p>
        </div>
        <span className="rounded-md border border-[var(--ixai-border)] px-2 py-1 text-[11px] font-medium text-[var(--ixai-forest-soft)]">
          {supplyBadge(quote)}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-mono text-lg font-semibold text-[var(--ixai-forest)]">{quote.price}</p>
        <p className="font-mono text-sm font-medium text-[var(--ixai-forest-soft)]">{quote.dailyChange}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] leading-5 text-[var(--ixai-ink-muted)]">
        <span>{statusLabels[quote.status]}</span>
        <span>{quote.sourceLabel}</span>
        <span suppressHydrationWarning>更新 {formatUpdatedAt(quote.updatedAt)}</span>
      </div>
    </div>
  );
}

function IntelligenceSignalCard({ item }: { item: NewsIntelligenceItem }) {
  return (
    <article className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-[var(--ixai-forest-soft)]">
        <span className="rounded-md border border-[var(--ixai-border)] px-2 py-0.5">{item.category}</span>
        <span className={`rounded-md border px-2 py-0.5 ${impactLevelClasses[item.impactLevel]}`}>
          {item.impactLevel}
        </span>
        <span className="rounded-md border border-[rgba(176,141,87,0.34)] px-2 py-0.5 text-[var(--ixai-gold)]">
          {item.riskTag}
        </span>
        <span className="rounded-md border border-[var(--ixai-border)] px-2 py-0.5 font-mono">
          {item.marketImpact}
        </span>
        <span>{item.sourceLabel}</span>
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-6 text-[var(--ixai-forest)]">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.shortInterpretation}</p>
      <p className="mt-2 border-t border-[var(--ixai-border)] pt-2 text-xs leading-6 text-[var(--ixai-ink-muted)]">
        Why it matters：{item.whyItMatters}
      </p>
    </article>
  );
}

function IntelligenceSection({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: NewsIntelligenceItem[];
  emptyText: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.55)]">
      <div className="border-b border-[var(--ixai-border)] px-3.5 py-3 sm:px-4">
        <h3 className="text-sm font-semibold text-[var(--ixai-forest)]">{title}</h3>
      </div>
      <div className="grid gap-2.5 p-3.5 sm:gap-3 sm:p-4">
        {items.length > 0 ? (
          items.map((item) => <IntelligenceSignalCard item={item} key={item.id} />)
        ) : (
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-4 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            {emptyText}
          </p>
        )}
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-4 text-sm leading-7 text-[var(--ixai-ink-muted)]">
      正在整理市場情報...
    </div>
  );
}

export function MarketIntelligenceLayer() {
  const fetchMarketIntelligence = useCallback(async (signal: AbortSignal) => {
    const response = await fetch("/api/market/intelligence", {
      cache: "no-store",
      signal,
    });

    if (!response.ok) {
      throw new Error("Market intelligence refresh failed");
    }

    return (await response.json()) as MarketIntelligenceResponse;
  }, []);
  const getIntelligenceUpdatedAt = useCallback((payload: MarketIntelligenceResponse) => payload.generatedAt, []);
  const {
    data,
    errorMessage,
    isLoading,
    isRefreshing,
    lastUpdatedAt,
  } = useLiveResource({
    fetcher: fetchMarketIntelligence,
    getUpdatedAt: getIntelligenceUpdatedAt,
    refreshIntervalMs: 180_000,
  });

  if (isLoading || !data) {
    return (
      <SectionCard>
        <SectionHeader action="Loading" eyebrow="Market Intelligence" title="市場情報整理中" />
        <div className="grid gap-3 p-3.5 sm:grid-cols-2 sm:p-4">
          <LoadingCard />
          <LoadingCard />
        </div>
      </SectionCard>
    );
  }

  const freshnessLabel = errorMessage
    ? "更新失敗，稍後自動重試"
    : `${lastUpdatedAt ? `更新於 ${formatUpdatedAt(lastUpdatedAt)}` : "資料更新中"}｜${
        isRefreshing ? "背景更新中" : "每 3 分鐘自動更新"
      }｜資料可能延遲`;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 px-3.5 py-2.5 text-xs leading-5 text-[var(--ixai-ink-muted)] sm:px-4">
        {freshnessLabel}
      </div>
      <SectionCard>
        <SectionHeader action="Sentiment" eyebrow="市場情緒" title="波動、利率與美元壓力" />
        <div className="grid gap-2.5 p-3.5 sm:grid-cols-2 sm:gap-3 sm:p-4 xl:grid-cols-4">
          {data.sentimentCards.map((card) => (
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3.5 sm:p-4" key={card.symbol}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">{card.symbol}</p>
                  <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">{card.name}</p>
                </div>
                <span className="rounded-md border border-[var(--ixai-border)] px-2 py-1 text-[11px] font-medium text-[var(--ixai-forest-soft)]">
                  {card.state}
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="font-mono text-xl font-semibold text-[var(--ixai-forest)]">{card.price}</p>
                <p className="font-mono text-sm font-medium text-[var(--ixai-forest-soft)]">{card.dailyChange}</p>
              </div>
              <p className="mt-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">{card.commentary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] leading-5 text-[var(--ixai-ink-muted)]">
                <span>{statusLabels[card.status]}</span>
                <span>{card.sourceLabel}</span>
                <span suppressHydrationWarning>更新 {formatUpdatedAt(card.updatedAt)}</span>
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-dashed border-[rgba(176,141,87,0.42)] bg-[rgba(255,250,240,0.62)] p-3.5 sm:p-4">
            <p className="font-mono text-sm font-semibold text-[var(--ixai-forest)]">Fear & Greed</p>
            <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">CNN Fear & Greed</p>
            <p className="mt-3 text-sm font-semibold text-[var(--ixai-forest)]">{data.fearGreed.state}</p>
            <p className="mt-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">{data.fearGreed.commentary}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader action="Rule-based" eyebrow="AI 市場判讀" title="Market Intelligence Summary" />
        <div className="grid gap-2.5 p-3.5 sm:grid-cols-2 sm:gap-3 sm:p-4">
          {data.summary.map((item) => (
            <article className={`rounded-lg border p-3.5 sm:p-4 ${stateClasses[item.state]}`} key={item.label}>
              <p className="font-mono text-xs font-semibold uppercase">{item.label}</p>
              <p className="mt-2 text-sm leading-6">{item.text}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader action="Risk Radar" eyebrow="風險雷達" title="Rule-based market alerts" />
        <div className="grid gap-2.5 p-3.5 sm:grid-cols-2 sm:gap-3 sm:p-4">
          {data.riskRadar.map((alert) => (
            <article className={`rounded-lg border p-3.5 sm:p-4 ${impactLevelClasses[alert.level]}`} key={alert.id}>
              <p className="font-mono text-xs font-semibold uppercase">{alert.level}</p>
              <h3 className="mt-2 text-sm font-semibold leading-6">{alert.title}</h3>
              <p className="mt-2 text-sm leading-6">{alert.detail}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader action="Taiwan AI" eyebrow="台股 AI Supply Chain" title="AI Supply Chain Watch" />
        <div className="grid gap-2.5 p-3.5 sm:grid-cols-2 sm:gap-3 sm:p-4 xl:grid-cols-3">
          {data.aiSupplyChain.map((quote) => (
            <SupplyChainCard key={quote.symbol} quote={quote} />
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader action="News Intelligence" eyebrow="新聞情報層" title="Market Signals" />
        <div className="grid gap-3 p-3.5 sm:p-4 xl:grid-cols-2">
          <IntelligenceSection
            emptyText="目前沒有足夠的高權重市場訊號；IXAI 會等待更清楚的新聞與價格交叉確認。"
            items={data.topIntelligence}
            title="Top Intelligence"
          />
          <IntelligenceSection
            emptyText={
              data.taiwanNewsStatus === "unavailable"
                ? "台灣新聞來源暫時無法連線；IXAI 不會將空白資料解讀為沒有訊號。"
                : "目前未偵測到明確的台灣 AI 供應鏈新聞訊號。"
            }
            items={data.taiwanAiFocus}
            title="Taiwan AI Focus"
          />
          <IntelligenceSection
            emptyText="目前 Crypto 新聞訊號不足；以 BTC 價格與美元流動性為主要觀察。"
            items={data.cryptoIntelligence}
            title="Crypto Intelligence"
          />
        </div>
        <p className="border-t border-[var(--ixai-border)] px-4 py-3.5 text-xs leading-6 text-[var(--ixai-ink-muted)] sm:px-5 sm:py-4">
          本區塊使用公開新聞標題與摘要做風險脈絡整理，不重製新聞全文；內容僅供市場資訊與風險觀察參考。
        </p>
      </SectionCard>
    </div>
  );
}
