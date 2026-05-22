"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Home,
  Info,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";

const mobileItems = [
  { icon: Home, label: "首頁", href: "/" },
  { icon: FileText, label: "每日", href: "/daily-brief" },
  { icon: BarChart3, label: "市場", href: "/market" },
  { icon: ShieldCheck, label: "FCN", href: "/fcn" },
  { external: true, icon: Sparkles, label: "Pro", href: ixaiEcosystem.proDashboardUrl },
  { icon: Info, label: "關於", href: "/about" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[rgba(176,141,87,0.30)] bg-[rgba(8,34,26,0.97)] px-2.5 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 shadow-[0_-14px_40px_rgba(9,41,31,0.24)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-6 gap-1">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            !item.external &&
            (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));
          const className = `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1.5 text-center transition active:scale-[0.98] ${
            isActive
              ? "border border-[rgba(245,240,230,0.14)] bg-[rgba(245,240,230,0.12)] text-[var(--ixai-cream)] shadow-inner"
              : "text-[rgba(245,240,230,0.58)] hover:bg-white/[0.04] hover:text-[rgba(245,240,230,0.82)]"
          }`;

          return (
            <Link
              className={className}
              href={item.href}
              key={item.label}
              rel={item.external ? "noopener noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
