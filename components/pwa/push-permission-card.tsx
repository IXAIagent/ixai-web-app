"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BellOff, BellRing, ShieldAlert, Sparkles } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/events";

type PermissionState = "unsupported" | "default" | "granted" | "denied" | "unknown";

function readPermission(): PermissionState {
  if (typeof window === "undefined") {
    return "unknown";
  }

  if (typeof Notification === "undefined") {
    return "unsupported";
  }

  const permission = Notification.permission;

  if (permission === "granted" || permission === "denied" || permission === "default") {
    return permission;
  }

  return "unknown";
}

export function PushPermissionCard({ compact = false }: { compact?: boolean }) {
  // SSR renders the neutral "unknown" frame so hydration matches; the real
  // permission state is read after mount.
  const [state, setState] = useState<PermissionState>("unknown");
  const [isRequesting, setIsRequesting] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setState(readPermission());
    }, 0);

    return () => {
      window.clearTimeout(handle);
    };
  }, []);

  const handleRequest = useCallback(async () => {
    if (state !== "default") {
      return;
    }

    if (typeof Notification === "undefined") {
      setState("unsupported");
      return;
    }

    setIsRequesting(true);
    setFeedback("");

    try {
      const result = await Notification.requestPermission();
      setState(result === "granted" ? "granted" : result === "denied" ? "denied" : "default");

      if (result === "granted") {
        setFeedback("已啟用 IXAI 市場通知。你可以在通知設定調整類別。");
        trackEvent("push_enable", { surface: "push_permission_card" });
      } else if (result === "denied") {
        setFeedback("通知已被瀏覽器封鎖。可至瀏覽器設定重新開啟。");
        trackEvent("push_denied", { surface: "push_permission_card" });
      }
    } catch {
      setFeedback("此瀏覽器目前無法授權通知，可稍後再試。");
    } finally {
      setIsRequesting(false);
    }
  }, [state]);

  const padding = compact ? "p-4 sm:p-5" : "p-5 sm:p-6";
  const radius = "rounded-2xl";
  const wrapperClass = `${radius} border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.18)] ${padding}`;

  if (state === "unsupported") {
    return (
      <section className={wrapperClass}>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/[0.06] text-[var(--ixai-gold)]">
            <BellOff className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              IXAI 通知
            </p>
            <h3 className="mt-2 text-base font-semibold leading-6 sm:text-lg">
              此瀏覽器尚未支援桌面通知。
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/64">
              你仍可以閱讀 Daily Brief、Market Intelligence 與 FCN Education Hub；通知層會於支援的環境逐步開放。
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (state === "granted") {
    return (
      <section className={wrapperClass}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 bg-[rgba(176,141,87,0.18)] text-[var(--ixai-gold)]">
              <BellRing className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
                IXAI 通知已啟用
              </p>
              <h3 className="mt-2 text-base font-semibold leading-6 sm:text-lg">
                你會在重大市場訊號發布時收到通知。
              </h3>
              <p className="mt-2 text-sm leading-7 text-white/64">
                可在通知設定調整 Daily Brief、市場風險、台股 AI、Crypto 與 IXAI Pro 等類別。
              </p>
            </div>
          </div>
          <Link
            className="ixai-cta-cream inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
            href="/settings/notifications"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            通知設定
          </Link>
        </div>
      </section>
    );
  }

  if (state === "denied") {
    return (
      <section className={wrapperClass}>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/[0.06] text-[var(--ixai-gold)]">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              IXAI 通知
            </p>
            <h3 className="mt-2 text-base font-semibold leading-6 sm:text-lg">
              通知已被封鎖，請至瀏覽器設定開啟。
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/64">
              iPhone Safari：設定 → Safari → 通知 → 允許。
              Chrome：網址列鎖頭 → 通知 → 允許。
            </p>
          </div>
        </div>
      </section>
    );
  }

  // default (or unknown during SSR — both render the prompt-style card so
  // the hydrated default state shows the same shape).
  const isPending = state === "unknown";

  return (
    <section className={wrapperClass}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 bg-[rgba(176,141,87,0.18)] text-[var(--ixai-gold)]">
            <BellRing className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              IXAI 通知
            </p>
            <h3 className="mt-2 text-base font-semibold leading-6 sm:text-lg">
              開啟 IXAI 市場通知。
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/64">
              接收每日市場摘要、重大風險與市場 Intelligence 更新。你可以隨時在通知設定關閉。
            </p>
            {feedback ? (
              <p className="mt-2 text-xs leading-6 text-[var(--ixai-gold)]">{feedback}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <button
            className="ixai-cta-cream inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || isRequesting}
            onClick={handleRequest}
            type="button"
          >
            <BellRing className="h-4 w-4" aria-hidden="true" />
            {isRequesting ? "處理中..." : "允許通知"}
          </button>
          <Link
            className="text-xs leading-6 text-white/56 underline-offset-4 hover:underline"
            href="/settings/notifications"
          >
            管理通知類別
          </Link>
        </div>
      </div>
    </section>
  );
}
