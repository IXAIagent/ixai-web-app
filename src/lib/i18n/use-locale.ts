"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getDictionary } from "@/src/lib/i18n/dictionaries";
import {
  DEFAULT_LOCALE,
  getLocaleLabel,
  normalizeLocale,
  type IXAILocale,
} from "@/src/lib/i18n/locales";
import {
  getStoredLocale,
  setStoredLocale,
  subscribeToLocale,
} from "@/src/lib/i18n/locale-store";

function getServerSnapshot(): IXAILocale {
  return DEFAULT_LOCALE;
}

export function useLocale() {
  const locale: IXAILocale = useSyncExternalStore(
    subscribeToLocale,
    getStoredLocale,
    getServerSnapshot,
  );
  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  return {
    dictionary,
    locale,
    localeLabel: getLocaleLabel(locale),
    setLocale(nextLocale: IXAILocale) {
      setStoredLocale(normalizeLocale(nextLocale));
    },
  };
}
