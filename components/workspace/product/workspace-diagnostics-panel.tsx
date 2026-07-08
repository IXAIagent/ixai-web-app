"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { useTranslation } from "@/src/lib/i18n";

export function WorkspaceDiagnosticsPanel({
  children,
  defaultOpen = false,
  description,
  title,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description?: string;
  title?: string;
}) {
  const { t } = useTranslation("productPolish");
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const displayTitle = title ?? t("advancedPanelTitle", "Advanced / 進階資訊");
  const displayDescription = description ?? t("advancedPanelDescription", "僅供進階檢查");

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3 sm:p-4">
      <details
        className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4 text-[var(--ixai-forest)] sm:p-5"
        onToggle={(event) => setIsOpen(event.currentTarget.open)}
        open={isOpen}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
          <span>
            {displayTitle}
            <span className="ml-2 text-xs font-normal text-[var(--ixai-forest-soft)]">
              {displayDescription}
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[var(--ixai-gold)] transition ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </summary>
        {isOpen ? <div className="mt-4 grid gap-4">{children}</div> : null}
      </details>
    </section>
  );
}
