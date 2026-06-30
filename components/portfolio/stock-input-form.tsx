"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, PlusCircle } from "lucide-react";

import { InputReviewSummary } from "@/components/portfolio/input-review-summary";
import { useTranslation } from "@/src/lib/i18n/use-locale";
import { savePendingPortfolioInput } from "@/src/lib/portfolio/input/input-truth-bridge";
import { saveRecentPortfolioInput } from "@/src/lib/portfolio/input/recent-inputs";
import { saveStockPositionWithV13DatabaseWrite } from "@/src/lib/workspace/portfolio-database-write-activation";

const FIELD_INPUT_CLASS =
  "min-h-11 rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2.5 text-sm text-[var(--ixai-forest)] outline-none transition placeholder:text-[rgba(9,41,31,0.42)] focus:border-[var(--ixai-gold)]";
const LABEL_CLASS = "grid gap-2 text-sm font-medium text-[var(--ixai-forest)]";

const STOCK_MARKETS = ["US", "TW", "HK", "JP", "KR", "EU"] as const;
const STOCK_CURRENCIES = ["USD", "TWD", "HKD", "JPY", "KRW", "EUR"] as const;

type StockDraft = {
  assetName: string;
  costBasis: string;
  currency: (typeof STOCK_CURRENCIES)[number];
  market: (typeof STOCK_MARKETS)[number];
  quantity: string;
  ticker: string;
};

function parsePositiveNumber(value: string, label: string) {
  const parsed = Number(value.trim().replace(/,/g, ""));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} 必須大於 0。`);
  }

  return parsed;
}

function displayValue(value: string, fallback = "未填") {
  return value.trim() || fallback;
}

export function StockInputForm() {
  const { t } = useTranslation("portfolio");
  const [draft, setDraft] = useState<StockDraft>({
    assetName: "",
    costBasis: "",
    currency: "USD",
    market: "US",
    quantity: "",
    ticker: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normalizedTicker = draft.ticker.trim().toUpperCase();
  const preview = useMemo(
    () => ({
      cost: displayValue(draft.costBasis, "0"),
      currency: draft.currency,
      quantity: displayValue(draft.quantity, "0"),
      ticker: normalizedTicker || "未填",
    }),
    [draft.costBasis, draft.currency, draft.quantity, normalizedTicker],
  );

  function updateDraft(patch: Partial<StockDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!normalizedTicker) {
        throw new Error("請輸入 Ticker。");
      }

      const quantity = parsePositiveNumber(draft.quantity, t("quantity"));
      const costBasis = parsePositiveNumber(draft.costBasis, t("costBasis"));

      saveRecentPortfolioInput({
        category: "STOCK",
        details: [
          `Quantity ${draft.quantity.trim()}`,
          `Cost ${draft.costBasis.trim()} ${draft.currency}`,
          `Market ${draft.market}`,
        ],
        title: draft.assetName.trim()
          ? `${normalizedTicker} · ${draft.assetName.trim()}`
          : normalizedTicker,
      });
      savePendingPortfolioInput({
        category: "STOCK",
        details: [
          `Quantity ${draft.quantity.trim()}`,
          `Cost ${draft.costBasis.trim()} ${draft.currency}`,
          `Market ${draft.market}`,
        ],
        knownNotional: quantity * costBasis,
        symbols: [normalizedTicker],
        title: draft.assetName.trim()
          ? `${normalizedTicker} · ${draft.assetName.trim()}`
          : normalizedTicker,
      });
      const writeResult = await saveStockPositionWithV13DatabaseWrite({
        assetName: draft.assetName.trim(),
        costBasis,
        currency: draft.currency,
        market: draft.market,
        quantity,
        ticker: normalizedTicker,
      });
      const writeLabel =
        writeResult.target === "database"
          ? "資料庫已同步"
          : writeResult.status === "failed"
            ? "資料庫寫入未完成，已保留 local fallback"
            : "資料庫 guard 未啟用，已保留 local fallback";
      setSuccess(`已建立 Workspace pending 股票輸入：${normalizedTicker}（${writeLabel}）`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "請確認股票欄位。");
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          {t("stockInput")}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
          {t("buildStockPosition")}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {t("stockInputBody")}
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className={LABEL_CLASS} htmlFor="stock-ticker">
            {t("ticker")}
            <input
              autoComplete="off"
              className={FIELD_INPUT_CLASS}
              id="stock-ticker"
              maxLength={24}
              onChange={(event) => updateDraft({ ticker: event.target.value })}
              placeholder="例如：AAPL / 2330"
              required
              type="text"
              value={draft.ticker}
            />
          </label>
          <label className={LABEL_CLASS} htmlFor="stock-name">
            {t("assetNameOptional")}
            <input
              autoComplete="off"
              className={FIELD_INPUT_CLASS}
              id="stock-name"
              maxLength={120}
              onChange={(event) => updateDraft({ assetName: event.target.value })}
              placeholder="例如：Apple / 台積電"
              type="text"
              value={draft.assetName}
            />
          </label>
          <label className={LABEL_CLASS} htmlFor="stock-quantity">
            {t("quantity")}
            <input
              className={FIELD_INPUT_CLASS}
              id="stock-quantity"
              inputMode="decimal"
              onChange={(event) => updateDraft({ quantity: event.target.value })}
              placeholder="例如：100"
              required
              type="text"
              value={draft.quantity}
            />
          </label>
          <label className={LABEL_CLASS} htmlFor="stock-cost">
            {t("costBasis")}
            <input
              className={FIELD_INPUT_CLASS}
              id="stock-cost"
              inputMode="decimal"
              onChange={(event) => updateDraft({ costBasis: event.target.value })}
              placeholder="例如：18000"
              required
              type="text"
              value={draft.costBasis}
            />
          </label>
          <label className={LABEL_CLASS} htmlFor="stock-currency">
            {t("currency")}
            <select
              className={FIELD_INPUT_CLASS}
              id="stock-currency"
              onChange={(event) =>
                updateDraft({ currency: event.target.value as StockDraft["currency"] })
              }
              value={draft.currency}
            >
              {STOCK_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
          <label className={LABEL_CLASS} htmlFor="stock-market">
            {t("market")}
            <select
              className={FIELD_INPUT_CLASS}
              id="stock-market"
              onChange={(event) =>
                updateDraft({ market: event.target.value as StockDraft["market"] })
              }
              value={draft.market}
            >
              {STOCK_MARKETS.map((market) => (
                <option key={market} value={market}>
                  {market}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <InputReviewSummary
        assetType={t("stockEtf")}
        sections={[
          {
            items: [
              [t("ticker"), preview.ticker],
              [t("assetName"), displayValue(draft.assetName)],
              [t("market"), draft.market],
            ],
            title: t("keyFields"),
          },
          {
            items: [
              [t("quantity"), preview.quantity],
              [t("cost"), preview.cost],
              [t("currency"), preview.currency],
            ],
            title: t("positionPreview"),
          },
          {
            items: [
              [t("riskFields"), `${t("market")} / ${t("currency")}`],
              [t("dataSource"), t("dataSourceGuardFallback")],
            ],
            title: t("riskFields"),
          },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="min-h-6">
          {success ? (
            <p className="flex items-start gap-2 rounded-lg border border-[color-mix(in_srgb,var(--ixai-risk-clear)_36%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_9%,white)] p-3 text-sm leading-6 text-[var(--ixai-forest)]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color-mix(in_srgb,var(--ixai-risk-clear)_70%,var(--ixai-forest))]" aria-hidden="true" />
              {success}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-lg border border-[color-mix(in_srgb,var(--ixai-risk-elevated)_36%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-elevated)_9%,white)] p-3 text-sm leading-6 text-[var(--ixai-forest)]">
              {error}
            </p>
          ) : null}
        </div>
        <button
          className="ixai-cta-forest inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-5 py-2.5 text-sm font-semibold sm:w-fit"
          type="submit"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          {t("createStockInput")}
        </button>
      </div>
    </form>
  );
}
