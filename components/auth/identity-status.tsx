"use client";

import { LogOut, ShieldCheck } from "lucide-react";
import { useIdentitySession } from "@/components/auth/identity-provider";
import { getPlanLabel } from "@/src/lib/membership/entitlements";

export function IdentityStatus({ compact = false }: { compact?: boolean }) {
  const { identity, loading, logout, membership, proCandidate, state } = useIdentitySession();

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3 text-xs text-[var(--ixai-ink-muted)]">
        Identity session 載入中。
      </div>
    );
  }

  if (state === "anonymous") {
    return (
      <div className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-3 text-xs leading-5 text-[var(--ixai-ink-muted)]">
        尚未建立 identity session。你仍可瀏覽 Pro preview；建立 session 後，IXAI
        能保留你的 membership context。
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.78)] ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-[rgba(176,141,87,0.34)] bg-white/52 px-2 py-1 text-[11px] font-semibold text-[var(--ixai-forest)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--ixai-gold)]" aria-hidden="true" />
              {getPlanLabel(membership?.plan)}
            </span>
            {proCandidate ? (
              <span className="rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.12)] px-2 py-1 text-[11px] font-semibold text-[var(--ixai-forest)]">
                Pro candidate
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm font-semibold text-[var(--ixai-forest)]">
            Welcome back · Your intelligence workspace
          </p>
          <p className="mt-1 break-all font-mono text-xs text-[var(--ixai-ink-muted)]">
            {identity?.normalized_email}
          </p>
        </div>
        <button
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-3 py-2 text-xs font-semibold text-[var(--ixai-forest)] transition hover:bg-white/55"
          onClick={() => void logout()}
          type="button"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          清除 session
        </button>
      </div>
    </div>
  );
}
