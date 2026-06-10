"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Bug,
  Database,
  Eye,
  FileText,
  Info,
  MessageSquare,
  Newspaper,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCircle,
  X,
} from "lucide-react";

// v1.32.1 — IXAI Intelligence OS mobile drawer.
//
// Sitemap is exhaustive per IXAI Public App routes today (every link
// resolves to a real page, so no disabled placeholders). Drawer is
// mobile-only; the desktop sidebar is untouched. Behavior contract:
//
//   - body scroll lock while open
//   - ESC closes
//   - clicking the overlay closes
//   - clicking any link closes
//   - active route highlight matches each entry's prefix

type DrawerEntry = {
  label: string;
  href: string;
  icon: typeof FileText;
  external?: boolean;
  matchPrefix?: string;
};

type DrawerSection = {
  title: string;
  entries: DrawerEntry[];
};

const DRAWER_SECTIONS: DrawerSection[] = [
  {
    title: "市場情報",
    entries: [
      { label: "每日晨報", href: "/daily-brief", icon: FileText },
      { label: "每週情報", href: "/weekly-brief", icon: Newspaper },
    ],
  },
  {
    title: "市場",
    entries: [
      { label: "市場總覽", href: "/market", icon: BarChart3 },
      { label: "關注清單", href: "/watchlist", icon: Eye },
    ],
  },
  {
    title: "FCN",
    entries: [
      { label: "認識 FCN", href: "/fcn", icon: ShieldCheck },
      {
        label: "FCN 觀念",
        href: "/fcn#learn-fcn",
        icon: BookOpen,
        matchPrefix: "/fcn",
      },
    ],
  },
  {
    title: "IXAI",
    entries: [
      { label: "我的 IXAI", href: "/account", icon: UserCircle },
      { label: "Portfolio Center", href: "/my-ixai/portfolio", icon: BriefcaseBusiness },
      { label: "Asset Input", href: "/my-ixai/input", icon: FileText },
      { label: "Portfolio Assets", href: "/my-ixai/portfolio/assets", icon: Database },
      { label: "IXAI Pro", href: "/pro", icon: Sparkles },
      { label: "關於一玄", href: "/about", icon: Info },
    ],
  },
  {
    title: "設定與回饋",
    entries: [
      { label: "提供意見", href: "/feedback", icon: MessageSquare },
      { label: "通知設定", href: "/settings/notifications", icon: Settings },
      { label: "回報問題", href: "/feedback", icon: Bug, matchPrefix: "/feedback" },
    ],
  },
];

function isEntryActive(pathname: string, entry: DrawerEntry): boolean {
  const target = entry.matchPrefix ?? entry.href.split("#")[0];
  if (!target) {
    return false;
  }
  if (target === "/") {
    return pathname === "/";
  }
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  // Body scroll lock + ESC close while open.
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  const handleLinkClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-40 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <button
        aria-label="關閉導覽選單"
        className={`absolute inset-0 bg-[rgba(8,34,26,0.55)] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        type="button"
      />
      <aside
        aria-label="IXAI 主要導覽選單"
        className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col border-r border-[rgba(176,141,87,0.30)] bg-[#071f17] text-[var(--ixai-cream)] shadow-[24px_0_64px_rgba(9,41,31,0.34)] transition-transform duration-220 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
      >
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+0.8rem)]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
              IXAI 市場情報
            </p>
            <p className="mt-1 text-sm leading-6 text-[rgba(245,240,230,0.62)]">
              IXAI 一玄 · AI 財富情報
            </p>
          </div>
          <button
            aria-label="關閉選單"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/[0.05] text-[rgba(245,240,230,0.78)]"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4 text-[rgba(245,240,230,0.78)]" aria-hidden="true" />
          </button>
        </header>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-5">
            {DRAWER_SECTIONS.map((section) => (
              <div className="flex flex-col gap-1.5" key={section.title}>
                <p className="px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[rgba(245,240,230,0.42)]">
                  {section.title}
                </p>
                {section.entries.map((entry) => {
                  const Icon = entry.icon;
                  const active = isEntryActive(pathname, entry);

                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition active:scale-[0.99] ${
                        active
                          ? "border border-[rgba(176,141,87,0.40)] bg-[rgba(245,240,230,0.10)] text-[var(--ixai-cream)]"
                          : "text-[rgba(245,240,230,0.78)] hover:bg-white/[0.055]"
                      }`}
                      href={entry.href}
                      key={entry.label}
                      onClick={handleLinkClick}
                      rel={entry.external ? "noopener noreferrer" : undefined}
                      target={entry.external ? "_blank" : undefined}
                    >
                      <Icon
                        aria-hidden="true"
                        className={`h-4 w-4 ${active ? "text-[var(--ixai-gold)]" : "text-[rgba(245,240,230,0.78)]"}`}
                      />
                      <span className="flex-1">{entry.label}</span>
                      <ArrowRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 text-[rgba(245,240,230,0.55)]"
                      />
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        <footer className="border-t border-white/10 px-5 pb-[calc(env(safe-area-inset-bottom)+0.85rem)] pt-3 text-xs leading-6 text-[rgba(245,240,230,0.42)]">
          IXAI Public Intelligence · 不構成投資建議或績效保證。
        </footer>
      </aside>
    </div>
  );
}
