import Link from "next/link";

import { AccountStatus } from "@/components/auth/account-status";
import { Eyebrow } from "@/components/ui/eyebrow";

// v1.7: nav grouped into workflow tiers instead of 7 flat peers.
// Mirrors the homepage hierarchy: daily workflow → market reference →
// personal monitoring → membership → brand.
const navGroups: Array<{
  heading: string;
  items: Array<{ label: string; href: string; primary?: boolean }>;
}> = [
  {
    heading: "Daily",
    items: [
      { label: "市場首頁", href: "/", primary: true },
      { label: "每日簡報", href: "/daily-brief" },
    ],
  },
  {
    heading: "Market",
    items: [
      { label: "市場總覽", href: "/market" },
      { label: "週報", href: "/weekly-brief" },
    ],
  },
  {
    heading: "Personal",
    items: [
      { label: "自選觀察", href: "/watchlist" },
      { label: "我的 IXAI", href: "/account" },
    ],
  },
  {
    heading: "Membership",
    items: [
      { label: "IXAI Pro", href: "/ixai" },
    ],
  },
  {
    heading: "Brand",
    items: [
      { label: "關於一玄", href: "/about" },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-[rgba(176,141,87,0.22)] bg-[#071f17] text-[var(--ixai-cream)] md:flex md:flex-col">
      <div className="border-b border-white/10 px-4 py-5">
        <Eyebrow mono density="extra-wide" className="text-[10px]">
          IXAI
        </Eyebrow>
        <h1 className="mt-2 text-base font-semibold tracking-normal">
          Intelligence OS
        </h1>
        <p className="mt-2 text-xs leading-5 text-white/48">
          Daily market command layer.
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-4 px-2.5 py-4">
        {navGroups.map((group) => (
          <div className="flex flex-col gap-1" key={group.heading}>
            <Eyebrow
              mono
              density="wide"
              tone="gold"
              className="px-3 pb-1 text-[10px] opacity-72"
            >
              {group.heading}
            </Eyebrow>
            {group.items.map((item) => (
              <Link
                className={`rounded-md px-3 py-2 font-mono text-xs transition ${
                  item.primary
                    ? "bg-white/10 text-white"
                    : "text-white/54 hover:bg-white/[0.06] hover:text-white"
                }`}
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="m-2.5 grid gap-2">
        <AccountStatus />
        <div className="rounded-lg border border-white/10 bg-black/18 p-3">
          <Eyebrow mono className="text-[10px]">
            Risk State
          </Eyebrow>
          <p className="mt-2 text-xs leading-5 text-white/62">
            Risk-on 偏正向，但利率仍是估值壓力源。
          </p>
        </div>
      </div>
    </aside>
  );
}
