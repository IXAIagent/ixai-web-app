import {
  DEFAULT_CURRENCY,
  normalizeCurrency,
  type IXAICurrency,
} from "@/src/lib/i18n/currencies";
import {
  DEFAULT_REGION,
  normalizeRegion,
  type IXAIRegion,
} from "@/src/lib/i18n/regions";

export const IXAI_CURRENCY_COOKIE = "ixai.currency";
export const IXAI_CURRENCY_EVENT = "ixai:currency-change";
export const IXAI_CURRENCY_STORAGE_KEY = "ixai.currency";
export const IXAI_REGION_COOKIE = "ixai.region";
export const IXAI_REGION_EVENT = "ixai:region-change";
export const IXAI_REGION_STORAGE_KEY = "ixai.region";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function canUseDOM() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function readCookieValue(name: string) {
  if (!canUseDOM()) return null;

  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function writeCookieValue(name: string, value: string) {
  if (!canUseDOM()) return;

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function readStorageValue(key: string) {
  if (!canUseDOM()) return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageValue(key: string, value: string) {
  if (!canUseDOM()) return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preference storage is best-effort; cookie remains the secondary source.
  }
}

export function getStoredRegion(): IXAIRegion {
  return normalizeRegion(readStorageValue(IXAI_REGION_STORAGE_KEY) ?? readCookieValue(IXAI_REGION_COOKIE) ?? DEFAULT_REGION);
}

export function getStoredCurrency(): IXAICurrency {
  return normalizeCurrency(readStorageValue(IXAI_CURRENCY_STORAGE_KEY) ?? readCookieValue(IXAI_CURRENCY_COOKIE) ?? DEFAULT_CURRENCY);
}

export function setStoredRegion(nextRegion: IXAIRegion) {
  const region = normalizeRegion(nextRegion);
  writeStorageValue(IXAI_REGION_STORAGE_KEY, region);
  writeCookieValue(IXAI_REGION_COOKIE, region);

  if (canUseDOM()) {
    window.dispatchEvent(new CustomEvent(IXAI_REGION_EVENT, { detail: { region } }));
  }
}

export function setStoredCurrency(nextCurrency: IXAICurrency) {
  const currency = normalizeCurrency(nextCurrency);
  writeStorageValue(IXAI_CURRENCY_STORAGE_KEY, currency);
  writeCookieValue(IXAI_CURRENCY_COOKIE, currency);

  if (canUseDOM()) {
    window.dispatchEvent(new CustomEvent(IXAI_CURRENCY_EVENT, { detail: { currency } }));
  }
}

export function subscribeToLocalization(callback: () => void) {
  if (!canUseDOM()) return () => {};

  function handleStorage(event: StorageEvent) {
    if (event.key === IXAI_REGION_STORAGE_KEY || event.key === IXAI_CURRENCY_STORAGE_KEY) {
      callback();
    }
  }

  window.addEventListener(IXAI_REGION_EVENT, callback);
  window.addEventListener(IXAI_CURRENCY_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(IXAI_REGION_EVENT, callback);
    window.removeEventListener(IXAI_CURRENCY_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}
