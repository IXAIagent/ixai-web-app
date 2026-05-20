"use client";

import { useState } from "react";
import { useIdentity } from "@/components/auth/auth-provider";
import {
  interestOptions,
} from "@/src/lib/personalization/memory";
import type { IntelligenceInterest } from "@/src/types/identity";

export function OnboardingCard() {
  const { completeOnboarding, memory, mounted, session } = useIdentity();
  const [selected, setSelected] = useState<IntelligenceInterest[]>(memory.preferredCategories);

  if (!mounted || memory.onboardingCompleted) {
    return null;
  }

  function toggle(id: IntelligenceInterest) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.9)] p-4 shadow-[0_16px_44px_rgba(9,41,31,0.05)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            First Visit Setup
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">
            建立你的 Daily Intelligence profile
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ixai-ink-muted)]">
            選擇你最關注的市場，IXAI 會微調摘要排序。內容仍以 IXAI curated intelligence 為主，個人化只作為輔助。
          </p>
        </div>
        <span className="w-fit rounded-md border border-[var(--ixai-border)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ixai-forest-soft)]">
          {session.mode === "authenticated" ? "Account memory" : "Guest memory"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {interestOptions.map((option) => {
          const active = selected.includes(option.id);

          return (
            <button
              className={`rounded-lg border p-3 text-left transition ${
                active
                  ? "border-[var(--ixai-gold)] bg-[rgba(176,141,87,0.12)]"
                  : "border-[var(--ixai-border)] bg-white/36 hover:bg-white/58"
              }`}
              key={option.id}
              onClick={() => toggle(option.id)}
              type="button"
            >
              <p className="text-sm font-semibold text-[var(--ixai-forest)]">
                {option.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      <button
        className="mt-4 rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium text-[var(--ixai-cream)]"
        onClick={() => completeOnboarding(selected)}
        type="button"
      >
        完成設定
      </button>
    </section>
  );
}
