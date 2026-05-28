"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Link2, MessageCircle, ShieldCheck } from "lucide-react";
import { useIdentitySession } from "@/components/auth/identity-provider";
import { LineLoginButton } from "@/components/line/line-login-button";
import { ShellCard, ShellStatusPill } from "@/components/shell/shell-primitives";
import { trackEvent } from "@/src/lib/analytics/analytics";

type ConnectResponse = {
  connect?: {
    expiresAt?: string | null;
    linkToken?: string | null;
    lineOfficialAccountUrl?: string | null;
    status?: "connected" | "pending";
  };
  intelligence_sync_ready?: boolean;
  line_connected?: boolean;
  ok?: boolean;
  status?: "connected" | "pending";
};

export function ConnectLineCard({
  source = "line_connect_card",
  tone = "light",
}: {
  source?: string;
  tone?: "dark" | "light";
}) {
  const { identity, intelligenceSyncReady, lineConnected, membership, refresh, state } =
    useIdentitySession();
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState("");
  const [lineUrl, setLineUrl] = useState<string | null>(null);
  const [pendingUntil, setPendingUntil] = useState<string | null>(null);
  const connected = lineConnected || intelligenceSyncReady;
  const isDark = tone === "dark";

  useEffect(() => {
    trackEvent("line_connect_view", {
      line_connected: connected,
      membership: membership?.plan ?? "anonymous",
      path: window.location.pathname,
      source,
    });
  }, [connected, membership?.plan, source]);

  async function connectLine() {
    setConnecting(true);
    setMessage("");
    trackEvent("line_connect_click", {
      line_connected: connected,
      membership: membership?.plan ?? "anonymous",
      path: window.location.pathname,
      source,
    });

    try {
      const response = await fetch("/api/line/connect", {
        body: JSON.stringify({ source }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as ConnectResponse;

      if (!response.ok || !payload.ok) {
        throw new Error("line_connect_failed");
      }

      setLineUrl(payload.connect?.lineOfficialAccountUrl ?? null);
      setPendingUntil(payload.connect?.expiresAt ?? null);

      if (payload.status === "connected" || payload.line_connected) {
        trackEvent("line_identity_merged", {
          line_connected: true,
          membership: membership?.plan ?? "free",
          path: window.location.pathname,
          source,
        });
        setMessage("LINE 已連接，Intelligence Sync Ready。");
      } else {
        trackEvent("line_connect_pending", {
          line_connected: false,
          membership: membership?.plan ?? "free",
          path: window.location.pathname,
          source,
        });
        setMessage("LINE 連接流程已建立。正式 LINE Login / LIFF 串接將於後續版本完成。");
      }

      await refresh();
    } catch {
      setMessage("目前無法建立 LINE 連接流程，請稍後再試。");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <ShellCard
      className={
        isDark
          ? "border-white/10 bg-white/[0.04]"
          : "border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.84)]"
      }
      tone={tone}
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ShellStatusPill icon={MessageCircle}>LINE Intelligence Sync</ShellStatusPill>
            {connected ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-emerald-200/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-emerald-100">
                <CheckCircle2 className="h-3 w-3 stroke-current text-[var(--ixai-gold)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
                <span className="translate-y-px">LINE connected</span>
              </span>
            ) : null}
          </div>
          <h2
            className={`mt-3 text-lg font-semibold leading-7 ${
              isDark ? "text-[var(--ixai-cream)]" : "text-[var(--ixai-forest)]"
            }`}
          >
            {connected ? "LINE 已連接，情報同步基礎已就緒。" : "連接 LINE，建立未來情報同步基礎。"}
          </h2>
          <p
            className={`mt-2 text-sm leading-7 ${
              isDark ? "text-zinc-400" : "text-[var(--ixai-forest-soft)]"
            }`}
          >
            IXAI 會先合併 identity session、會員狀態與 LINE 連接狀態。未來 AI alerts、
            Daily Brief 與 Pro intelligence delivery 需使用者明確 opt-in。
          </p>
          {identity?.normalized_email ? (
            <p
              className={`mt-2 break-all font-mono text-xs ${
                isDark ? "text-zinc-400/80" : "text-[var(--ixai-ink-muted)]"
              }`}
            >
              {identity.normalized_email}
            </p>
          ) : null}
          {message ? (
            <p
              className={`mt-3 rounded-lg border p-3 text-xs leading-5 ${
                isDark
                  ? "border-white/10 bg-white/[0.035] text-zinc-300"
                  : "border-[var(--ixai-border)] bg-white/45 text-[var(--ixai-forest-soft)]"
              }`}
            >
              {message}
              {pendingUntil ? ` 有效至 ${new Date(pendingUntil).toLocaleString("zh-TW")}` : ""}
            </p>
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-48">
          {state === "anonymous" ? (
            <>
              <LineLoginButton source={source} />
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-semibold leading-none text-current transition hover:bg-white/10"
                href="/pro-preview"
              >
                <ShieldCheck className="h-4 w-4 stroke-current text-[var(--ixai-gold)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
                <span className="translate-y-px">先建立 identity session</span>
              </Link>
            </>
          ) : (
            <button
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[rgba(176,141,87,0.45)] bg-[var(--ixai-gold)] px-4 py-2.5 text-sm font-semibold leading-none text-[var(--ixai-forest)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:saturate-75"
              disabled={connecting || connected}
              onClick={() => void connectLine()}
              type="button"
            >
              <Link2 className="h-4 w-4 stroke-current text-[var(--ixai-forest)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
              <span className="translate-y-px">
                {connected ? "LINE 已連接" : connecting ? "建立中" : "Connect LINE"}
              </span>
            </button>
          )}
          {lineUrl ? (
            <Link
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-3 py-2 text-xs font-semibold leading-none text-current transition hover:bg-white/10"
              href={lineUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="translate-y-px">開啟 LINE Official Account</span>
              <ArrowUpRight className="h-3.5 w-3.5 stroke-current text-[var(--ixai-gold)] opacity-100" aria-hidden="true" strokeWidth={2.25} />
            </Link>
          ) : null}
        </div>
      </div>
    </ShellCard>
  );
}
