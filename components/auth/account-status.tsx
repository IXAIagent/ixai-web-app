"use client";

import Link from "next/link";
import { useIdentity } from "@/components/auth/auth-provider";

export function AccountStatus() {
  const { mounted, session } = useIdentity();

  return (
    <Link
      className="block rounded-lg border border-white/10 bg-white/[0.045] p-3 transition hover:bg-white/[0.07]"
      href="/account"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
        My IXAI
      </p>
      <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.62)]">
        {!mounted
          ? "讀取中..."
          : session.mode === "authenticated"
            ? "IXAI 帳戶已啟用"
            : "需要登入"}
      </p>
    </Link>
  );
}
