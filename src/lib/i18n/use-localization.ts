"use client";

import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeDateLabel,
} from "@/src/lib/i18n/formatters";
import { useLocale } from "@/src/lib/i18n/use-locale";
import {
  CURRENCY_OPTIONS,
  getCurrencyMetadata,
  normalizeCurrency,
  type IXAICurrency,
} from "@/src/lib/i18n/currencies";
import {
  getRegionMetadata,
  normalizeRegion,
  REGION_OPTIONS,
  type IXAIRegion,
} from "@/src/lib/i18n/regions";
import {
  getStoredCurrency,
  getStoredRegion,
  setStoredCurrency,
  setStoredRegion,
  subscribeToLocalization,
} from "@/src/lib/i18n/localization-store";

function getServerRegionSnapshot(): IXAIRegion {
  return "TW";
}

function getServerCurrencySnapshot(): IXAICurrency {
  return "TWD";
}

type LocalizationContextValue = {
  currency: IXAICurrency;
  currencyMetadata: ReturnType<typeof getCurrencyMetadata>;
  currencyOptions: typeof CURRENCY_OPTIONS;
  examples: {
    compactCurrency: string;
    currency: string;
    date: string;
    dateTime: string;
    number: string;
    percent: string;
    relativeDate: string;
  };
  formatCurrency: (value: number) => string;
  formatCurrencyCompact: (value: number) => string;
  formatDate: (value: Date | string | number) => string;
  formatDateTime: (value: Date | string | number) => string;
  formatNumber: (value: number) => string;
  formatPercent: (value: number) => string;
  formatRelativeDateLabel: (value: Date | string | number) => string;
  region: IXAIRegion;
  regionMetadata: ReturnType<typeof getRegionMetadata>;
  regionOptions: typeof REGION_OPTIONS;
  setCurrency: (nextCurrency: IXAICurrency) => void;
  setRegion: (nextRegion: IXAIRegion) => void;
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

function useLocalizationStoreValue(): LocalizationContextValue {
  const { locale } = useLocale();
  const region = useSyncExternalStore(
    subscribeToLocalization,
    getStoredRegion,
    getServerRegionSnapshot,
  );
  const currency = useSyncExternalStore(
    subscribeToLocalization,
    getStoredCurrency,
    getServerCurrencySnapshot,
  );
  const regionMetadata = getRegionMetadata(region);
  const currencyMetadata = getCurrencyMetadata(currency);

  return useMemo(() => {
    const context = { currency, locale, region };
    const sampleNow = new Date("2026-06-30T08:00:00Z");
    const sampleTomorrow = new Date("2026-07-01T08:00:00Z");

    return {
      currency,
      currencyMetadata,
      currencyOptions: CURRENCY_OPTIONS,
      examples: {
        compactCurrency: formatCurrencyCompact(1_250_000, context),
        currency: formatCurrency(125_000, context),
        date: formatDate("2026-06-30T08:00:00Z", context),
        dateTime: formatDateTime("2026-06-30T08:00:00Z", context),
        number: formatNumber(1234567.89, context),
        percent: formatPercent(0.1234, context),
        relativeDate: formatRelativeDateLabel(sampleTomorrow, { ...context, now: sampleNow }),
      },
      formatCurrency: (value: number) => formatCurrency(value, context),
      formatCurrencyCompact: (value: number) => formatCurrencyCompact(value, context),
      formatDate: (value: Date | string | number) => formatDate(value, context),
      formatDateTime: (value: Date | string | number) => formatDateTime(value, context),
      formatNumber: (value: number) => formatNumber(value, context),
      formatPercent: (value: number) => formatPercent(value, context),
      formatRelativeDateLabel: (value: Date | string | number) => formatRelativeDateLabel(value, context),
      region,
      regionMetadata,
      regionOptions: REGION_OPTIONS,
      setCurrency(nextCurrency: IXAICurrency) {
        setStoredCurrency(normalizeCurrency(nextCurrency));
      },
      setRegion(nextRegion: IXAIRegion) {
        const normalizedRegion = normalizeRegion(nextRegion);
        setStoredRegion(normalizedRegion);
      },
    };
  }, [currency, currencyMetadata, locale, region, regionMetadata]);
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const value = useLocalizationStoreValue();

  return createElement(LocalizationContext.Provider, { value }, children);
}

export function useLocalization() {
  const contextValue = useContext(LocalizationContext);
  const fallbackValue = useLocalizationStoreValue();

  return contextValue ?? fallbackValue;
}
