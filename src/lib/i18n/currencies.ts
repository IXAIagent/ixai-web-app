import type { IXAILocale } from "@/src/lib/i18n/locales";
import type { IXAIRegion } from "@/src/lib/i18n/regions";

export const DEFAULT_CURRENCY = "TWD";

export const SUPPORTED_CURRENCIES = ["USD", "TWD", "HKD", "JPY", "EUR", "KRW"] as const;

export type IXAICurrency = (typeof SUPPORTED_CURRENCIES)[number];

export type IXAICurrencyMetadata = {
  code: IXAICurrency;
  decimalPrecision: number;
  displayName: string;
  symbol: string;
};

export const CURRENCY_METADATA: Record<IXAICurrency, IXAICurrencyMetadata> = {
  USD: { code: "USD", decimalPrecision: 2, displayName: "US Dollar", symbol: "$" },
  TWD: { code: "TWD", decimalPrecision: 0, displayName: "New Taiwan Dollar", symbol: "NT$" },
  HKD: { code: "HKD", decimalPrecision: 2, displayName: "Hong Kong Dollar", symbol: "HK$" },
  JPY: { code: "JPY", decimalPrecision: 0, displayName: "Japanese Yen", symbol: "¥" },
  EUR: { code: "EUR", decimalPrecision: 2, displayName: "Euro", symbol: "€" },
  KRW: { code: "KRW", decimalPrecision: 0, displayName: "Korean Won", symbol: "₩" },
};

export const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((code) => CURRENCY_METADATA[code]);

export function isSupportedCurrency(value: unknown): value is IXAICurrency {
  return typeof value === "string" && SUPPORTED_CURRENCIES.includes(value as IXAICurrency);
}

export function normalizeCurrency(value: unknown): IXAICurrency {
  return isSupportedCurrency(value) ? value : DEFAULT_CURRENCY;
}

export function getCurrencyMetadata(currency: IXAICurrency): IXAICurrencyMetadata {
  return CURRENCY_METADATA[currency] ?? CURRENCY_METADATA[DEFAULT_CURRENCY];
}

type FormattingContext = {
  currency?: IXAICurrency;
  locale?: IXAILocale;
  region?: IXAIRegion;
};

function normalizeIntlLocale(locale?: IXAILocale) {
  return locale ?? "zh-TW";
}

export function formatNumber(value: number, context: FormattingContext = {}) {
  return new Intl.NumberFormat(normalizeIntlLocale(context.locale), {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, context: FormattingContext = {}) {
  return new Intl.NumberFormat(normalizeIntlLocale(context.locale), {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    style: "percent",
  }).format(value);
}

export function formatCurrency(value: number, context: FormattingContext = {}) {
  const currency = normalizeCurrency(context.currency);
  const metadata = getCurrencyMetadata(currency);

  return new Intl.NumberFormat(normalizeIntlLocale(context.locale), {
    currency,
    maximumFractionDigits: metadata.decimalPrecision,
    minimumFractionDigits: metadata.decimalPrecision,
    style: "currency",
  }).format(value);
}

export function formatCurrencyCompact(value: number, context: FormattingContext = {}) {
  const currency = normalizeCurrency(context.currency);
  const metadata = getCurrencyMetadata(currency);

  return new Intl.NumberFormat(normalizeIntlLocale(context.locale), {
    compactDisplay: "short",
    currency,
    maximumFractionDigits: metadata.decimalPrecision > 0 ? 1 : 0,
    notation: "compact",
    style: "currency",
  }).format(value);
}
