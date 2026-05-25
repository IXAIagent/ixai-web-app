"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { IxaiLogoFrame } from "@/components/brand/ixai-logo";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { getMobileSectionTitle } from "@/src/lib/navigation/section-title";

// v1.32.1 — mobile top bar (mobile-only). Replaces the previous
// MobileTopInsight strip. Hamburger opens the IXAI Intelligence OS
// drawer; the center label tracks the current section; the right slot
// keeps the IXAI logo mark as a home shortcut.
export function MobileHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sectionTitle = getMobileSectionTitle(pathname);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-30 border-b border-[rgba(176,141,87,0.28)] bg-[rgba(245,240,230,0.92)] px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+0.55rem)] backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            aria-controls="ixai-mobile-drawer"
            aria-expanded={drawerOpen}
            aria-label="開啟 IXAI 導覽選單"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-white/55 text-[var(--ixai-forest)] transition active:scale-[0.97]"
            onClick={() => setDrawerOpen(true)}
            type="button"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
              IXAI
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold leading-5 text-[var(--ixai-forest)]">
              {sectionTitle}
            </p>
          </div>

          <Link
            aria-label="回到 IXAI 首頁"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-white/55 px-2.5 transition active:scale-[0.97]"
            href="/"
          >
            <IxaiLogoFrame className="h-7 w-12" logoSize="xs" priority />
          </Link>
        </div>
      </div>

      <div id="ixai-mobile-drawer">
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </>
  );
}
