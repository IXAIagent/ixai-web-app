import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import type { WorkspaceKpiItem } from "@/components/workspace/product/workspace-kpi-grid";

export type WorkspaceHeroAction = {
  href: string;
  icon?: LucideIcon;
  label: string;
  variant?: "primary" | "secondary";
};

export function WorkspaceProductHero({
  actions = [],
  eyebrow,
  kpis = [],
  side,
  summary,
  title,
}: {
  actions?: WorkspaceHeroAction[];
  eyebrow: string;
  kpis?: WorkspaceKpiItem[];
  side?: ReactNode;
  summary: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-4xl font-serif text-3xl font-semibold leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base">
            {summary}
          </p>
          {actions.length > 0 ? (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              {actions.map((action) => {
                const Icon = action.icon;
                const isSecondary = action.variant === "secondary";
                return (
                  <Link
                    className={
                      isSecondary
                        ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.055] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
                        : "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
                    }
                    href={action.href}
                    key={action.href}
                  >
                    {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
                    {action.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
        {side ? (
          <div className="rounded-lg border border-white/12 bg-white/[0.055] p-4">
            {side}
          </div>
        ) : null}
      </div>
      {kpis.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((item) => {
            const Icon = item.icon;
            return (
              <article className="rounded-lg border border-white/12 bg-white/[0.065] p-3.5" key={item.label}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-white/56">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                  </div>
                  {Icon ? (
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 bg-white/[0.075]">
                      <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                    </span>
                  ) : null}
                </div>
                {item.description ? (
                  <p className="mt-2 text-xs leading-5 text-white/58">{item.description}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
