"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";

type LaunchResponse = {
  message?: string;
  ok: boolean;
  redirectUrl?: string;
  status: "ready" | "not_authenticated" | string;
};

export function ProSsoLaunchButton({
  className,
  fallbackHref = "https://ixai-website-clean.vercel.app/login",
}: {
  className?: string;
  fallbackHref?: string;
}) {
  const [status, setStatus] = useState<"idle" | "connecting" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleLaunch() {
    setStatus("connecting");
    setMessage(null);

    try {
      const headers = await getSupabaseAuthorizationHeaders();

      if (!headers) {
        setStatus("error");
        setMessage("請先登入 App，再開啟 IXAI Pro。");
        return;
      }

      const response = await fetch("/api/pro/launch", {
        cache: "no-store",
        headers,
        method: "POST",
      });
      const payload = (await response.json()) as LaunchResponse;

      if (!response.ok || !payload.ok || !payload.redirectUrl) {
        setStatus("error");
        setMessage(payload.message || "暫時無法連接 IXAI Pro，請稍後再試。");
        return;
      }

      window.location.href = payload.redirectUrl;
    } catch {
      setStatus("error");
      setMessage("暫時無法連接 IXAI Pro，請稍後再試。");
    }
  }

  return (
    <div className="grid gap-2">
      <button
        className={
          className ||
          "ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] disabled:cursor-wait disabled:opacity-75"
        }
        disabled={status === "connecting"}
        onClick={handleLaunch}
        type="button"
      >
        {status === "connecting" ? (
          <Loader2 className="h-4 w-4 animate-spin text-[var(--ixai-gold)]" aria-hidden="true" />
        ) : null}
        <span className="text-current">{status === "connecting" ? "正在連接 IXAI Pro" : "開啟 IXAI Pro"}</span>
        {status === "connecting" ? null : (
          <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        )}
      </button>

      {message ? (
        <p className="text-xs leading-5 text-amber-900">
          {message}{" "}
          <a className="font-semibold underline" href={fallbackHref} rel="noreferrer" target="_blank">
            使用 Pro 登入頁
          </a>
        </p>
      ) : null}
    </div>
  );
}
