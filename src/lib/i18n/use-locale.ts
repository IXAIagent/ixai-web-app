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
  getDictionary,
  translate,
  type Dictionary,
  type I18NNamespace,
} from "@/src/lib/i18n/dictionaries";
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

type LocaleContextValue = {
  dictionary: Dictionary;
  locale: IXAILocale;
  localeLabel: string;
  setLocale: (nextLocale: IXAILocale) => void;
  t: (namespace: I18NNamespace, key: string, fallback?: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function useLocaleStoreValue(): LocaleContextValue {
  const locale: IXAILocale = useSyncExternalStore(
    subscribeToLocale,
    getStoredLocale,
    getServerSnapshot,
  );
  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  return useMemo(() => ({
    dictionary,
    locale,
    localeLabel: getLocaleLabel(locale),
    setLocale(nextLocale: IXAILocale) {
      setStoredLocale(normalizeLocale(nextLocale));
    },
    t(namespace: I18NNamespace, key: string, fallback?: string) {
      return translate(dictionary, namespace, key, fallback);
    },
  }), [dictionary, locale]);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const value = useLocaleStoreValue();

  return createElement(LocaleContext.Provider, { value }, children);
}

export function useLocale() {
  const contextValue = useContext(LocaleContext);
  const fallbackValue = useLocaleStoreValue();

  return contextValue ?? fallbackValue;
}

export function useTranslation(namespace?: I18NNamespace) {
  const localeContext = useLocale();

  return {
    ...localeContext,
    t(key: string, fallback?: string) {
      if (!namespace) {
        return key;
      }

      return localeContext.t(namespace, key, fallback);
    },
    tGlobal: localeContext.t,
  };
}
