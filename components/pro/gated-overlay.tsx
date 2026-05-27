"use client";

import { LockKeyhole } from "lucide-react";
import type { IntelligenceSurface } from "@/src/lib/intelligence/access";
import { getSurfaceAccessState } from "@/src/lib/intelligence/access";
import { UpgradeIntelligenceCta } from "@/components/pro/upgrade-intelligence-cta";

export function GatedOverlay({
  membership = "free",
  source = "gated_overlay",
  surface,
}: {
  membership?: string;
  source?: string;
  surface: IntelligenceSurface;
}) {
  const access = getSurfaceAccessState(surface);

  return (
    <div className="max-w-full rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(7,26,20,0.94)] p-4 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.2)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.12)] text-[var(--ixai-gold)]">
          <LockKeyhole className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)] sm:text-[11px] sm:tracking-[0.22em]">
            IXAI Pro Intelligence
          </p>
          <h2 className="mt-2 text-lg font-semibold leading-7 sm:text-xl">
            此情報層屬於 IXAI Pro Intelligence
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-white/64">
            {access.title} 目前為 Preview 階段。正式版本將依 membership entitlement
            開放個人化 intelligence、風險監控與 workflow support。
          </p>
          <p className="mt-2 text-xs leading-6 text-white/46">
            本頁僅呈現 sample intelligence shell，不提供買賣建議、目標價或報酬承諾。
          </p>
        </div>
      </div>
      <UpgradeIntelligenceCta
        className="mt-5"
        membership={membership}
        source={source}
        surface={surface}
      />
    </div>
  );
}
