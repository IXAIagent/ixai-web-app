"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, MessageCircle, Smartphone, Sparkles } from "lucide-react";
import { LineLoginButton } from "@/components/line/line-login-button";
import { ShellCard, ShellStatusPill } from "@/components/shell/shell-primitives";
import { trackEvent } from "@/src/lib/analytics/analytics";

export function LiffEntryCard({
  liffId,
  lineLoginReady,
  liffReady,
  officialAccountUrl,
}: {
  liffId: string | null;
  lineLoginReady: boolean;
  liffReady: boolean;
  officialAccountUrl: string | null;
}) {
  const isLineInApp = useMemo(() => {
    if (typeof navigator === "undefined") {
      return false;
    }
    return /Line/i.test(navigator.userAgent);
  }, []);

  useEffect(() => {
    trackEvent("liff_open", {
      line_connected: false,
      path: window.location.pathname,
      source: "liff_page",
    });
    if (liffReady) {
      trackEvent("liff_ready", {
        line_connected: false,
        path: window.location.pathname,
        source: "liff_page",
      });
    }
  }, [liffReady]);

  return (
    <ShellCard className="border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)]" tone="light">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ShellStatusPill icon={Smartphone}>LIFF Foundation</ShellStatusPill>
            {liffReady ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-emerald-700">
                <CheckCircle2 className="h-3 w-3 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
                <span className="translate-y-px">LIFF ready</span>
              </span>
            ) : null}
          </div>
          <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight text-[var(--ixai-forest)] sm:text-4xl">
            LINE 入口與 IXAI identity restore 基礎。
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            此頁是 IXAI 未來 LINE in-app browser / LIFF 入口。現階段不推播訊息，
            不做聊天機器人流程，只建立 LINE Login 與 unified identity readiness。
          </p>
          <div className="mt-4 grid gap-2 text-xs leading-5 text-[var(--ixai-forest-soft)] sm:grid-cols-3">
            {[
              ["LINE in-app", isLineInApp ? "detected" : "browser"],
              ["LIFF ID", liffId ? "configured" : "pending"],
              ["LINE Login", lineLoginReady ? "ready" : "pending"],
            ].map(([label, value]) => (
              <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3" key={label}>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                  {label}
                </p>
                <p className="mt-1 font-semibold text-[var(--ixai-forest)]">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-56">
          <LineLoginButton disabled={!lineLoginReady} source="liff_entry" />
          {officialAccountUrl ? (
            <Link
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-3 py-2 text-xs font-semibold text-[var(--ixai-forest)]"
              href={officialAccountUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
              <span className="translate-y-px">開啟 LINE OA</span>
            </Link>
          ) : null}
        </div>
      </div>
      <div className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
        <div className="flex items-start gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
          <Sparkles className="mt-1 h-4 w-4 shrink-0 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
          <p>
            成功登入後，IXAI 會回復 identity session、合併 LINE identity bridge，並顯示
            LINE connected / unified identity ready / intelligence sync ready。
          </p>
        </div>
      </div>
    </ShellCard>
  );
}
