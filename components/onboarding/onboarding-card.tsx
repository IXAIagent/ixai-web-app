"use client";

import { useState } from "react";
import { useIdentity } from "@/components/auth/auth-provider";
import { ixaiIdentity } from "@/src/lib/ixai/identity";
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
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.9)] p-3.5 shadow-[0_12px_34px_rgba(9,41,31,0.045)] sm:p-5 sm:shadow-[0_16px_44px_rgba(9,41,31,0.05)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            第一次使用
          </p>
          <h2 className="mt-1.5 text-lg font-semibold leading-6 text-[var(--ixai-forest)]">
            選擇你關注的市場主題
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--ixai-ink-muted)] sm:leading-7">
            選擇你最關注的市場，IXAI 會微調摘要排序。內容仍以一玄每日市場觀察為主，個人化只作為輔助。
          </p>
          <p className="mt-2 hidden max-w-2xl text-xs leading-6 text-[var(--ixai-ink-muted)] sm:block">
            {ixaiIdentity.preferencesSyncCopy}
          </p>
        </div>
        <span className="w-fit rounded-md border border-[var(--ixai-border)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ixai-forest-soft)]">
          {session.mode === "authenticated" ? "帳戶同步" : "Guest 模式"}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2 lg:grid-cols-3">
        {interestOptions.map((option) => {
          const active = selected.includes(option.id);

          return (
            <button
              className={`rounded-lg border px-3 py-2.5 text-left transition active:scale-[0.99] sm:p-3 ${
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
              <p className="mt-1 hidden text-xs leading-5 text-[var(--ixai-ink-muted)] sm:block">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      <button
        className="ixai-cta-forest mt-4 min-h-11 w-full rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium sm:w-fit"
        onClick={() => completeOnboarding(selected)}
        type="button"
      >
        完成設定
      </button>
    </section>
  );
}
