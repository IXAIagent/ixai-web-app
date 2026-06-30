import type { IXAILocale } from "@/src/lib/i18n/locales";
import { getRegionMetadata, type IXAIRegion } from "@/src/lib/i18n/regions";
export {
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatPercent,
} from "@/src/lib/i18n/currencies";

type DateFormattingContext = {
  locale?: IXAILocale;
  region?: IXAIRegion;
};

function toDate(value: Date | string | number) {
  return value instanceof Date ? value : new Date(value);
}

function getLocale(locale?: IXAILocale) {
  return locale ?? "zh-TW";
}

function getTimezone(region?: IXAIRegion) {
  return getRegionMetadata(region ?? "TW").defaultTimezone;
}

export function formatDate(value: Date | string | number, context: DateFormattingContext = {}) {
  return new Intl.DateTimeFormat(getLocale(context.locale), {
    dateStyle: getRegionMetadata(context.region ?? "TW").dateFormatStyle,
    timeZone: getTimezone(context.region),
  }).format(toDate(value));
}

export function formatDateTime(value: Date | string | number, context: DateFormattingContext = {}) {
  return new Intl.DateTimeFormat(getLocale(context.locale), {
    dateStyle: getRegionMetadata(context.region ?? "TW").dateFormatStyle,
    timeStyle: "short",
    timeZone: getTimezone(context.region),
  }).format(toDate(value));
}

export function formatRelativeDateLabel(
  value: Date | string | number,
  context: DateFormattingContext & { now?: Date | string | number } = {},
) {
  const target = toDate(value);
  const now = context.now ? toDate(context.now) : new Date();
  const startTarget = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  const startNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayDelta = Math.round((startTarget - startNow) / 86_400_000);
  const english = context.locale === "en-US";

  if (dayDelta === 0) return english ? "Today" : "今天";
  if (dayDelta === 1) return english ? "Tomorrow" : "明天";
  if (dayDelta === -1) return english ? "Yesterday" : "昨天";
  if (dayDelta > 1 && dayDelta <= 7) return english ? `In ${dayDelta} days` : `${dayDelta} 天後`;
  if (dayDelta < -1 && dayDelta >= -7) return english ? `${Math.abs(dayDelta)} days ago` : `${Math.abs(dayDelta)} 天前`;

  return formatDate(target, context);
}
