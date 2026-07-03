import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function WorkspaceDiagnosticsPanel({
  children,
  description = "Health、Provider、Localization、Runtime",
  title = "Advanced / 進階診斷",
}: {
  children: ReactNode;
  description?: string;
  title?: string;
}) {
  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3 sm:p-4">
      <details className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4 text-[var(--ixai-forest)] sm:p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
          <span>
            {title}
            <span className="ml-2 text-xs font-normal text-[var(--ixai-forest-soft)]">
              {description}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </summary>
        <div className="mt-4 grid gap-4">{children}</div>
      </details>
    </section>
  );
}
