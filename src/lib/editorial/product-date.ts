const PRODUCT_TIMEZONE = "Asia/Taipei";

export function getProductDateKey(
  date: Date = new Date(),
  timeZone = PRODUCT_TIMEZONE,
) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function getDailyIntelligenceSlugDate(date: Date = new Date()) {
  return getProductDateKey(date);
}

export function buildDailyIntelligenceSlug(date: Date = new Date(), suffix?: string) {
  const baseSlug = `daily-intelligence-${getDailyIntelligenceSlugDate(date)}`;
  return suffix ? `${baseSlug}-${suffix}` : baseSlug;
}

