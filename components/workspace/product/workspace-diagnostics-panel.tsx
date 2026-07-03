"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function WorkspaceDiagnosticsPanel({
  children,
  defaultOpen = false,
  description = "Health、Provider、Localization、Runtime",
  title = "Advanced / 進階診斷",
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description?: string;
  title?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3 sm:p-4">
      <details
        className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4 text-[var(--ixai-forest)] sm:p-5"
        onToggle={(event) => setIsOpen(event.currentTarget.open)}
        open={isOpen}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
          <span>
            {title}
            <span className="ml-2 text-xs font-normal text-[var(--ixai-forest-soft)]">
              {description}
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
