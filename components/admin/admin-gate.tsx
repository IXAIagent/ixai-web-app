"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import type { AdminGateMode } from "@/src/lib/admin/auth";

const STORAGE_KEY = "ixai.admin.gate.v1";

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function subscribeAdminStorage(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => window.removeEventListener("storage", callback);
}

function subscribeClientMount() {
  return () => undefined;
}

function getClientMountedSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function AdminGate({
  children,
  mode,
  passwordHash,
}: Readonly<{
  children: React.ReactNode;
  mode: AdminGateMode;
  passwordHash: string | null;
}>) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [manualUnlocked, setManualUnlocked] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeClientMount,
    getClientMountedSnapshot,
    getServerSnapshot,
  );
  const hasStoredAccess = useSyncExternalStore(
    subscribeAdminStorage,
    () => {
      if (mode !== "password" || !passwordHash) {
        return false;
      }

      return window.sessionStorage.getItem(STORAGE_KEY) === `granted:${passwordHash}`;
    },
    getServerSnapshot,
  );
  const isUnlocked = mounted && (manualUnlocked || hasStoredAccess);

  function unlock() {
    if (mode === "password" && passwordHash) {
      window.sessionStorage.setItem(STORAGE_KEY, `granted:${passwordHash}`);
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    }

    setManualUnlocked(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "development") {
      unlock();
      return;
    }

    if (!passwordHash) {
      setError("管理密碼尚未設定");
      return;
    }

    const inputHash = await sha256(password);

    if (inputHash !== passwordHash) {
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
            Internal Editorial Access
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
            IXAI Editorial Console
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
            內部內容營運後台。
            {mode === "development"
              ? "目前未設定管理密碼，僅允許本機開發模式進入。"
              : "請輸入管理密碼後進入 Daily Brief draft pipeline。"}
          </p>

          <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
            {mode === "password" ? (
              <label className="grid gap-2 text-sm font-medium text-white/76">
                請輸入管理密碼
                <input
                  className="rounded-lg border border-white/12 bg-black/22 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[var(--ixai-gold)]"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Admin password"
                  type="password"
                  value={password}
                />
              </label>
            ) : (
              <div className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.08)] p-4 text-sm leading-7 text-white/68">
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
