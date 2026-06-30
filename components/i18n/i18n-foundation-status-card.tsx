"use client";

import { Languages } from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { useTranslation } from "@/src/lib/i18n";

export function I18nFoundationStatusCard() {
  const { localeLabel, t } = useTranslation("workspace");

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Languages} size="sm" shadow={false} />
          <div>
            <p className="text-sm font-semibold text-[var(--ixai-forest)]">
              {t("localeCardTitle")}
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {t("localeCardBody")}
            </p>
            <p className="mt-2 text-xs font-semibold text-[var(--ixai-forest-soft)]">
              {localeLabel}
            </p>
          </div>
        </div>
        <div className="w-full md:w-72">
          <LanguageSwitcher mode="full" />
        </div>
      </div>
    </section>
  );
}
