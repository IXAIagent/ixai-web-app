import type { ReactNode } from "react";

export function WorkspaceProductSection({
  action,
  children,
  description,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_18px_48px_rgba(9,41,31,0.05)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)] sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
