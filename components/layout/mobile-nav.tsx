"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Sparkles,
  ShieldCheck,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

// v1.32.1 — Mobile Intelligence Navigation.
//
// Morning brief / market / IXAI (center, floating) / FCN / account. The center IXAI
// button is intentionally larger with a subtle gold ring + soft glow so
// it reads as the primary surface, not a flashy CTA.
//
// Behavior:
//   - mobile only (md:hidden)
//   - 5 columns
//   - safe-area-inset-bottom respected via padding-bottom calc
//   - min 44px touch targets per HIG
//   - active state: cream capsule + deep forest text
//   - inactive: muted gold-tinted cream

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
  matchPrefixes?: string[];
  center?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    key: "brief",
    label: "晨報",
    href: "/daily-brief",
    icon: FileText,
    matchPrefixes: ["/daily-brief", "/weekly-brief"],
  },
  {
    key: "market",
    label: "市場",
    href: "/market",
    icon: BarChart3,
  },
  {
    key: "ixai",
    label: "IXAI",
    href: "/ixai",
    icon: Sparkles,
    center: true,
    matchPrefixes: ["/ixai", "/"],
  },
  {
    key: "fcn",
    label: "FCN",
    href: "/fcn",
    icon: ShieldCheck,
  },
  {
    key: "me",
    label: "我的",
    href: "/account",
    icon: UserCircle,
    matchPrefixes: ["/account", "/my-ixai", "/login", "/register"],
  },
];

function matchActive(pathname: string, item: NavItem): boolean {
  const prefixes = item.matchPrefixes ?? [item.href];

  for (const prefix of prefixes) {
    if (!prefix) {
      continue;
    }

    // Center IXAI tab: "/" exact match only; "/ixai" prefix match.
    if (prefix === "/") {
      if (pathname === "/") {
        return true;
      }
      continue;
    }

    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return true;
    }
  }

  return false;
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="IXAI 主要導覽"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[rgba(176,141,87,0.30)] bg-[rgba(8,34,26,0.97)] px-2 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 shadow-[0_-14px_40px_rgba(9,41,31,0.24)] backdrop-blur md:hidden"
    >
      <div className="relative mx-auto grid max-w-xl grid-cols-5 items-end gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = matchActive(pathname, item);

          if (item.center) {
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                className={`relative -mt-6 flex min-h-[3.5rem] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-center shadow-[0_14px_36px_rgba(0,0,0,0.28)] transition active:scale-[0.97] ${
                  isActive
                    ? "border border-[rgba(176,141,87,0.55)] bg-[rgba(245,240,230,0.96)] text-[var(--ixai-forest)]"
                    : "border border-[rgba(176,141,87,0.45)] bg-[rgba(245,240,230,0.92)] text-[var(--ixai-forest)]"
                }`}
                href={item.href}
                key={item.key}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1 rounded-2xl bg-[radial-gradient(circle_at_50%_30%,rgba(176,141,87,0.34),transparent_70%)] blur-md"
                />
                <Icon className="relative h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
                <span className="relative text-[10px] font-semibold leading-none">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-center transition active:scale-[0.98] ${
                isActive
                  ? "border border-[rgba(176,141,87,0.42)] bg-[rgba(245,240,230,0.92)] text-[var(--ixai-forest)] shadow-[0_10px_26px_rgba(0,0,0,0.18)]"
                  : "text-[rgba(245,240,230,0.66)] hover:bg-white/[0.055] hover:text-[var(--ixai-cream)]"
              }`}
              href={item.href}
              key={item.key}
              rel={item.external ? "noopener noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              <Icon
                aria-hidden="true"
                className={`h-[18px] w-[18px] ${
                  isActive ? "text-[var(--ixai-gold)]" : "text-[rgba(245,240,230,0.78)]"
                }`}
              />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
