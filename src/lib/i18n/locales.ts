export const DEFAULT_LOCALE = "zh-TW";

export const SUPPORTED_LOCALES = [
  "zh-TW",
  "zh-CN",
  "en-US",
  "ja-JP",
  "ko-KR",
] as const;

export type IXAILocale = (typeof SUPPORTED_LOCALES)[number];

export type LocaleOption = {
  code: IXAILocale;
  label: string;
};

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: "zh-TW", label: "繁體中文" },
  { code: "zh-CN", label: "简体中文" },
  { code: "en-US", label: "English" },
  { code: "ja-JP", label: "日本語" },
  { code: "ko-KR", label: "한국어" },
];

export function isSupportedLocale(value: unknown): value is IXAILocale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as IXAILocale);
}

export function normalizeLocale(value: unknown): IXAILocale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}

export function getLocaleLabel(locale: IXAILocale) {
  return LOCALE_OPTIONS.find((option) => option.code === locale)?.label ?? "繁體中文";
}
