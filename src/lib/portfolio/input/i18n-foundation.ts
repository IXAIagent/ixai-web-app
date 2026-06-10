import type {
  PortfolioInputLanguage,
  PortfolioInputRegion,
} from "@/src/lib/portfolio/input/asset-types";

export const SUPPORTED_INPUT_LANGUAGES: PortfolioInputLanguage[] = [
  "zh-TW",
  "zh-CN",
  "en-US",
  "ja-JP",
  "ko-KR",
];

export const SUPPORTED_INPUT_REGIONS: PortfolioInputRegion[] = [
  "TW",
  "HK",
  "CN",
  "JP",
  "KR",
  "US",
  "EU",
  "GLOBAL",
];

export const DEFAULT_INPUT_LANGUAGE: PortfolioInputLanguage = "zh-TW";

export function getInputLanguageLabel(language: PortfolioInputLanguage): string {
  return {
    "en-US": "English",
    "ja-JP": "日本語",
    "ko-KR": "한국어",
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
  }[language];
}
