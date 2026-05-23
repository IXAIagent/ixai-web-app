"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useIdentity } from "@/components/auth/auth-provider";
import {
  loadUserProfile,
  saveUserProfile,
  type IxaiUserProfile,
} from "@/src/lib/account/profile";
import { trackEvent } from "@/src/lib/analytics/events";

export function ProInterestCard() {
  const { mounted, session } = useIdentity();
  const [profile, setProfile] = useState<IxaiUserProfile | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isAuthenticated = session.mode === "authenticated";
  const hasInterest = Boolean(profile?.proInterest);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      if (!isAuthenticated) {
        setProfile(null);
        return;
      }

      setIsLoading(true);
      const nextProfile = await loadUserProfile(session);

      if (!ignore) {
        setProfile(nextProfile);
        setIsLoading(false);
      }
    }

    void loadProfile();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, session]);

  async function handleProInterest() {
    setMessage("");
    setIsSaving(true);

    const result = await saveUserProfile(session, {
      displayName: profile?.displayName ?? session.user?.name ?? "",
      phone: profile?.phone ?? "",
      proInterest: true,
    });

    setIsSaving(false);
    setMessage(result.message);

    if (result.profile) {
      setProfile(result.profile);
      trackEvent("pro_interest", { source: "pro_interest_card" });
    }
  }

  if (!mounted) {
    return (
      <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4 text-sm text-[var(--ixai-ink-muted)]">
        正在讀取 IXAI Account 狀態...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-white/50 p-4 sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
          IXAI Pro early access
        </p>
        <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
          建立 IXAI Account，優先取得 IXAI Pro 開放通知。
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
          IXAI Pro 尚未正式開放。建立帳號後，你可以在 Account 中留下 Pro interest，
          一玄團隊會於開放測試時優先通知。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            className="ixai-cta-forest inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
            href="/register"
          >
            建立 IXAI Account
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
            href="/login"
          >
            已有帳號，登入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-white/50 p-4 sm:p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
        IXAI Pro early access
      </p>
      <h3 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
        {hasInterest ? "已加入 IXAI Pro 優先通知" : "我有興趣 IXAI Pro"}
      </h3>
      <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
        IXAI Pro 尚未正式開放。完成登記後，一玄團隊會於開放測試時優先通知。
        登記不代表已開通付費服務，也不涉及任何投資建議或報酬承諾。
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          className="ixai-cta-forest inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isLoading || isSaving || hasInterest}
          onClick={handleProInterest}
          type="button"
        >
          {hasInterest ? "已完成登記" : isSaving ? "登記中..." : "我有興趣 IXAI Pro"}
        </button>
        {message ? (
          <p className="text-xs leading-5 text-[var(--ixai-forest-soft)]">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
