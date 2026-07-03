"use client";

import { usePathname } from "next/navigation";
import { useIdentity } from "@/components/auth/auth-provider";
import { IxaiLogoFrame } from "@/components/brand/ixai-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ShellNavButton, ShellSidebarSection, shellTokens } from "@/components/shell/shell-primitives";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useLocale } from "@/src/lib/i18n";

type NavGroup = {
  heading: string;
  items: Array<{
    action?: "signOut";
    external?: boolean;
    label: string;
    href: string;
    primary?: boolean;
  }>;
};

export function Sidebar() {
  const pathname = usePathname();
  const { mounted, session, signOut } = useIdentity();
  const { dictionary, t } = useLocale();
  const isWorkspaceRoute = pathname === "/my-ixai" || pathname.startsWith("/my-ixai/");
  const isAuthenticated = mounted && session.mode === "authenticated";
  const workspaceNavGroups: NavGroup[] = [
    {
      heading: "首頁",
      items: [
        { label: dictionary.workspaceNav.home, href: "/my-ixai/home" },
      ],
    },
    {
      heading: "我的資產",
      items: [
        { label: dictionary.workspaceNav.portfolio, href: "/my-ixai/portfolio" },
        { label: dictionary.workspaceNav.fcn, href: "/my-ixai/fcn" },
        { label: dictionary.workspaceNav.risk, href: "/my-ixai/risk" },
        { label: dictionary.workspaceNav.assetInput, href: "/my-ixai/input" },
      ],
    },
    {
      heading: "市場",
      items: [
        { label: dictionary.workspaceNav.watchlist, href: "/my-ixai/watchlist" },
        { label: dictionary.workspaceNav.timeline, href: "/my-ixai/timeline" },
      ],
    },
    {
      heading: "AI",
      items: [
        { label: "Morning Brief", href: "/my-ixai/home" },
        { label: dictionary.workspaceNav.intelligence, href: "/my-ixai/intelligence" },
        { label: dictionary.workspaceNav.copilot, href: "/my-ixai/copilot" },
      ],
    },
    {
      heading: "提醒",
      items: [
        { label: dictionary.workspaceNav.notifications, href: "/my-ixai/notifications" },
      ],
    },
    {
      heading: "設定",
      items: [
        { label: dictionary.workspaceNav.settings, href: "/my-ixai/settings" },
      ],
    },
    {
      heading: dictionary.workspaceNav.exitHeading,
      items: [
        { label: dictionary.workspaceNav.exitPublic, href: "/" },
        { action: "signOut", label: dictionary.workspaceNav.signOut, href: "/login" },
      ],
    },
  ];
  const publicNavGroups: NavGroup[] = [
    {
      heading: dictionary.publicNav.headingOfficial,
      items: [
        { label: dictionary.publicNav.home, href: "/", primary: true },
        { label: dictionary.publicNav.dailyBrief, href: "/daily-brief" },
        { label: dictionary.publicNav.market, href: "/market" },
        { label: dictionary.publicNav.weeklyBrief, href: "/weekly-brief" },
      ],
    },
    {
      heading: dictionary.publicNav.headingProduct,
      items: [
        { label: dictionary.publicNav.fcn, href: "/fcn" },
        { label: dictionary.publicNav.platform, href: "/pro" },
        { label: dictionary.publicNav.about, href: "/about" },
        ...(isAuthenticated
          ? [
              { label: dictionary.publicNav.workspace, href: "/my-ixai/home" },
              { action: "signOut" as const, label: dictionary.publicNav.signOut, href: "/login" },
            ]
          : [{ label: dictionary.publicNav.login, href: "/login" }]),
      ],
    },
  ];
  const navGroups = isWorkspaceRoute ? workspaceNavGroups : publicNavGroups;
  const title = isWorkspaceRoute ? dictionary.workspaceNav.title : dictionary.publicNav.title;
  const subtitle = isWorkspaceRoute ? dictionary.workspaceNav.subtitle : dictionary.publicNav.subtitle;
  const footerLabel = isWorkspaceRoute ? dictionary.common.workspaceMode : dictionary.common.publicWebsite;
  const footerText = isWorkspaceRoute
    ? t("disclaimers", "workspaceNavigationBoundary")
    : t("disclaimers", "publicNavigationBoundary");

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
              {title}
            </h1>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-[rgba(245,240,230,0.50)]">
          {subtitle}
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
                onClick={item.action === "signOut" ? signOut : undefined}
              />
            ))}
          </ShellSidebarSection>
        ))}
      </nav>

      <div className="m-2.5 grid gap-2">
        <LanguageSwitcher mode="compact" />
        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
          <Eyebrow mono className="text-[10px]">
            {footerLabel}
          </Eyebrow>
          <p className="mt-2 text-xs leading-5 text-[rgba(245,240,230,0.62)]">
            {footerText}
          </p>
        </div>
      </div>
    </aside>
  );
}
