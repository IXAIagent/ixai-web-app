import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type WorkspaceLink = {
  href: string;
  label: string;
};

export type WorkspacePlaceholderProps = {
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  links?: WorkspaceLink[];
  ownerItems: string[];
  title: string;
};

export function WorkspacePlaceholder({
  description,
  eyebrow,
  icon: Icon,
  links = [],
  ownerItems,
  title,
}: WorkspacePlaceholderProps) {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                {eyebrow}
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                {description}
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/15 bg-white/[0.07] text-[var(--ixai-gold)]">
              <Icon className="h-7 w-7" aria-hidden="true" />
            </div>
          </div>

          {links.length > 0 ? (
            <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
              {links.map((link) => (
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <section className="rounded-2xl border border-[rgba(9,41,31,0.12)] bg-white/80 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ownerItems.map((item) => (
              <article
                className="flex min-w-0 gap-3 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
                key={item}
              >
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ixai-gold)]"
                  aria-hidden="true"
                />
                <p className="text-sm leading-6 text-[var(--ixai-forest-soft)]">{item}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 border-t border-[rgba(9,41,31,0.10)] pt-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            v3.00 只建立 UX / IA route foundation。此頁為 workspace placeholder，不新增投資功能、
            broker integration、market data provider、AI provider、schema、auth 或 recommendation logic。
          </p>
        </section>
      </section>
    </main>
  );
}
