"use client";

import { ArrowUpRight, CheckCircle2, MessageCircle } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import { LINE_CONSULTATION_URL } from "@/src/lib/line/public-links";

// v1.34 — LINE Official Account gateway.
// v1.36.4 — adds an optional `connected` state for the future LINE
// identity bridge so consumers can mark a subscriber as already linked.
// v1.39.2 — switches off the env-driven NEXT_PUBLIC_LINE_OA_URL fallback
// in favour of the centralized LINE_CONSULTATION_URL constant. The
// public consultation CTA is now always available; the "Coming soon"
// disabled state was a historical placeholder we no longer need.

export function LineOaGateway({
  surface = "home",
  variant = "card",
  connected = false,
}: {
  surface?: string;
  variant?: "card" | "inline";
  connected?: boolean;
}) {
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
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)] opacity-100">
          <MessageCircle className="h-4 w-4 stroke-current text-[var(--ixai-gold)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
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

      {connected ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-200/35 bg-emerald-300/[0.10] px-4 py-2.5 text-sm font-semibold text-emerald-100">
            <CheckCircle2 className="h-4 w-4 stroke-current text-[var(--ixai-gold)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
            LINE connected
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-ink-muted)]">
            LINE intelligence sync coming soon
          </span>
        </div>
      ) : (
        <a
          className="ixai-cta-forest mt-4 inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
          href={LINE_CONSULTATION_URL}
          onClick={handleClick}
          rel="noopener noreferrer"
          target="_blank"
        >
          加入 LINE 諮詢
          <ArrowUpRight className="h-4 w-4 stroke-current text-[var(--ixai-gold)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
        </a>
      )}

      <p className="mt-3 text-[11px] leading-5 text-[var(--ixai-ink-muted)]">
        LINE OA push is opt-in; messages are educational intelligence — no buy / sell instructions.
      </p>
    </section>
  );
}
