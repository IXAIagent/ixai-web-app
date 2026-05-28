import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

export const shellTokens = {
  adminSidebarWidth: "w-64",
  borderRadius: "rounded-lg",
  cardPadding: "p-4 sm:p-5",
  containerMaxWidth: "max-w-7xl",
  iconSize: "h-4 w-4",
  mutedText: "text-zinc-400",
  navItemHeight: "min-h-10",
  publicSidebarWidth: "w-56",
  sectionGap: "gap-4",
} as const;

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean;
  strokeWidth?: number;
}>;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ShellSidebarSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-1.5">
      <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]/80">
        {title}
      </p>
      <div className="grid gap-1">{children}</div>
    </section>
  );
}

export function ShellNavButton({
  active = false,
  external = false,
  href,
  icon: Icon,
  label,
  onClick,
}: {
  active?: boolean;
  external?: boolean;
  href: string;
  icon?: IconComponent;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      className={cx(
        "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs leading-none transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ixai-gold)]/60",
        active
          ? "bg-white/10 text-emerald-100"
          : "text-zinc-400/90 hover:bg-white/[0.06] hover:text-emerald-100",
      )}
      href={href}
      onClick={onClick}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0 stroke-current" aria-hidden /> : null}
      <span className="translate-y-px truncate">{label}</span>
    </Link>
  );
}

export function ShellCard({
  children,
  className,
  tone = "dark",
}: {
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <section
      className={cx(
        "min-w-0 max-w-full rounded-lg border p-4 sm:p-5",
        tone === "dark"
          ? "border-white/10 bg-white/[0.04] text-[var(--ixai-cream)]"
          : "border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] text-[var(--ixai-forest)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function ShellHeader({
  action,
  children,
  eyebrow,
  subtitle,
  title,
}: {
  action?: ReactNode;
  children?: ReactNode;
  eyebrow: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-cream)]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{subtitle}</p>
        ) : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function ShellMetricCard({
  icon: Icon,
  label,
  suffix = "",
  value,
}: {
  icon: IconComponent;
  label: string;
  suffix?: string;
  value: number | string;
}) {
  const displayValue =
    typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value;

  return (
    <article className="min-w-0 rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <div className="flex min-h-4 items-center gap-2 font-mono text-[11px] uppercase leading-none tracking-[0.18em] text-[var(--ixai-gold)]">
        <Icon className="h-3.5 w-3.5 shrink-0 stroke-current" aria-hidden />
        <span className="translate-y-px truncate">{label}</span>
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold leading-none text-[var(--ixai-cream)]">
        {displayValue}
        {suffix}
      </p>
    </article>
  );
}

export function ShellStatusPill({
  children,
  icon: Icon,
}: {
  children: ReactNode;
  icon?: IconComponent;
}) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase leading-none tracking-[0.18em] text-[var(--ixai-gold)]">
      {Icon ? (
        <Icon className="h-3 w-3 shrink-0" aria-hidden />
      ) : null}
      <span className="translate-y-px">{children}</span>
    </span>
  );
}
