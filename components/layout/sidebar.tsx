"use client";

import { usePathname } from "next/navigation";
import { AccountStatus } from "@/components/auth/account-status";
import { IxaiLogoFrame } from "@/components/brand/ixai-logo";
import { ShellNavButton, ShellSidebarSection, shellTokens } from "@/components/shell/shell-primitives";
import { Eyebrow } from "@/components/ui/eyebrow";

// v1.7: nav grouped into workflow tiers instead of 7 flat peers.
// Mirrors the homepage hierarchy: daily workflow → market reference →
// personal monitoring → membership → brand.
const navGroups: Array<{
  heading: string;
  items: Array<{ external?: boolean; label: string; href: string; primary?: boolean }>;
}> = [
  {
    heading: "每日",
    items: [
      { label: "市場首頁", href: "/", primary: true },
      { label: "每日晨報", href: "/daily-brief" },
    ],
  },
  {
    heading: "市場",
    items: [
      { label: "市場總覽", href: "/market" },
      { label: "每週情報", href: "/weekly-brief" },
    ],
  },
  {
    heading: "個人",
    items: [
      { label: "自選觀察", href: "/watchlist" },
      { label: "我的 IXAI", href: "/account" },
      { label: "Portfolio Center", href: "/my-ixai/portfolio" },
      { label: "Asset Input", href: "/my-ixai/input" },
    ],
  },
  {
    heading: "會員",
    items: [
      { label: "FCN", href: "/fcn" },
      { label: "IXAI Pro", href: "/pro" },
    ],
  },
  {
    heading: "品牌",
    items: [
      { label: "About 一玄", href: "/about" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 hidden ${shellTokens.publicSidebarWidth} border-r border-[rgba(176,141,87,0.22)] bg-[#071f17] text-[var(--ixai-cream)] md:flex md:flex-col`}>
      <div className="border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-3">
          <IxaiLogoFrame className="h-10 w-[4.75rem]" logoSize="sm" priority tone="dark" />
          <div>
            <Eyebrow mono density="extra-wide" className="text-[10px]">
              IXAI
            </Eyebrow>
            <h1 className="mt-1 text-sm font-semibold tracking-normal">
              市場情報
            </h1>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[rgba(245,240,230,0.50)]">
          每日市場情報入口。
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-4 px-2.5 py-4">
        {navGroups.map((group) => (
          <ShellSidebarSection key={group.heading} title={group.heading}>
            {group.items.map((item) => (
              <ShellNavButton
                active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
                external={item.external}
                href={item.href}
                key={item.label}
                label={item.label}
              />
            ))}
          </ShellSidebarSection>
        ))}
      </nav>

      <div className="m-2.5 grid gap-2">
        <AccountStatus />
        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
          <Eyebrow mono className="text-[10px]">
            風險狀態
          </Eyebrow>
          <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.62)]">
            Risk-on 偏正向，但利率仍是估值壓力源。
          </p>
        </div>
      </div>
    </aside>
  );
}
