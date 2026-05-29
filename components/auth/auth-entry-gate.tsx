"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IxaiLogoFrame } from "@/components/brand/ixai-logo";
import { useIdentity } from "@/components/auth/auth-provider";

const exemptPathPrefixes = [
  "/about",
  "/admin",
  "/app-preview",
  "/daily-brief",
  "/feedback",
  "/liff",
  "/login",
  "/onboarding",
  "/register",
  "/share",
  "/weekly-brief",
  "/welcome",
];

function isExemptPath(pathname: string) {
  if (pathname === "/") {
    return true;
  }

  return exemptPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function AuthEntryShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] px-3 py-4 text-[var(--foreground)] sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl items-center justify-center">
        {children}
      </div>
    </main>
  );
}

export function AuthEntryGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const { mounted, session } = useIdentity();

  if (isExemptPath(pathname)) {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <AuthEntryShell>
        <section className="w-full rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-5 shadow-[0_20px_70px_rgba(9,41,31,0.08)] sm:p-7">
          <IxaiLogoFrame className="h-14 w-24" logoSize="md" priority />
          <p className="mt-5 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            正在準備 IXAI...
          </p>
        </section>
      </AuthEntryShell>
    );
  }

  if (session.mode === "authenticated") {
    return <>{children}</>;
  }

  return (
    <AuthEntryShell>
      <section className="grid w-full overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.9)] shadow-[0_24px_90px_rgba(9,41,31,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] sm:p-8">
          <IxaiLogoFrame className="h-16 w-28" logoSize="lg" priority tone="dark" />
          <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
            IXAI Public Intelligence
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
            建立你的 IXAI intelligence workspace。
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/68 sm:mt-5">
            開始建立個人市場觀察系統：每日市場 intelligence、FCN 教育、AI risk monitoring，
            以及未來可升級的 IXAI Pro AI Wealth Operating System。
          </p>
          <p className="mt-5 rounded-lg border border-white/10 bg-white/[0.055] p-3 text-xs leading-6 text-white/58">
            IXAI Public App 是一個帳號型 intelligence funnel。建立帳號後，你的 Watchlist、
            偏好與未來 Pro workflow 才能形成連續的市場記憶。
          </p>
        </div>

        <div className="p-5 sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Start
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
            進入 IXAI
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            建立 IXAI Account 後即可進入 Public Intelligence Layer，閱讀每日市場情報、
            建立個人自選觀察，並為未來 IXAI Pro continuity 做準備。
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              className="ixai-cta-forest inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--ixai-forest)] px-5 py-3 text-sm font-semibold"
              href="/register"
            >
              建立 IXAI Account
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--ixai-border)] px-5 py-3 text-sm font-semibold text-[var(--ixai-forest)]"
              href="/login"
            >
              登入
            </Link>
          </div>

          <div className="mt-6 grid gap-3 text-xs leading-6 text-[var(--ixai-ink-muted)] sm:grid-cols-3">
            <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3">
              Free: Daily Brief、Weekly Brief、市場總覽。
            </p>
            <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3">
              Personal: Watchlist 與偏好逐步建立。
            </p>
            <p className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3">
              Pro: 未來連接風險監控與 Portfolio Intelligence。
            </p>
          </div>
        </div>
      </section>
    </AuthEntryShell>
  );
}
