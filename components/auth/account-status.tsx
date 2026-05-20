"use client";

import Link from "next/link";
import { useIdentity } from "@/components/auth/auth-provider";

export function AccountStatus() {
  const { mounted, session } = useIdentity();

  return (
    <Link
      className="block rounded-lg border border-white/10 bg-black/18 p-3 transition hover:bg-white/[0.06]"
      href="/account"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
        Identity
      </p>
      <p className="mt-2 text-xs leading-5 text-white/62">
        {!mounted
          ? "Loading..."
          : session.mode === "authenticated"
            ? "IXAI account active"
            : "Guest mode"}
      </p>
    </Link>
  );
}
