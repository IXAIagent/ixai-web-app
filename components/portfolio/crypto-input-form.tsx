"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, PlusCircle } from "lucide-react";

import { InputReviewSummary } from "@/components/portfolio/input-review-summary";
import { useTranslation } from "@/src/lib/i18n/use-locale";
import { savePendingPortfolioInput } from "@/src/lib/portfolio/input/input-truth-bridge";
import { saveRecentPortfolioInput } from "@/src/lib/portfolio/input/recent-inputs";
import { saveCryptoPositionWithV13DatabaseWrite } from "@/src/lib/workspace/portfolio-database-write-activation";

const FIELD_INPUT_CLASS =
  "min-h-11 rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2.5 text-sm text-[var(--ixai-forest)] outline-none transition placeholder:text-[rgba(9,41,31,0.42)] focus:border-[var(--ixai-gold)]";
const LABEL_CLASS = "grid gap-2 text-sm font-medium text-[var(--ixai-forest)]";

const CRYPTO_ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "USDT", "USDC", "Other"] as const;
const CRYPTO_SOURCES = ["Binance", "Bybit", "OKX", "Wallet", "Other"] as const;

type CryptoDraft = {
  asset: (typeof CRYPTO_ASSETS)[number];
  costBasis: string;
  customAsset: string;
  quantity: string;
  source: (typeof CRYPTO_SOURCES)[number];
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

export function CryptoInputForm() {
  const { t } = useTranslation("portfolio");
  const [draft, setDraft] = useState<CryptoDraft>({
    asset: "BTC",
    costBasis: "",
    customAsset: "",
    quantity: "",
    source: "Binance",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const assetSymbol = useMemo(() => {
    return draft.asset === "Other" ? draft.customAsset.trim().toUpperCase() : draft.asset;
  }, [draft.asset, draft.customAsset]);

  function updateDraft(patch: Partial<CryptoDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!assetSymbol) {
        throw new Error("請輸入 Crypto Asset。");
      }

      const quantity = parsePositiveNumber(draft.quantity, t("quantity"));
      const costBasis = parsePositiveNumber(draft.costBasis, t("costBasis"));

      saveRecentPortfolioInput({
        category: "CRYPTO",
        details: [
          `Quantity ${draft.quantity.trim()}`,
          `Cost ${draft.costBasis.trim()} USDT`,
          `Source ${draft.source}`,
        ],
        title: assetSymbol,
      });
      savePendingPortfolioInput({
        category: "CRYPTO",
        details: [
          `Quantity ${draft.quantity.trim()}`,
          `Cost ${draft.costBasis.trim()} USDT`,
          `Source ${draft.source}`,
        ],
        knownNotional: quantity * costBasis,
        symbols: [assetSymbol],
        title: assetSymbol,
      });
      const writeResult = await saveCryptoPositionWithV13DatabaseWrite({
        asset: assetSymbol,
        costBasis,
        quantity,
        source: draft.source,
      });
      const writeLabel =
        writeResult.target === "database"
          ? "資料庫已同步"
          : writeResult.status === "failed"
            ? "資料庫寫入未完成，已保留 local fallback"
            : "資料庫 guard 未啟用，已保留 local fallback";
      setSuccess(`已建立 Workspace pending Crypto 輸入：${assetSymbol}（${writeLabel}）`);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "請確認 Crypto 欄位。");
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          {t("cryptoInput")}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
          {t("buildCryptoPosition")}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {t("cryptoInputBody")}
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className={LABEL_CLASS} htmlFor="crypto-asset">
            {t("asset")}
            <select
              className={FIELD_INPUT_CLASS}
              id="crypto-asset"
              onChange={(event) =>
                updateDraft({ asset: event.target.value as CryptoDraft["asset"] })
              }
              value={draft.asset}
            >
              {CRYPTO_ASSETS.map((asset) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </label>
          {draft.asset === "Other" ? (
            <label className={LABEL_CLASS} htmlFor="crypto-custom-asset">
              {t("otherAsset")}
              <input
                autoComplete="off"
                className={FIELD_INPUT_CLASS}
                id="crypto-custom-asset"
                maxLength={24}
                onChange={(event) => updateDraft({ customAsset: event.target.value })}
                placeholder="例如：LINK"
                required
                type="text"
                value={draft.customAsset}
              />
            </label>
          ) : null}
          <label className={LABEL_CLASS} htmlFor="crypto-quantity">
            {t("quantity")}
            <input
              className={FIELD_INPUT_CLASS}
              id="crypto-quantity"
              inputMode="decimal"
              onChange={(event) => updateDraft({ quantity: event.target.value })}
              placeholder="例如：0.5"
              required
              type="text"
              value={draft.quantity}
            />
          </label>
          <label className={LABEL_CLASS} htmlFor="crypto-cost">
            {t("costBasis")}
            <input
              className={FIELD_INPUT_CLASS}
              id="crypto-cost"
              inputMode="decimal"
              onChange={(event) => updateDraft({ costBasis: event.target.value })}
              placeholder="例如：52000"
              required
              type="text"
              value={draft.costBasis}
            />
          </label>
          <label className={LABEL_CLASS} htmlFor="crypto-source">
            {t("walletExchangeOptional")}
            <select
              className={FIELD_INPUT_CLASS}
              id="crypto-source"
              onChange={(event) =>
                updateDraft({ source: event.target.value as CryptoDraft["source"] })
              }
              value={draft.source}
            >
              {CRYPTO_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <InputReviewSummary
        assetType="Crypto"
        sections={[
          {
            items: [
              [t("asset"), assetSymbol || "未填"],
              [t("walletExchangeOptional"), draft.source],
            ],
            title: t("keyFields"),
          },
          {
            items: [
              [t("quantity"), displayValue(draft.quantity, "0")],
              [t("cost"), displayValue(draft.costBasis, "0")],
              [t("currency"), "USDT"],
            ],
            title: t("positionPreview"),
          },
          {
            items: [
              [t("riskFields"), `Crypto / ${t("source")}`],
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
          {t("createCryptoInput")}
        </button>
      </div>
    </form>
  );
}
