"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";

// v1.25.2: mobile bottom nav prioritizes brand funnel — Daily → Market → FCN → Pro → About.
// External Pro link and About surface are now first-class entries so PWA retention and
// founder narrative are reachable from any screen.
const mobileItems: Array<{
  icon: typeof FileText;
  label: string;
  href: string;
  external?: boolean;
  matchPrefixes?: string[];
}> = [
  { icon: FileText, label: "Daily", href: "/daily-brief" },
  { icon: BarChart3, label: "Market", href: "/market" },
  { icon: ShieldCheck, label: "FCN", href: "/fcn" },
  { icon: Sparkles, label: "Pro", href: ixaiEcosystem.proPreviewUrl, external: true, matchPrefixes: ["/pro"] },
  { icon: Info, label: "About", href: "/about" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[rgba(176,141,87,0.30)] bg-[rgba(8,34,26,0.97)] px-2 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 shadow-[0_-14px_40px_rgba(9,41,31,0.24)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const matchPrefixes = item.matchPrefixes ?? [item.href];
          const isActive = item.external
            ? matchPrefixes.some((prefix) => pathname.startsWith(prefix))
            : matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
          const className = `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-center transition active:scale-[0.98] ${
            isActive
              ? "border border-[rgba(176,141,87,0.42)] bg-[rgba(245,240,230,0.92)] text-[var(--ixai-forest)] shadow-[0_10px_26px_rgba(0,0,0,0.20)]"
              : "text-[rgba(245,240,230,0.66)] hover:bg-white/[0.055] hover:text-[var(--ixai-cream)]"
          }`;

          return (
            <Link
              className={className}
              href={item.href}
              key={item.label}
              rel={item.external ? "noopener noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              <Icon
                className={`h-[18px] w-[18px] ${isActive ? "text-[var(--ixai-gold)]" : "text-[rgba(245,240,230,0.62)]"}`}
                aria-hidden="true"
              />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
