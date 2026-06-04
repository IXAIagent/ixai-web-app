"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { IxaiLogoFrame } from "@/components/brand/ixai-logo";
import { useIdentity } from "@/components/auth/auth-provider";

type PasswordAuthFormProps = {
  mode: "login" | "register";
};

export function PasswordAuthForm({ mode }: PasswordAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    authConfigured,
    registerWithPassword,
    session,
    signInWithPassword,
  } = useIdentity();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLogin = mode === "login";
  const routeMessage =
    searchParams.get("verified") === "1"
      ? "Email 已驗證，請重新登入 IXAI。"
      : searchParams.get("error") === "auth_callback_failed"
        ? "Email 驗證連結無法完成，請重新登入 IXAI。"
        : "";
  const displayMessage = message || routeMessage;
  const heroTitle = isLogin ? "進入 IXAI" : "建立 IXAI Account";
  const heroCopy = isLogin
    ? "使用你的 IXAI Account 登入，回到每日市場情報、自選觀察、偏好設定與 IXAI Pro 連接入口。"
    : "建立帳號後，IXAI 會逐步保存你的市場偏好、自選觀察與未來 IXAI Pro continuity。";
  const formTitle = isLogin ? "登入" : "建立帳號";
  const formSubtitle = isLogin
    ? "輸入 Email 與密碼即可進入 IXAI。"
    : "用 Email 建立 IXAI Account。";
  const authHint = authConfigured
    ? isLogin
      ? "登入後即可回到 Account、Daily Brief、Watchlist 與 IXAI Pro 入口。"
      : "建立帳號後即可在此裝置保存 IXAI session；跨裝置同步與 Pro handoff 將分階段開放。"
    : "IXAI Account production auth 尚未設定。";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const result = isLogin
      ? await signInWithPassword(email, password)
      : await registerWithPassword(email, password);

    setMessage(
      !isLogin && process.env.NODE_ENV !== "production" && result.debugMessage
        ? result.debugMessage
        : result.message,
    );
    setIsSubmitting(false);

    if (result.authenticated || session.mode === "authenticated") {
      router.push("/account");
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-5 px-3 py-4 sm:px-6 sm:py-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-12">
      <div className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_20px_70px_rgba(9,41,31,0.16)] sm:p-7">
        <IxaiLogoFrame className="h-14 w-24" logoSize="md" tone="dark" />
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
          IXAI Account
        </p>
        <h1 className="mt-2 font-serif text-2xl font-semibold leading-8 sm:text-4xl sm:leading-tight">
          {heroTitle}
        </h1>
        <p className="mt-4 text-sm leading-7 text-white/72">
          {heroCopy}
        </p>
        <div className="mt-5 rounded-lg border border-white/12 bg-white/6 p-4 text-xs leading-6 text-white/64">
          {isLogin
            ? "如果你剛從 IXAI Pro 登出，請在這裡重新登入 App，再開啟 IXAI Pro。"
            : "已有帳號的使用者不需要重新建立帳號，可直接前往登入。"}
        </div>
      </div>

      <form
        className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.9)] p-5 shadow-[0_16px_44px_rgba(9,41,31,0.05)] sm:p-7"
        onSubmit={handleSubmit}
      >
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] p-1 text-sm font-semibold">
          <Link
            className={`rounded-md px-3 py-2 text-center transition ${
              isLogin
                ? "bg-[var(--ixai-forest)] text-[var(--ixai-cream)]"
                : "text-[var(--ixai-ink-muted)] hover:text-[var(--ixai-forest)]"
            }`}
            href="/login"
          >
            登入
          </Link>
          <Link
            className={`rounded-md px-3 py-2 text-center transition ${
              !isLogin
                ? "bg-[var(--ixai-forest)] text-[var(--ixai-cream)]"
                : "text-[var(--ixai-ink-muted)] hover:text-[var(--ixai-forest)]"
            }`}
            href="/register"
          >
            建立帳號
          </Link>
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          {isLogin ? "IXAI Login" : "IXAI Register"}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
          {formTitle}
        </h2>
        <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
          {formSubtitle}
        </p>
        <p className="mt-1 text-xs leading-6 text-[var(--ixai-ink-muted)]">
          {authHint}
        </p>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]">
            Email
            <input
              autoComplete="email"
              className="min-h-11 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--ixai-gold)]"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[var(--ixai-forest)]">
            密碼
            <input
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="min-h-11 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--ixai-gold)]"
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 6 個字元"
              type="password"
              value={password}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="ixai-cta-forest inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ixai-forest)] px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!authConfigured || !email || password.length < 6 || isSubmitting}
            type="submit"
          >
            {isSubmitting ? "處理中..." : isLogin ? "登入" : "建立 IXAI Account"}
          </button>
        </div>

        {displayMessage ? (
          <p className="mt-4 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] p-3 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            {displayMessage}
          </p>
        ) : null}

        <div className="mt-6 border-t border-[var(--ixai-border)] pt-4 text-sm leading-6 text-[var(--ixai-ink-muted)]">
          {isLogin ? (
            <p>
              還沒有帳號？{" "}
              <Link className="font-semibold text-[var(--ixai-forest)] underline-offset-4 hover:underline" href="/register">
                建立 IXAI Account
              </Link>
            </p>
          ) : (
            <p>
              已經有帳號？{" "}
              <Link className="font-semibold text-[var(--ixai-forest)] underline-offset-4 hover:underline" href="/login">
                前往登入
              </Link>
            </p>
          )}
          <p className="mt-2 text-xs">
            IXAI Pro 共用帳號、Watchlist 同步與通知偏好仍屬未來功能；本頁先建立 Public App identity foundation。
          </p>
        </div>
      </form>
    </section>
  );
}
