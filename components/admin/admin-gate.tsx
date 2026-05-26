"use client";

import { FormEvent, useEffect, useState } from "react";
import type { AdminGateMode } from "@/src/lib/admin/auth";

const STORAGE_KEY = "ixai.admin.gate.v1";

function subscribeAdminStorage(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => window.removeEventListener("storage", callback);
}

export function AdminGate({
  children,
  mode,
}: Readonly<{
  children: React.ReactNode;
  mode: AdminGateMode;
}>) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [manualUnlocked, setManualUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasStoredAccess, setHasStoredAccess] = useState(false);

  useEffect(() => {
    async function syncStoredAccess() {
      if (mode === "development") {
        setHasStoredAccess(window.sessionStorage.getItem(STORAGE_KEY) === "granted");
        return;
      }

      try {
        const response = await fetch("/api/admin/session", { cache: "no-store" });
        const payload = (await response.json()) as { authenticated?: boolean };
        setHasStoredAccess(
          Boolean(payload.authenticated) &&
            window.sessionStorage.getItem(STORAGE_KEY) === "granted",
        );
      } catch {
        setHasStoredAccess(false);
      }
    }

    const timer = window.setTimeout(() => {
      setMounted(true);
      void syncStoredAccess();
    }, 0);

    const unsubscribe = subscribeAdminStorage(syncStoredAccess);

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [mode]);

  const isUnlocked = mounted && (manualUnlocked || hasStoredAccess);

  function unlock() {
    window.sessionStorage.setItem(STORAGE_KEY, "granted");
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    setManualUnlocked(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "development") {
      unlock();
      return;
    }

    const response = await fetch("/api/admin/session", {
      body: JSON.stringify({ password }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setError("密碼不正確");
      setPassword("");
      return;
    }

    unlock();
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#071a14] px-4 py-8 text-[#f5f0e6] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center">
        <section className="w-full rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
            內部內容營運權限
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
            IXAI 內容營運控制台
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[rgba(245,240,230,0.62)]">
            內部內容營運後台。
            {mode === "development"
              ? "目前未設定管理密碼，僅允許本機開發模式進入。"
              : "請輸入管理密碼後進入 Editorial Studio。"}
          </p>

          <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
            {mode === "password" ? (
              <label className="grid gap-2 text-sm font-medium text-[rgba(245,240,230,0.76)]">
                請輸入管理密碼
                <input
                  className="rounded-lg border border-white/12 bg-white/[0.06] px-4 py-3 text-sm text-[var(--ixai-cream)] outline-none transition placeholder:text-[rgba(245,240,230,0.28)] focus:border-[var(--ixai-gold)]"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Admin password"
                  type="password"
                  value={password}
                />
              </label>
            ) : (
              <div className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.08)] p-4 text-sm leading-7 text-[rgba(245,240,230,0.68)]">
                本機開發警示：`IXAI_ADMIN_PASSWORD` 尚未設定。Production
                環境會直接鎖定後台，不允許進入內容。
              </div>
            )}
            {error ? (
              <p className="text-sm font-medium text-red-200">{error}</p>
            ) : null}
            <button
              className="w-fit rounded-lg bg-[var(--ixai-gold)] px-5 py-2.5 text-sm font-semibold text-[#071a14] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={mode === "password" && password.length === 0}
              type="submit"
            >
              {mode === "development" ? "以本機開發模式進入" : "進入後台"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
