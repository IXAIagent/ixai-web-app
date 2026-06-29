"use client";

import type { ChangeEvent } from "react";
import { Languages } from "lucide-react";
import {
  LOCALE_OPTIONS,
  type IXAILocale,
  useLocale,
} from "@/src/lib/i18n";

type LanguageSwitcherProps = {
  mode?: "compact" | "full";
};

export function LanguageSwitcher({ mode = "compact" }: LanguageSwitcherProps) {
  const { dictionary, locale, localeLabel, setLocale } = useLocale();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setLocale(event.target.value as IXAILocale);
  }

  if (mode === "full") {
    return (
      <div className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-white/60 p-3">
        <label
          className="flex items-center gap-2 text-sm font-semibold text-[var(--ixai-forest)]"
          htmlFor="ixai-language-switcher-full"
        >
          <Languages className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {dictionary.language.fullLabel}
        </label>
        <select
          aria-label="Change language"
          className="mt-3 min-h-11 w-full rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] outline-none transition focus:border-[var(--ixai-gold)]"
          id="ixai-language-switcher-full"
          onChange={handleChange}
          value={locale}
        >
          {LOCALE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs font-semibold text-[var(--ixai-forest)]">
          {dictionary.language.currentLabel}: {localeLabel}
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--ixai-forest-soft)]">
          {dictionary.language.helper}
        </p>
      </div>
    );
  }

  return (
    <label className="flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-[rgba(245,240,230,0.72)]">
      <Languages className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
      <span className="sr-only">Change language</span>
      <span aria-hidden="true" className="font-mono uppercase tracking-[0.14em]">
        {dictionary.language.compactLabel}
      </span>
      <select
        aria-label="Change language"
        className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-[var(--ixai-cream)] outline-none"
        onChange={handleChange}
        value={locale}
      >
        {LOCALE_OPTIONS.map((option) => (
          <option className="text-[var(--ixai-forest)]" key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="sr-only">{`${dictionary.language.currentLabel}: ${localeLabel}`}</span>
    </label>
  );
}
