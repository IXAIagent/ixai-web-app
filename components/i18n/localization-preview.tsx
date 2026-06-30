"use client";

import { useLocalization } from "@/src/lib/i18n";

type LocalizationPreviewProps = {
  tone?: "dark" | "light";
};

export function LocalizationPreview({ tone = "light" }: LocalizationPreviewProps) {
  const { currency, examples, region, regionMetadata } = useLocalization();
  const isDark = tone === "dark";

  return (
    <div
      className={
        isDark
          ? "rounded-lg border border-white/10 bg-white/[0.045] p-3 text-xs leading-5 text-white/66"
          : "rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]"
      }
    >
      <p className={isDark ? "font-semibold text-[var(--ixai-cream)]" : "font-semibold text-[var(--ixai-forest)]"}>
        Localization: {region} · {currency} · {regionMetadata.defaultTimezone}
      </p>
      <p className="mt-1">
        {examples.currency} / {examples.percent} / {examples.date}
      </p>
    </div>
  );
}
