"use client";

import { useEffect, useState } from "react";

import { Eyebrow } from "@/components/ui/eyebrow";
import { marketPulseItems, type PulseSentiment } from "@/src/lib/daily-intelligence";
import type { MarketDirection, MarketQuote, MarketQuotesResponse } from "@/src/lib/market-data/types";

const directionLabels: Record<MarketDirection, string> = {
  up: "上行",
  down: "下行",
  flat: "持平",
};

const directionStyles: Record<MarketDirection, string> = {
  up: "text-emerald-200",
  down: "text-red-200",
  flat: "text-[rgba(245,240,230,0.60)]",
};

const feelingStyles: Record<PulseSentiment, string> = {
  "risk-on": "border-emerald-300/22 bg-emerald-300/10 text-emerald-100",
  "risk-off": "border-red-300/22 bg-red-300/10 text-red-100",
  neutral: "border-white/12 bg-white/[0.045] text-[rgba(245,240,230,0.62)]",
};

const feelingLabels: Record<PulseSentiment, string> = {
  "risk-on": "Risk-on",
  "risk-off": "Risk-off",
  neutral: "Neutral",
};

function quoteMap(quotes: MarketQuote[]) {
  return Object.fromEntries(quotes.map((quote) => [quote.symbol, quote]));
}

export function MarketPulse() {
  const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});

  useEffect(() => {
    let isMounted = true;
    const symbols = marketPulseItems.map((item) => item.symbol).join(",");

    async function loadQuotes() {
      try {
        const response = await fetch(`/api/market/quotes?symbols=${symbols}`);
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as MarketQuotesResponse;
        if (isMounted) {
          setQuotes(quoteMap(data.quotes));
        }
      } catch {
        if (isMounted) {
          setQuotes({});
        }
      }
    }

    loadQuotes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_16px_48px_rgba(9,41,31,0.15)] sm:shadow-[0_18px_60px_rgba(9,41,31,0.16)]">
      <div className="border-b border-white/10 px-3.5 py-3 sm:px-5 sm:py-4 lg:px-6">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between md:gap-3">
          <div>
            <Eyebrow density="extra-wide">Market Pulse</Eyebrow>
            <h1 className="mt-1.5 text-xl font-semibold leading-7 sm:mt-2 sm:text-3xl sm:leading-tight">
              今日市場脈搏
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.12em]">
            <span className="rounded-md border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[rgba(245,240,230,0.58)]">
              Asia Session
            </span>
            <span className="rounded-md border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[rgba(245,240,230,0.58)]">
              US Futures
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-3">
        {marketPulseItems.map((item) => {
          const quote = quotes[item.symbol];
          const direction = quote?.direction ?? item.direction;

          return (
            <article className="bg-[var(--ixai-forest)] p-3.5 sm:p-5" key={item.symbol}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-lg font-semibold text-[var(--ixai-cream)]">
                      {item.symbol}
                    </p>
                    <span className="rounded-md border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[rgba(245,240,230,0.46)]">
                      {item.session}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[rgba(245,240,230,0.42)]">{item.label}</p>
                </div>
                <span
                  className={`rounded-md border px-2 py-1 text-[11px] font-medium ${feelingStyles[item.feeling]}`}
                >
                  {feelingLabels[item.feeling]}
                </span>
              </div>

              <div className="mt-3 flex items-end justify-between gap-3 sm:mt-4">
                <p className="font-mono text-xl font-semibold text-[var(--ixai-cream)]">
                  {quote?.price ?? "--"}
                </p>
                <div className="text-right">
                  <p className={`font-mono text-sm font-semibold ${directionStyles[direction]}`}>
                    {quote?.dailyChange ?? "--"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[rgba(245,240,230,0.42)]">
                    {directionLabels[direction]}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-[rgba(245,240,230,0.68)] sm:mt-4 sm:min-h-12">
                {item.note}
              </p>
              <Eyebrow mono density="regular" className="mt-3">
                {quote?.updatedAt ? "Updated now" : item.updatedLabel}
              </Eyebrow>
            </article>
          );
        })}
      </div>
    </section>
  );
}
