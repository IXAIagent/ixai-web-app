"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IxaiLogoFrame } from "@/components/brand/ixai-logo";
import { useIdentity } from "@/components/auth/auth-provider";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mounted, session } = useIdentity();
  const hasAuthError = Boolean(searchParams.get("error"));

  useEffect(() => {
    if (hasAuthError) {
      router.replace("/login?error=auth_callback_failed");
      return;
    }

    if (!mounted) {
      return;
    }

    if (session.mode === "authenticated") {
      router.replace("/account?verified=1");
      return;
    }

    const hasHashToken =
      typeof window !== "undefined" && window.location.hash.includes("access_token");

    if (!hasHashToken) {
      router.replace("/login?verified=1");
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      router.replace("/login?verified=1");
    }, 1600);

    return () => window.clearTimeout(fallbackTimer);
  }, [hasAuthError, mounted, router, session.mode]);

  return (
    <main className="min-h-screen bg-[var(--ixai-paper)] px-4 py-10 text-[var(--ixai-ink)]">
      <section className="mx-auto grid min-h-[72vh] max-w-md place-items-center">
        <div className="w-full rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.92)] p-6 text-center shadow-[0_18px_60px_rgba(9,41,31,0.08)]">
          <IxaiLogoFrame className="mx-auto h-16 w-28" logoSize="md" />
          <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
            IXAI Account
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-[var(--ixai-forest)]">
            正在完成 Email 驗證
          </h1>
          <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
            IXAI 正在建立你的登入 session。若沒有自動進入帳戶頁，請重新登入 IXAI。
          </p>
        </div>
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
