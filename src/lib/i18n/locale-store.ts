import {
  DEFAULT_LOCALE,
  normalizeLocale,
  type IXAILocale,
} from "@/src/lib/i18n/locales";

export const IXAI_LOCALE_COOKIE = "ixai.locale";
export const IXAI_LOCALE_EVENT = "ixai:locale-change";
export const IXAI_LOCALE_STORAGE_KEY = "ixai.locale";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function canUseDOM() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function readCookieLocale(): IXAILocale | null {
  if (!canUseDOM()) {
    return null;
  }

  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${IXAI_LOCALE_COOKIE}=`));

  if (!match) {
    return null;
  }

  return normalizeLocale(decodeURIComponent(match.split("=").slice(1).join("=")));
}

function writeCookieLocale(locale: IXAILocale) {
  if (!canUseDOM()) {
    return;
  }

  document.cookie = `${IXAI_LOCALE_COOKIE}=${encodeURIComponent(locale)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function readStorageLocale(): IXAILocale | null {
  if (!canUseDOM()) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(IXAI_LOCALE_STORAGE_KEY);
    return stored ? normalizeLocale(stored) : null;
  } catch {
    return null;
  }
}

function writeStorageLocale(locale: IXAILocale) {
  if (!canUseDOM()) {
    return;
  }

  try {
    window.localStorage.setItem(IXAI_LOCALE_STORAGE_KEY, locale);
  } catch {
    // Locale storage is best-effort; cookie remains the secondary source.
  }
}

export function getStoredLocale(): IXAILocale {
  return readStorageLocale() ?? readCookieLocale() ?? DEFAULT_LOCALE;
}

export function setStoredLocale(nextLocale: IXAILocale) {
  const locale = normalizeLocale(nextLocale);
  writeStorageLocale(locale);
  writeCookieLocale(locale);

  if (canUseDOM()) {
    window.dispatchEvent(new CustomEvent(IXAI_LOCALE_EVENT, { detail: { locale } }));
  }
}

export function subscribeToLocale(callback: () => void) {
  if (!canUseDOM()) {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === IXAI_LOCALE_STORAGE_KEY) {
      callback();
    }
  }

  window.addEventListener(IXAI_LOCALE_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(IXAI_LOCALE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}
