import type { IXAILocale } from "@/src/lib/i18n/locales";
import type { IXAICurrency } from "@/src/lib/i18n/currencies";

export const DEFAULT_REGION = "TW";

export const SUPPORTED_REGIONS = ["TW", "US", "HK", "JP", "KR", "EU"] as const;

export type IXAIRegion = (typeof SUPPORTED_REGIONS)[number];

export type IXAIRegionMetadata = {
  code: IXAIRegion;
  dateFormatStyle: Intl.DateTimeFormatOptions["dateStyle"];
  defaultCurrency: IXAICurrency;
  defaultLocale: IXAILocale;
  defaultTimezone: string;
  displayName: string;
  marketLabel: string;
  numberFormatStyle: "standard";
};

export const REGION_METADATA: Record<IXAIRegion, IXAIRegionMetadata> = {
  TW: {
    code: "TW",
    dateFormatStyle: "medium",
    defaultCurrency: "TWD",
    defaultLocale: "zh-TW",
    defaultTimezone: "Asia/Taipei",
    displayName: "Taiwan",
    marketLabel: "Taiwan market",
    numberFormatStyle: "standard",
  },
  US: {
    code: "US",
    dateFormatStyle: "medium",
    defaultCurrency: "USD",
    defaultLocale: "en-US",
    defaultTimezone: "America/New_York",
    displayName: "United States",
    marketLabel: "US market",
    numberFormatStyle: "standard",
  },
  HK: {
    code: "HK",
    dateFormatStyle: "medium",
    defaultCurrency: "HKD",
    defaultLocale: "zh-TW",
    defaultTimezone: "Asia/Hong_Kong",
    displayName: "Hong Kong",
    marketLabel: "Hong Kong market",
    numberFormatStyle: "standard",
  },
  JP: {
    code: "JP",
    dateFormatStyle: "medium",
    defaultCurrency: "JPY",
    defaultLocale: "ja-JP",
    defaultTimezone: "Asia/Tokyo",
    displayName: "Japan",
    marketLabel: "Japan market",
    numberFormatStyle: "standard",
  },
  KR: {
    code: "KR",
    dateFormatStyle: "medium",
    defaultCurrency: "KRW",
    defaultLocale: "ko-KR",
    defaultTimezone: "Asia/Seoul",
    displayName: "Korea",
    marketLabel: "Korea market",
    numberFormatStyle: "standard",
  },
  EU: {
    code: "EU",
    dateFormatStyle: "medium",
    defaultCurrency: "EUR",
    defaultLocale: "en-US",
    defaultTimezone: "Europe/Paris",
    displayName: "Europe",
    marketLabel: "European market",
    numberFormatStyle: "standard",
  },
};

export const REGION_OPTIONS = SUPPORTED_REGIONS.map((code) => REGION_METADATA[code]);

export function isSupportedRegion(value: unknown): value is IXAIRegion {
  return typeof value === "string" && SUPPORTED_REGIONS.includes(value as IXAIRegion);
}

export function normalizeRegion(value: unknown): IXAIRegion {
  return isSupportedRegion(value) ? value : DEFAULT_REGION;
}

export function getRegionMetadata(region: IXAIRegion): IXAIRegionMetadata {
  return REGION_METADATA[region] ?? REGION_METADATA[DEFAULT_REGION];
}
