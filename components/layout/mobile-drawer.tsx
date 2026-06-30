"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  FileText,
  Globe2,
  HeartPulse,
  Home,
  Info,
  Newspaper,
  Rocket,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { useIdentity } from "@/components/auth/auth-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale } from "@/src/lib/i18n";

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
  action?: "signOut";
  label: string;
  href?: string;
  icon: typeof FileText;
  external?: boolean;
  matchPrefix?: string;
};

type DrawerSection = {
  title: string;
  entries: DrawerEntry[];
};

function isEntryActive(pathname: string, entry: DrawerEntry): boolean {
  const target = entry.matchPrefix ?? entry.href?.split("#")[0];
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
  const { mounted, session, signOut } = useIdentity();
  const { dictionary } = useLocale();
  const isWorkspaceRoute = pathname === "/my-ixai" || pathname.startsWith("/my-ixai/");
  const isAuthenticated = mounted && session.mode === "authenticated";
  const workspaceDrawerSections: DrawerSection[] = [
    {
      title: dictionary.workspaceNav.workspaceHeading,
      entries: [
        { label: dictionary.workspaceNav.home, href: "/my-ixai/home", icon: Home },
        { label: dictionary.workspaceNav.portfolio, href: "/my-ixai/portfolio", icon: BriefcaseBusiness },
        { label: dictionary.workspaceNav.assetInput, href: "/my-ixai/input", icon: FileText },
        { label: dictionary.workspaceNav.risk, href: "/my-ixai/risk", icon: ShieldAlert },
        { label: dictionary.workspaceNav.fcn, href: "/my-ixai/fcn", icon: ShieldCheck },
        { label: dictionary.workspaceNav.intelligence, href: "/my-ixai/intelligence", icon: Newspaper },
        { label: "Health Center", href: "/my-ixai/health", icon: HeartPulse },
        { label: "V14 Beta", href: "/my-ixai/beta", icon: Rocket },
        { label: dictionary.workspaceNav.settings, href: "/my-ixai/settings", icon: Settings },
      ],
    },
    {
      title: dictionary.workspaceNav.exitHeading,
      entries: [
        { label: dictionary.workspaceNav.exitPublic, href: "/", icon: Globe2 },
        { action: "signOut", label: dictionary.workspaceNav.signOut, href: "/login", icon: BookOpen },
      ],
    },
  ];
  const publicDrawerSections: DrawerSection[] = [
    {
      title: dictionary.publicNav.headingOfficial,
      entries: [
        { label: dictionary.publicNav.home, href: "/", icon: Home },
        { label: dictionary.publicNav.dailyBrief, href: "/daily-brief", icon: FileText },
        { label: dictionary.publicNav.market, href: "/market", icon: BarChart3 },
        { label: dictionary.publicNav.weeklyBrief, href: "/weekly-brief", icon: Newspaper },
      ],
    },
    {
      title: dictionary.publicNav.headingProduct,
      entries: [
        { label: dictionary.publicNav.fcn, href: "/fcn", icon: ShieldCheck },
        { label: dictionary.publicNav.platform, href: "/pro", icon: Sparkles },
        { label: dictionary.publicNav.about, href: "/about", icon: Info },
        ...(isAuthenticated
          ? [
              { label: dictionary.publicNav.workspace, href: "/my-ixai/home", icon: Home },
              { action: "signOut" as const, label: dictionary.publicNav.signOut, href: "/login", icon: BookOpen },
            ]
          : [{ label: dictionary.publicNav.login, href: "/login", icon: BookOpen }]),
      ],
    },
  ];
  const drawerSections = isWorkspaceRoute ? workspaceDrawerSections : publicDrawerSections;
  const eyebrow = isWorkspaceRoute ? "IXAI WORKSPACE" : "IXAI";
  const subtitle = isWorkspaceRoute ? dictionary.workspaceNav.subtitle : dictionary.publicNav.subtitle;

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
              {eyebrow}
            </p>
            <p className="mt-1 text-sm leading-6 text-[rgba(245,240,230,0.62)]">
              {subtitle}
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
            {drawerSections.map((section) => (
              <div className="flex flex-col gap-1.5" key={section.title}>
                <p className="px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[rgba(245,240,230,0.42)]">
                  {section.title}
                </p>
                {section.entries.map((entry) => {
                  const Icon = entry.icon;
                  const active = isEntryActive(pathname, entry);
                  const handleEntryClick = () => {
                    if (entry.action === "signOut") {
                      signOut();
                    }
                    handleLinkClick();
                  };

                  if (!entry.href) {
                    return (
                      <button
                        className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition active:scale-[0.99] ${
                          active
                            ? "border border-[rgba(176,141,87,0.40)] bg-[rgba(245,240,230,0.10)] text-[var(--ixai-cream)]"
                            : "text-[rgba(245,240,230,0.78)] hover:bg-white/[0.055]"
                        }`}
                        key={entry.label}
                        onClick={handleEntryClick}
                        type="button"
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
                      </button>
                    );
                  }

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
                      onClick={handleEntryClick}
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
          <div className="mb-3">
            <LanguageSwitcher mode="compact" />
          </div>
          {isWorkspaceRoute
            ? "IXAI Workspace · 監控與風險意識用途，不構成投資建議。"
            : "IXAI Public Intelligence · 不構成投資建議或績效保證。"}
        </footer>
      </aside>
    </div>
  );
}
