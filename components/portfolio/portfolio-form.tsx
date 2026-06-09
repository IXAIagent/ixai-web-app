"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, PlusCircle, WalletCards } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import {
  PORTFOLIO_BASE_CURRENCIES,
  type BaseCurrency,
  type Portfolio,
} from "@/src/types/portfolio";

type PortfolioCreateResponse = {
  message?: string;
  ok: boolean;
  portfolio?: Portfolio;
  status?: string;
};

const DEFAULT_BASE_CURRENCY: BaseCurrency = "USD";

function errorMessageFromStatus(status?: string, fallback?: string) {
  if (status === "not_authenticated") {
    return "請先登入 IXAI，再建立 Portfolio。";
  }

  if (status === "supabase_not_configured") {
    return "Portfolio 儲存尚未設定，請稍後再試。";
  }

  if (status === "invalid_input") {
    return fallback || "請確認 Portfolio 名稱與幣別。";
  }

  return fallback || "Portfolio 建立失敗，請稍後再試。";
}

export function PortfolioForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [baseCurrency, setBaseCurrency] = useState<BaseCurrency>(DEFAULT_BASE_CURRENCY);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    setError("");
    setSuccess("");

    if (!normalizedName) {
      setError("請輸入 Portfolio 名稱。");
      return;
    }

    if (!PORTFOLIO_BASE_CURRENCIES.includes(baseCurrency)) {
      setError("請選擇有效的基準幣別。");
      return;
    }

    setIsSubmitting(true);

    try {
      const headers = await getSupabaseAuthorizationHeaders();

      if (!headers) {
        setError("請先登入 IXAI，再建立 Portfolio。");
        return;
      }

      const response = await fetch("/api/portfolio", {
        body: JSON.stringify({
          baseCurrency,
          description: description.trim() || null,
          name: normalizedName,
        }),
        cache: "no-store",
        headers: {
          ...headers,
          "content-type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => ({}))) as PortfolioCreateResponse;

      if (!response.ok || !payload.ok || !payload.portfolio) {
        setError(errorMessageFromStatus(payload.status, payload.message));
        return;
      }

      setName("");
      setBaseCurrency(DEFAULT_BASE_CURRENCY);
      setDescription("");
      setSuccess(`已建立「${payload.portfolio.name}」。`);

      window.dispatchEvent(new CustomEvent("ixai:portfolio:changed"));
      router.refresh();
    } catch {
      setError("Portfolio 建立失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.92)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.07)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <FeatureIcon icon={WalletCards} />
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Portfolio Input
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
              建立 Portfolio
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              先建立一個資產容器，之後才能加入 FCN、股票、Crypto、Grid 與 Dual 監控資料。
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(176,141,87,0.38)] bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
          <PlusCircle className="h-3.5 w-3.5 text-[var(--ixai-gold)]" aria-hidden="true" />
          Alpha input
        </span>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]" htmlFor="portfolio-name">
          Portfolio 名稱
          <input
            autoComplete="off"
            className="min-h-11 rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2.5 text-sm text-[var(--ixai-forest)] outline-none transition placeholder:text-[rgba(9,41,31,0.42)] focus:border-[var(--ixai-gold)]"
            id="portfolio-name"
            maxLength={80}
            name="name"
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：核心資產組合"
            required
            type="text"
            value={name}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
          <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]" htmlFor="portfolio-base-currency">
            基準幣別
            <select
              className="min-h-11 rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2.5 text-sm text-[var(--ixai-forest)] outline-none transition focus:border-[var(--ixai-gold)]"
              id="portfolio-base-currency"
              name="baseCurrency"
              onChange={(event) => setBaseCurrency(event.target.value as BaseCurrency)}
              value={baseCurrency}
            >
              {PORTFOLIO_BASE_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]" htmlFor="portfolio-description">
            說明（選填）
            <textarea
              className="min-h-24 resize-y rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2.5 text-sm leading-6 text-[var(--ixai-forest)] outline-none transition placeholder:text-[rgba(9,41,31,0.42)] focus:border-[var(--ixai-gold)]"
              id="portfolio-description"
              maxLength={500}
              name="description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="例如：長期核心配置、FCN 監控用途"
              value={description}
            />
          </label>
        </div>

        <div className="rounded-2xl border border-[var(--ixai-border)] bg-white/65 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Portfolio 用於資產整理、監控與風險意識，不代表投資建議、買賣建議、目標價、報酬承諾或自動交易。
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-55"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                建立中...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                建立 Portfolio
              </>
            )}
          </button>
          <p className="text-xs leading-6 text-[rgba(9,41,31,0.58)]">
            建立後會更新本頁資料讀取區塊。
          </p>
        </div>
      </form>

      <div aria-live="polite" className="mt-4">
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
    </section>
  );
}

