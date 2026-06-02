"use client";

import { LogIn, MessageCircle } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";

export function LineLoginButton({
  className = "",
  disabled = false,
  label = "使用 LINE 繼續",
  source = "line_login_button",
}: {
  className?: string;
  disabled?: boolean;
  label?: string;
  source?: string;
}) {
  if (disabled) {
    return (
      <button
        className={`inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/35 px-4 py-2.5 text-sm font-semibold leading-none text-[var(--ixai-forest-soft)] ${className}`}
        disabled
        type="button"
      >
        <MessageCircle className="h-4 w-4 stroke-current text-[var(--ixai-gold)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
        <span className="translate-y-px">LINE Login 尚未設定</span>
      </button>
    );
  }

  return (
    <a
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.45)] bg-[var(--ixai-gold)] px-4 py-2.5 text-sm font-semibold leading-none text-[var(--ixai-forest)] transition hover:brightness-105 ${className}`}
      href="/api/line/login"
      onClick={() =>
        trackEvent("line_login_open", {
          path: window.location.pathname,
          source,
        })
      }
    >
      <LogIn className="h-4 w-4 stroke-current text-[var(--ixai-forest)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
      <span className="translate-y-px">{label}</span>
    </a>
  );
}
