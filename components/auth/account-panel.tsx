"use client";

import { FormEvent, useEffect, useState } from "react";
import { useIdentity } from "@/components/auth/auth-provider";
import { ixaiIdentity } from "@/src/lib/ixai/identity";
import { interestOptions } from "@/src/lib/personalization/memory";
import { getWatchlist } from "@/src/lib/watchlist";

export function AccountPanel() {
  const {
    authConfigured,
    continueAsGuest,
    memory,
    mounted,
    persistenceStatus,
    sendMagicLink,
    session,
    signInWithGoogle,
    signOut,
  } = useIdentity();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [watchlistCount, setWatchlistCount] = useState(0);
  const isAuthenticated = session.mode === "authenticated";
  const preferredLabels = memory.preferredCategories
    .map((category) => interestOptions.find((option) => option.id === category)?.label)
    .filter(Boolean);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setWatchlistCount(getWatchlist().length);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const result = await sendMagicLink(email);
    setMessage(result.message);
    if (result.ok) {
      setEmail("");
    }
  }

  if (!mounted) {
    return (
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-5">
        <p className="text-sm text-[var(--ixai-ink-muted)]">正在讀取我的 IXAI...</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-5 shadow-[0_16px_44px_rgba(9,41,31,0.05)] sm:p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
        My IXAI
      </p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
        {isAuthenticated ? "你的 IXAI 身份已建立" : "以 Guest 模式開始，登入後同步你的市場記憶"}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
        Guest 模式是有效的免費使用方式；登入的價值在於同步自選觀察、保存關注主題，
        並為未來個人化 AI 風險監控與 IXAI Pro 模組建立基礎。
      </p>
      <div className="mt-4 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
          {ixaiIdentity.syncPendingBadge}
        </p>
        <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          {ixaiIdentity.sharedAccountMessage}
        </p>
      </div>

      {isAuthenticated ? (
        <div className="mt-5 grid gap-4">
          <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                已登入
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
              {session.user?.email ?? session.user?.name ?? "IXAI account"}
            </p>
            <p className="mt-1 text-xs text-[var(--ixai-ink-muted)]">
              上次使用：{new Date(memory.lastVisitAt).toLocaleString("zh-TW")}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/36 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                同步狀態
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
                {persistenceStatus.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">
                {persistenceStatus.message}
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--ixai-ink-muted)]">
                {ixaiIdentity.preferencesSyncCopy}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/36 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                個人市場設定
              </p>
              <p className="mt-2 text-sm text-[var(--ixai-forest)]">
                自選數量：<span className="font-semibold">{watchlistCount}</span>
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">
                關注主題：{preferredLabels.length > 0 ? preferredLabels.join(" / ") : "尚未設定"}
              </p>
            </div>
          </div>
          <button
            className="w-fit rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
            onClick={signOut}
            type="button"
          >
            登出
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-[var(--ixai-border)] bg-white/36 p-4 lg:col-span-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              Guest 模式
            </p>
            <div className="mt-2 grid gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)] sm:grid-cols-3">
              <p>保存方式：本機瀏覽器</p>
              <p>自選數量：{watchlistCount}</p>
              <p>
                關注主題：{preferredLabels.length > 0 ? preferredLabels.join(" / ") : "尚未設定"}
              </p>
            </div>
          </div>
          {!authConfigured ? (
            <div className="rounded-lg border border-amber-300/35 bg-amber-100/35 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)] lg:col-span-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                登入同步尚未啟用
              </p>
              <p className="mt-2">
                目前登入同步尚未啟用，因此 Google 登入與 email 登入連結不會啟用。
                你仍可用 Guest 模式閱讀內容、建立本機 watchlist 與保存偏好。
              </p>
              <p className="mt-2">
                {ixaiIdentity.accountContinuityCopy}
              </p>
            </div>
          ) : null}
          <div className="grid gap-3">
            <button
              className="ixai-cta-forest rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-[var(--ixai-forest)]/45 disabled:text-[var(--ixai-cream)]/60"
              disabled={!authConfigured}
              onClick={signInWithGoogle}
              type="button"
            >
              {authConfigured ? "使用 Google 登入" : "Google 登入尚未啟用"}
            </button>
            {!authConfigured ? (
              <p className="text-xs leading-5 text-[var(--ixai-ink-muted)]">
                登入同步開放後，你可以跨裝置保存自選觀察與市場偏好。
              </p>
            ) : null}
            <button
              className="rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
              onClick={continueAsGuest}
              type="button"
            >
              繼續使用 Guest 模式
            </button>
          </div>

          <form className="grid gap-3" onSubmit={handleMagicLink}>
            <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]">
              Email 登入連結
              <input
                className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--ixai-gold)]"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>
            <button
              className="w-fit rounded-lg bg-[var(--ixai-gold)] px-4 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!email || !authConfigured}
              type="submit"
            >
              {authConfigured ? "寄送登入連結" : "Email 登入尚未啟用"}
            </button>
            {message ? (
              <p className="text-xs leading-5 text-[var(--ixai-forest-soft)]">{message}</p>
            ) : null}
          </form>
        </div>
      )}
    </section>
  );
}
