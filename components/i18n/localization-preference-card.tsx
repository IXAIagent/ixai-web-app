"use client";

import type { ChangeEvent } from "react";
import { Globe2 } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { useLocale, useLocalization, useTranslation, type IXAICurrency, type IXAIRegion } from "@/src/lib/i18n";

export function LocalizationPreferenceCard() {
  const { locale, localeLabel } = useLocale();
  const { t } = useTranslation("settings");
  const {
    currency,
    currencyMetadata,
    currencyOptions,
    examples,
    region,
    regionMetadata,
    regionOptions,
    setCurrency,
    setRegion,
  } = useLocalization();

  function handleRegionChange(event: ChangeEvent<HTMLSelectElement>) {
    setRegion(event.target.value as IXAIRegion);
  }

  function handleCurrencyChange(event: ChangeEvent<HTMLSelectElement>) {
    setCurrency(event.target.value as IXAICurrency);
  }

  return (
    <section
      aria-label="Region and currency localization"
      className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Globe2} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              V13 Sprint 2
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              {t("localizationTitle")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {t("localizationBody")}
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:w-[28rem]">
          <label className="text-sm font-semibold text-[var(--ixai-forest)]">
            {t("regionSelectLabel")}
            <select
              aria-label="Select region"
              className="mt-2 min-h-11 w-full rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] outline-none transition focus:border-[var(--ixai-gold)]"
              onChange={handleRegionChange}
              value={region}
            >
              {regionOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-[var(--ixai-forest)]">
            {t("currencySelectLabel")}
            <select
              aria-label="Select currency"
              className="mt-2 min-h-11 w-full rounded-lg border border-[var(--ixai-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] outline-none transition focus:border-[var(--ixai-gold)]"
              onChange={handleCurrencyChange}
              value={currency}
            >
              {currencyOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.code} · {option.symbol}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          [t("currentLocale"), `${localeLabel} (${locale})`],
          [t("currentRegion"), `${regionMetadata.displayName} (${region})`],
          [t("currentCurrency"), `${currencyMetadata.displayName} (${currencyMetadata.symbol})`],
          [t("defaultTimezone"), regionMetadata.defaultTimezone],
          [t("marketLabel"), regionMetadata.marketLabel],
          ["Date style", regionMetadata.dateFormatStyle],
        ].map(([label, value]) => (
          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4" key={label}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">{label}</p>
            <p className="mt-2 break-words text-sm font-semibold text-[var(--ixai-forest)]">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-[var(--ixai-border)] bg-white/62 p-4">
          <p className="text-sm font-semibold text-[var(--ixai-forest)]">{t("supportedRegions")}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {regionOptions.map((option) => `${option.code} · ${option.displayName}`).join(" / ")}
          </p>
        </article>
        <article className="rounded-xl border border-[var(--ixai-border)] bg-white/62 p-4">
          <p className="text-sm font-semibold text-[var(--ixai-forest)]">{t("supportedCurrencies")}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {currencyOptions.map((option) => `${option.code} ${option.symbol}`).join(" / ")}
          </p>
        </article>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          [t("currencySelectLabel"), examples.currency],
          [t("compactCurrencyExample"), examples.compactCurrency],
          [t("numberExample"), examples.number],
          [t("percentExample"), examples.percent],
          [t("dateExample"), examples.date],
          [t("dateTimeExample"), examples.dateTime],
          [t("relativeDateExample"), examples.relativeDate],
        ].map(([label, value]) => (
          <article className="rounded-xl border border-[var(--ixai-border)] bg-white/62 p-4" key={label}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">{label}</p>
            <p className="mt-2 break-words font-mono text-sm font-semibold text-[var(--ixai-forest)]">{value}</p>
          </article>
        ))}
      </div>

      <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
        {t("localizationDisclaimer")}
      </p>
    </section>
  );
}
