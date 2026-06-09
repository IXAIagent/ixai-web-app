"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  Layers3,
  Loader2,
  PlusCircle,
  Trash2,
} from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import { FCN_CURRENCIES, type FCNCurrency, type FCNPosition } from "@/src/types/fcn-position";
import type { Portfolio } from "@/src/types/portfolio";

type PortfolioListResponse = {
  message?: string;
  ok: boolean;
  portfolios?: Portfolio[];
  status?: string;
};

type FCNCreateResponse = {
  message?: string;
  ok: boolean;
  position?: FCNPosition;
  status?: string;
};

type UnderlyingDraft = {
  currentPrice: string;
  id: string;
  initialPrice: string;
  kiPrice: string;
  koPrice: string;
  market: string;
  name: string;
  strikePrice: string;
  symbol: string;
  weightPct: string;
};

type ScheduleDraft = {
  couponDate: string;
  id: string;
  label: string;
  observationDate: string;
};

type BasicDraft = {
  couponRatePct: string;
  currency: FCNCurrency;
  issuer: string;
  name: string;
  notionalAmount: string;
  portfolioId: string;
};

type TermsDraft = {
  couponRatePct: string;
  kiPct: string;
  koPct: string;
  strikePct: string;
};

const MAX_UNDERLYINGS = 6;
const DEFAULT_CURRENCY: FCNCurrency = "USD";

const STEPS = [
  "基本資訊",
  "連結標的",
  "產品條件",
  "觀察日程",
  "確認建立",
] as const;

const FIELD_INPUT_CLASS =
  "min-h-11 rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2.5 text-sm text-[var(--ixai-forest)] outline-none transition placeholder:text-[rgba(9,41,31,0.42)] focus:border-[var(--ixai-gold)]";
const SMALL_INPUT_CLASS =
  "min-h-10 rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2 text-sm text-[var(--ixai-forest)] outline-none transition placeholder:text-[rgba(9,41,31,0.42)] focus:border-[var(--ixai-gold)]";
const LABEL_CLASS = "grid gap-2 text-sm font-medium text-[var(--ixai-forest)]";

function createDraftId() {
  return Math.random().toString(36).slice(2, 10);
}

function createEmptyUnderlying(): UnderlyingDraft {
  return {
    currentPrice: "",
    id: createDraftId(),
    initialPrice: "",
    kiPrice: "",
    koPrice: "",
    market: "",
    name: "",
    strikePrice: "",
    symbol: "",
    weightPct: "",
  };
}

function createEmptyScheduleItem(): ScheduleDraft {
  return {
    couponDate: "",
    id: createDraftId(),
    label: "",
    observationDate: "",
  };
}

function initialBasicDraft(): BasicDraft {
  return {
    couponRatePct: "",
    currency: DEFAULT_CURRENCY,
    issuer: "",
    name: "",
    notionalAmount: "",
    portfolioId: "",
  };
}

function initialTermsDraft(): TermsDraft {
  return {
    couponRatePct: "",
    kiPct: "",
    koPct: "",
    strikePct: "",
  };
}

function parseOptionalNumber(value: string, label: string) {
  const normalized = value.trim().replace(/,/g, "");

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${label} 必須是 0 或以上的數字。`);
  }

  return parsed;
}

function displayOptional(value: string, fallback = "未填") {
  return value.trim() || fallback;
}

function errorMessageFromStatus(status?: string, fallback?: string) {
  if (status === "not_authenticated") {
    return "請先登入 IXAI，再建立 FCN。";
  }

  if (status === "supabase_not_configured") {
    return "FCN 儲存尚未設定，請稍後再試。";
  }

  if (status === "invalid_input") {
    return fallback || "請確認 FCN 欄位格式。";
  }

  if (status === "not_found") {
    return "找不到可使用的 Portfolio，請先建立 Portfolio。";
  }

  return fallback || "FCN 建立失敗，請稍後再試。";
}

export function FCNWizard() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [portfolioStatus, setPortfolioStatus] = useState<"idle" | "loading" | "ready" | "unauthenticated" | "error">(
    "idle",
  );
  const [basic, setBasic] = useState<BasicDraft>(() => initialBasicDraft());
  const [terms, setTerms] = useState<TermsDraft>(() => initialTermsDraft());
  const [underlyings, setUnderlyings] = useState<UnderlyingDraft[]>(() => [createEmptyUnderlying()]);
  const [schedule, setSchedule] = useState<ScheduleDraft[]>(() => [createEmptyScheduleItem()]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPortfolio = useMemo(
    () => portfolios.find((portfolio) => portfolio.id === basic.portfolioId) ?? null,
    [basic.portfolioId, portfolios],
  );

  const loadPortfolios = useCallback(async () => {
    setPortfolioStatus("loading");

    try {
      const headers = await getSupabaseAuthorizationHeaders();

      if (!headers) {
        setPortfolioStatus("unauthenticated");
        setPortfolios([]);
        return;
      }

      const response = await fetch("/api/portfolio", {
        cache: "no-store",
        headers,
      });
      const payload = (await response.json().catch(() => ({}))) as PortfolioListResponse;

      if (!response.ok || !payload.ok) {
        setPortfolioStatus("error");
        setPortfolios([]);
        return;
      }

      const activePortfolios = (payload.portfolios ?? []).filter(
        (portfolio) => portfolio.status === "active",
      );

      setPortfolios(activePortfolios);
      setPortfolioStatus("ready");
      setBasic((current) => ({
        ...current,
        portfolioId:
          current.portfolioId || activePortfolios.length === 0
            ? current.portfolioId
            : activePortfolios[0]?.id ?? "",
      }));
    } catch {
      setPortfolioStatus("error");
      setPortfolios([]);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadPortfolios();
    });
  }, [loadPortfolios]);

  function resetWizard() {
    setActiveStep(0);
    setBasic((current) => ({
      ...initialBasicDraft(),
      portfolioId: current.portfolioId,
    }));
    setTerms(initialTermsDraft());
    setUnderlyings([createEmptyUnderlying()]);
    setSchedule([createEmptyScheduleItem()]);
  }

  function validateStep(step: number) {
    if (step === 0) {
      if (portfolios.length === 0) {
        throw new Error("請先建立 Portfolio，再新增 FCN。");
      }

      if (!basic.portfolioId) {
        throw new Error("請選擇 Portfolio。");
      }

      if (!basic.name.trim()) {
        throw new Error("請輸入 FCN 名稱。");
      }

      parseOptionalNumber(basic.notionalAmount, "名目本金");
      parseOptionalNumber(basic.couponRatePct, "配息率");
    }

    if (step === 1) {
      if (underlyings.length < 1) {
        throw new Error("至少需要 1 個連結標的。");
      }

      underlyings.forEach((underlying, index) => {
        if (!underlying.symbol.trim()) {
          throw new Error(`第 ${index + 1} 個標的請輸入代號。`);
        }

        parseOptionalNumber(underlying.initialPrice, `第 ${index + 1} 個標的初始價格`);
        parseOptionalNumber(underlying.currentPrice, `第 ${index + 1} 個標的目前價格`);
        parseOptionalNumber(underlying.kiPrice, `第 ${index + 1} 個標的 KI 價格`);
        parseOptionalNumber(underlying.koPrice, `第 ${index + 1} 個標的 KO 價格`);
        parseOptionalNumber(underlying.strikePrice, `第 ${index + 1} 個標的履約價格`);
        parseOptionalNumber(underlying.weightPct, `第 ${index + 1} 個標的權重`);
      });
    }

    if (step === 2) {
      parseOptionalNumber(terms.koPct, "KO 比例");
      parseOptionalNumber(terms.kiPct, "KI 比例");
      parseOptionalNumber(terms.strikePct, "履約比例");
      parseOptionalNumber(terms.couponRatePct, "配息率");
    }

    if (step === 3) {
      schedule.forEach((item, index) => {
        const hasAnyValue = item.label.trim() || item.observationDate || item.couponDate;

        if (hasAnyValue && !item.observationDate) {
          throw new Error(`第 ${index + 1} 筆日程請輸入觀察日。`);
        }
      });
    }
  }

  function goToNextStep() {
    setError("");
    setSuccess("");

    try {
      validateStep(activeStep);
      setActiveStep((current) => Math.min(current + 1, STEPS.length - 1));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "請確認目前步驟欄位。");
    }
  }

  function goToPreviousStep() {
    setError("");
    setSuccess("");
    setActiveStep((current) => Math.max(current - 1, 0));
  }

  function syncCouponRate(nextValue: string) {
    setBasic((current) => ({ ...current, couponRatePct: nextValue }));
    setTerms((current) => ({ ...current, couponRatePct: nextValue }));
  }

  function updateUnderlying(id: string, patch: Partial<UnderlyingDraft>) {
    setUnderlyings((current) =>
      current.map((underlying) =>
        underlying.id === id ? { ...underlying, ...patch } : underlying,
      ),
    );
  }

  function updateSchedule(id: string, patch: Partial<ScheduleDraft>) {
    setSchedule((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addUnderlying() {
    setUnderlyings((current) =>
      current.length >= MAX_UNDERLYINGS ? current : [...current, createEmptyUnderlying()],
    );
  }

  function removeUnderlying(id: string) {
    setUnderlyings((current) =>
      current.length <= 1 ? current : current.filter((underlying) => underlying.id !== id),
    );
  }

  function addScheduleItem() {
    setSchedule((current) => [...current, createEmptyScheduleItem()]);
  }

  function removeScheduleItem(id: string) {
    setSchedule((current) =>
      current.length <= 1 ? [createEmptyScheduleItem()] : current.filter((item) => item.id !== id),
    );
  }

  function buildPayload() {
    const schedulePayload = schedule
      .filter((item) => item.label.trim() || item.observationDate || item.couponDate)
      .map((item) => ({
        couponPaymentDate: item.couponDate || undefined,
        observationEnd: item.observationDate || undefined,
        observationStart: item.observationDate || undefined,
        periodLabel: item.label.trim() || undefined,
        status: "scheduled",
      }));

    return {
      couponRatePct: parseOptionalNumber(terms.couponRatePct || basic.couponRatePct, "配息率"),
      currency: basic.currency,
      issuer: basic.issuer.trim() || null,
      kiPct: parseOptionalNumber(terms.kiPct, "KI 比例"),
      koPct: parseOptionalNumber(terms.koPct, "KO 比例"),
      maturityDate: schedulePayload.at(-1)?.observationEnd ?? null,
      name: basic.name.trim(),
      notionalAmount: parseOptionalNumber(basic.notionalAmount, "名目本金"),
      observationSchedule: schedulePayload,
      portfolioId: basic.portfolioId,
      startDate: schedulePayload[0]?.observationStart ?? null,
      strikePct: parseOptionalNumber(terms.strikePct, "履約比例"),
      underlyings: underlyings.map((underlying) => ({
        currentPrice: parseOptionalNumber(underlying.currentPrice, "目前價格"),
        initialPrice: parseOptionalNumber(underlying.initialPrice, "初始價格"),
        kiPrice: parseOptionalNumber(underlying.kiPrice, "KI 價格"),
        koPrice: parseOptionalNumber(underlying.koPrice, "KO 價格"),
        market: underlying.market.trim() || null,
        name: underlying.name.trim() || null,
        strikePrice: parseOptionalNumber(underlying.strikePrice, "履約價格"),
        symbol: underlying.symbol.trim().toUpperCase(),
        weightPct: parseOptionalNumber(underlying.weightPct, "權重"),
      })),
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      validateStep(0);
      validateStep(1);
      validateStep(2);
      validateStep(3);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "請確認 FCN 欄位。");
      return;
    }

    setIsSubmitting(true);

    try {
      const headers = await getSupabaseAuthorizationHeaders();

      if (!headers) {
        setError("請先登入 IXAI，再建立 FCN。");
        return;
      }

      const response = await fetch("/api/fcn", {
        body: JSON.stringify(buildPayload()),
        cache: "no-store",
        headers: {
          ...headers,
          "content-type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json().catch(() => ({}))) as FCNCreateResponse;

      if (!response.ok || !payload.ok || !payload.position) {
        setError(errorMessageFromStatus(payload.status, payload.message));
        return;
      }

      setSuccess(`已建立「${payload.position.name}」。`);
      resetWizard();
      window.dispatchEvent(new CustomEvent("ixai:portfolio:changed"));
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "FCN 建立失敗，請稍後再試。");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canAddUnderlying = underlyings.length < MAX_UNDERLYINGS;
  const hasPortfolioOptions = portfolios.length > 0;

  return (
    <section className="rounded-3xl border border-[rgba(9,41,31,0.14)] bg-[rgba(255,250,240,0.92)] p-5 shadow-[0_18px_48px_rgba(9,41,31,0.07)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <FeatureIcon icon={Layers3} />
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              FCN Input
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
              建立 FCN
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              用分步方式記錄 FCN 條件、連結標的與觀察日程，作為後續風險監控資料基礎。
            </p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(176,141,87,0.38)] bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--ixai-forest)]">
          <FileCheck2 className="h-3.5 w-3.5 text-[var(--ixai-gold)]" aria-hidden="true" />
          Wizard
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--ixai-border)] bg-white/65 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        FCN Wizard 僅用於記錄產品條件與風險監控資料，不代表投資建議、產品推薦、買賣建議、收益承諾或自動交易。
      </div>

      <ol className="mt-5 grid gap-2 sm:grid-cols-5" aria-label="FCN 建立步驟">
        {STEPS.map((step, index) => {
          const isActive = index === activeStep;
          const isDone = index < activeStep;

          return (
            <li
              className={`rounded-lg border px-3 py-2 text-xs font-semibold leading-5 ${
                isActive
                  ? "border-[rgba(176,141,87,0.58)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)]"
                  : "border-[var(--ixai-border)] bg-white/70 text-[var(--ixai-forest-soft)]"
              }`}
              key={step}
            >
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em]">
                Step {index + 1}
              </span>
              <span className={isDone ? "text-[var(--ixai-forest)]" : ""}>{step}</span>
            </li>
          );
        })}
      </ol>

      <form className="mt-5 grid gap-5" onSubmit={handleSubmit}>
        {activeStep === 0 ? (
          <div className="grid gap-4">
            {portfolioStatus === "loading" ? (
              <p className="rounded-lg border border-[var(--ixai-border)] bg-white/65 p-3 text-sm text-[var(--ixai-forest-soft)]">
                正在讀取 Portfolio...
              </p>
            ) : null}
            {portfolioStatus === "unauthenticated" ? (
              <p className="rounded-lg border border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_8%,white)] p-3 text-sm leading-6 text-[var(--ixai-forest)]">
                請先登入 IXAI，再建立 FCN。
              </p>
            ) : null}
            {portfolioStatus === "error" ? (
              <p className="rounded-lg border border-[color-mix(in_srgb,var(--ixai-risk-elevated)_34%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-elevated)_8%,white)] p-3 text-sm leading-6 text-[var(--ixai-forest)]">
                Portfolio 讀取失敗，請稍後重試。
              </p>
            ) : null}
            {portfolioStatus === "ready" && !hasPortfolioOptions ? (
              <p className="rounded-lg border border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_8%,white)] p-3 text-sm leading-6 text-[var(--ixai-forest)]">
                請先建立 Portfolio，再新增 FCN。你可以先到本頁上方的 Portfolio 區塊建立資產容器。
              </p>
            ) : null}

            <label className={LABEL_CLASS} htmlFor="fcn-portfolio">
              Portfolio
              <select
                className={FIELD_INPUT_CLASS}
                disabled={!hasPortfolioOptions}
                id="fcn-portfolio"
                name="portfolioId"
                onChange={(event) =>
                  setBasic((current) => ({ ...current, portfolioId: event.target.value }))
                }
                required
                value={basic.portfolioId}
              >
                <option value="">選擇 Portfolio</option>
                {portfolios.map((portfolio) => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name} · {portfolio.baseCurrency}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={LABEL_CLASS} htmlFor="fcn-name">
                FCN 名稱
                <input
                  autoComplete="off"
                  className={FIELD_INPUT_CLASS}
                  id="fcn-name"
                  maxLength={100}
                  name="name"
                  onChange={(event) =>
                    setBasic((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="例如：FCN219M"
                  required
                  type="text"
                  value={basic.name}
                />
              </label>
              <label className={LABEL_CLASS} htmlFor="fcn-issuer">
                發行機構（選填）
                <input
                  autoComplete="off"
                  className={FIELD_INPUT_CLASS}
                  id="fcn-issuer"
                  maxLength={120}
                  name="issuer"
                  onChange={(event) =>
                    setBasic((current) => ({ ...current, issuer: event.target.value }))
                  }
                  placeholder="例如：某外商銀行"
                  type="text"
                  value={basic.issuer}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className={LABEL_CLASS} htmlFor="fcn-currency">
                幣別
                <select
                  className={FIELD_INPUT_CLASS}
                  id="fcn-currency"
                  name="currency"
                  onChange={(event) =>
                    setBasic((current) => ({
                      ...current,
                      currency: event.target.value as FCNCurrency,
                    }))
                  }
                  value={basic.currency}
                >
                  {FCN_CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </label>
              <label className={LABEL_CLASS} htmlFor="fcn-notional">
                名目本金（選填）
                <input
                  className={FIELD_INPUT_CLASS}
                  id="fcn-notional"
                  inputMode="decimal"
                  name="notionalAmount"
                  onChange={(event) =>
                    setBasic((current) => ({ ...current, notionalAmount: event.target.value }))
                  }
                  placeholder="例如：100000"
                  type="text"
                  value={basic.notionalAmount}
                />
              </label>
              <label className={LABEL_CLASS} htmlFor="fcn-coupon-basic">
                配息率 %（選填）
                <input
                  className={FIELD_INPUT_CLASS}
                  id="fcn-coupon-basic"
                  inputMode="decimal"
                  name="couponRatePct"
                  onChange={(event) => syncCouponRate(event.target.value)}
                  placeholder="例如：12.5"
                  type="text"
                  value={basic.couponRatePct}
                />
              </label>
            </div>
          </div>
        ) : null}

        {activeStep === 1 ? (
          <div className="grid gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                  連結標的
                </h3>
                <p className="mt-1 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  至少 1 檔，最多 6 檔。Worst-of 監控會依賴這些標的資料。
                </p>
              </div>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.38)] bg-white/75 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-not-allowed disabled:opacity-55"
                disabled={!canAddUnderlying}
                onClick={addUnderlying}
                type="button"
              >
                <PlusCircle className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                新增標的
              </button>
            </div>

            {underlyings.map((underlying, index) => (
              <article
                className="grid gap-4 rounded-2xl border border-[var(--ixai-border)] bg-white/65 p-4"
                key={underlying.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[var(--ixai-forest)]">
                    標的 {index + 1}
                  </p>
                  <button
                    aria-label={`移除標的 ${index + 1}`}
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[rgba(9,41,31,0.14)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ixai-forest)] disabled:cursor-not-allowed disabled:opacity-45"
                    disabled={underlyings.length <= 1}
                    onClick={() => removeUnderlying(underlying.id)}
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[var(--ixai-gold)]" aria-hidden="true" />
                    移除
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className={LABEL_CLASS} htmlFor={`underlying-symbol-${underlying.id}`}>
                    標的代號
                    <input
                      autoComplete="off"
                      className={SMALL_INPUT_CLASS}
                      id={`underlying-symbol-${underlying.id}`}
                      maxLength={32}
                      onChange={(event) =>
                        updateUnderlying(underlying.id, { symbol: event.target.value })
                      }
                      placeholder="例如：TSLA"
                      required
                      type="text"
                      value={underlying.symbol}
                    />
                  </label>
                  <label className={LABEL_CLASS} htmlFor={`underlying-name-${underlying.id}`}>
                    名稱（選填）
                    <input
                      autoComplete="off"
                      className={SMALL_INPUT_CLASS}
                      id={`underlying-name-${underlying.id}`}
                      maxLength={120}
                      onChange={(event) =>
                        updateUnderlying(underlying.id, { name: event.target.value })
                      }
                      placeholder="例如：Tesla"
                      type="text"
                      value={underlying.name}
                    />
                  </label>
                  <label className={LABEL_CLASS} htmlFor={`underlying-market-${underlying.id}`}>
                    市場（選填）
                    <input
                      autoComplete="off"
                      className={SMALL_INPUT_CLASS}
                      id={`underlying-market-${underlying.id}`}
                      maxLength={80}
                      onChange={(event) =>
                        updateUnderlying(underlying.id, { market: event.target.value })
                      }
                      placeholder="US / TW / HK"
                      type="text"
                      value={underlying.market}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["initialPrice", "初始價格"],
                    ["currentPrice", "目前價格"],
                    ["kiPrice", "KI 價格"],
                    ["koPrice", "KO 價格"],
                    ["strikePrice", "履約價格"],
                    ["weightPct", "權重 %"],
                  ].map(([field, label]) => (
                    <label
                      className={LABEL_CLASS}
                      htmlFor={`underlying-${field}-${underlying.id}`}
                      key={field}
                    >
                      {label}（選填）
                      <input
                        className={SMALL_INPUT_CLASS}
                        id={`underlying-${field}-${underlying.id}`}
                        inputMode="decimal"
                        onChange={(event) =>
                          updateUnderlying(underlying.id, {
                            [field]: event.target.value,
                          } as Partial<UnderlyingDraft>)
                        }
                        placeholder="0"
                        type="text"
                        value={underlying[field as keyof UnderlyingDraft]}
                      />
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="grid gap-4">
            <div>
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                產品條件
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                這些欄位只用來記錄 FCN 條件，不代表收益承諾或產品推薦。
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={LABEL_CLASS} htmlFor="fcn-ko-pct">
                KO 比例 %（選填）
                <input
                  className={FIELD_INPUT_CLASS}
                  id="fcn-ko-pct"
                  inputMode="decimal"
                  onChange={(event) =>
                    setTerms((current) => ({ ...current, koPct: event.target.value }))
                  }
                  placeholder="例如：105"
                  type="text"
                  value={terms.koPct}
                />
              </label>
              <label className={LABEL_CLASS} htmlFor="fcn-ki-pct">
                KI 比例 %（選填）
                <input
                  className={FIELD_INPUT_CLASS}
                  id="fcn-ki-pct"
                  inputMode="decimal"
                  onChange={(event) =>
                    setTerms((current) => ({ ...current, kiPct: event.target.value }))
                  }
                  placeholder="例如：70"
                  type="text"
                  value={terms.kiPct}
                />
              </label>
              <label className={LABEL_CLASS} htmlFor="fcn-strike-pct">
                履約比例 %（選填）
                <input
                  className={FIELD_INPUT_CLASS}
                  id="fcn-strike-pct"
                  inputMode="decimal"
                  onChange={(event) =>
                    setTerms((current) => ({ ...current, strikePct: event.target.value }))
                  }
                  placeholder="例如：100"
                  type="text"
                  value={terms.strikePct}
                />
              </label>
              <label className={LABEL_CLASS} htmlFor="fcn-coupon-terms">
                配息率 %（選填）
                <input
                  className={FIELD_INPUT_CLASS}
                  id="fcn-coupon-terms"
                  inputMode="decimal"
                  onChange={(event) => syncCouponRate(event.target.value)}
                  placeholder="例如：12.5"
                  type="text"
                  value={terms.couponRatePct}
                />
              </label>
            </div>
          </div>
        ) : null}

        {activeStep === 3 ? (
          <div className="grid gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                  觀察日程
                </h3>
                <p className="mt-1 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  先用簡單日期列記錄觀察日、配息日與到期節奏。
                </p>
              </div>
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.38)] bg-white/75 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]"
                onClick={addScheduleItem}
                type="button"
              >
                <CalendarDays className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                新增日程
              </button>
            </div>

            {schedule.map((item, index) => (
              <article
                className="grid gap-3 rounded-2xl border border-[var(--ixai-border)] bg-white/65 p-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                key={item.id}
              >
                <label className={LABEL_CLASS} htmlFor={`schedule-label-${item.id}`}>
                  標籤（選填）
                  <input
                    autoComplete="off"
                    className={SMALL_INPUT_CLASS}
                    id={`schedule-label-${item.id}`}
                    maxLength={80}
                    onChange={(event) => updateSchedule(item.id, { label: event.target.value })}
                    placeholder={`第 ${index + 1} 次`}
                    type="text"
                    value={item.label}
                  />
                </label>
                <label className={LABEL_CLASS} htmlFor={`schedule-observation-${item.id}`}>
                  觀察日
                  <input
                    className={SMALL_INPUT_CLASS}
                    id={`schedule-observation-${item.id}`}
                    onChange={(event) =>
                      updateSchedule(item.id, { observationDate: event.target.value })
                    }
                    type="date"
                    value={item.observationDate}
                  />
                </label>
                <label className={LABEL_CLASS} htmlFor={`schedule-coupon-${item.id}`}>
                  配息日（選填）
                  <input
                    className={SMALL_INPUT_CLASS}
                    id={`schedule-coupon-${item.id}`}
                    onChange={(event) => updateSchedule(item.id, { couponDate: event.target.value })}
                    type="date"
                    value={item.couponDate}
                  />
                </label>
                <button
                  aria-label={`移除第 ${index + 1} 筆日程`}
                  className="mt-0 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[rgba(9,41,31,0.14)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ixai-forest)] sm:mt-7"
                  onClick={() => removeScheduleItem(item.id)}
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5 text-[var(--ixai-gold)]" aria-hidden="true" />
                  移除
                </button>
              </article>
            ))}
          </div>
        ) : null}

        {activeStep === 4 ? (
          <div className="grid gap-4">
            <div>
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">
                確認建立
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                建立前請確認資料。之後可作為 FCN 監控與 Dashboard readback 的基礎。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["FCN 名稱", displayOptional(basic.name)],
                ["Portfolio", selectedPortfolio?.name ?? "未選擇"],
                ["幣別", basic.currency],
                ["名目本金", displayOptional(basic.notionalAmount)],
                ["KI / KO / Strike", `${displayOptional(terms.kiPct)} / ${displayOptional(terms.koPct)} / ${displayOptional(terms.strikePct)}`],
              ].map(([label, value]) => (
                <div
                  className="rounded-lg border border-[var(--ixai-border)] bg-white/65 p-3"
                  key={label}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-[var(--ixai-forest)]">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[var(--ixai-border)] bg-white/65 p-4">
              <p className="text-sm font-semibold text-[var(--ixai-forest)]">連結標的</p>
              <ul className="mt-3 grid gap-2">
                {underlyings.map((underlying, index) => (
                  <li
                    className="rounded-lg border border-[rgba(9,41,31,0.1)] bg-white/65 p-3 text-sm leading-6 text-[var(--ixai-forest-soft)]"
                    key={underlying.id}
                  >
                    <span className="font-semibold text-[var(--ixai-forest)]">
                      {index + 1}. {underlying.symbol.trim().toUpperCase() || "未填代號"}
                    </span>
                    {underlying.name.trim() ? ` · ${underlying.name.trim()}` : ""}
                    <span className="block text-xs text-[rgba(9,41,31,0.58)]">
                      KI {displayOptional(underlying.kiPrice)} / KO{" "}
                      {displayOptional(underlying.koPrice)} / Strike{" "}
                      {displayOptional(underlying.strikePrice)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--ixai-border)] bg-white/65 p-4">
              <p className="text-sm font-semibold text-[var(--ixai-forest)]">日程摘要</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {schedule.filter((item) => item.label.trim() || item.observationDate || item.couponDate)
                  .length > 0 ? (
                  schedule
                    .filter((item) => item.label.trim() || item.observationDate || item.couponDate)
                    .map((item, index) => (
                      <li
                        className="rounded-lg border border-[rgba(9,41,31,0.1)] bg-white/65 p-3"
                        key={item.id}
                      >
                        <span className="font-semibold text-[var(--ixai-forest)]">
                          {item.label.trim() || `第 ${index + 1} 次觀察`}
                        </span>
                        <span className="block text-xs text-[rgba(9,41,31,0.58)]">
                          觀察日 {item.observationDate || "未填"} · 配息日{" "}
                          {item.couponDate || "未填"}
                        </span>
                      </li>
                    ))
                ) : (
                  <li className="rounded-lg border border-[rgba(9,41,31,0.1)] bg-white/65 p-3">
                    尚未填寫觀察日程。
                  </li>
                )}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-[var(--ixai-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
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

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[rgba(9,41,31,0.16)] bg-white/75 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={activeStep === 0 || isSubmitting}
              onClick={goToPreviousStep}
              type="button"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              上一步
            </button>
            {activeStep < STEPS.length - 1 ? (
              <button
                className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isSubmitting}
                onClick={goToNextStep}
                type="button"
              >
                下一步
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
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
                    建立 FCN
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
