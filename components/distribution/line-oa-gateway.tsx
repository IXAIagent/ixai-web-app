"use client";

import { ArrowUpRight, MessageCircle } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";

// v1.34 — LINE Official Account gateway. Reads NEXT_PUBLIC_LINE_OA_URL
// at module scope (Next inlines NEXT_PUBLIC_* values into the client
// bundle) so we never hardcode the LINE link. Until that env is set the
// CTA renders a "Coming soon" disabled state.

const LINE_OA_URL = process.env.NEXT_PUBLIC_LINE_OA_URL?.trim() ?? "";

export function LineOaGateway({
  surface = "home",
  variant = "card",
}: {
  surface?: string;
  variant?: "card" | "inline";
}) {
  const isEnabled = LINE_OA_URL.length > 0;

  function handleClick() {
    trackEvent("line_oa_click", { surface });
  }

  const wrapperClass =
    variant === "card"
      ? "rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-6"
      : "rounded-2xl border border-[var(--ixai-border)] bg-white/55 p-3.5 sm:p-4";

  return (
    <section className={wrapperClass}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          LINE Intelligence
        </p>
      </div>
      <h2 className="mt-3 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
        加入 IXAI LINE 官方帳號。
      </h2>
      <ul className="mt-3 grid gap-1.5 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        <li>Receive daily intelligence。</li>
        <li>Receive weekly intelligence。</li>
        <li>Future IXAI Pro alerts（不發送買賣指令）。</li>
      </ul>

      {isEnabled ? (
        <a
          className="ixai-cta-forest mt-4 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
          href={LINE_OA_URL}
          onClick={handleClick}
          rel="noopener noreferrer"
          target="_blank"
        >
          Open LINE OA
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : (
        <button
          aria-disabled="true"
          className="mt-4 inline-flex min-h-11 w-fit cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/45 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-ink-muted)]"
          disabled
          type="button"
        >
          Coming soon
        </button>
      )}

      <p className="mt-3 text-[11px] leading-5 text-[var(--ixai-ink-muted)]">
        LINE OA push is opt-in; messages are educational intelligence — no buy / sell instructions.
      </p>
    </section>
  );
}
