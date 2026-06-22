"use client";

import { usePathname } from "next/navigation";
import { useIdentity } from "@/components/auth/auth-provider";
import { IxaiLogoFrame } from "@/components/brand/ixai-logo";
import { ShellNavButton, ShellSidebarSection, shellTokens } from "@/components/shell/shell-primitives";
import { Eyebrow } from "@/components/ui/eyebrow";

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

const workspaceNavGroups: NavGroup[] = [
  {
    heading: "Workspace",
    items: [
      { label: "Workspace Home", href: "/my-ixai/home" },
      { label: "Portfolio Center", href: "/my-ixai/portfolio" },
      { label: "Asset Input", href: "/my-ixai/input" },
      { label: "Watchlist", href: "/my-ixai/watchlist" },
      { label: "Risk Center", href: "/my-ixai/risk" },
      { label: "FCN Center", href: "/my-ixai/fcn" },
      { label: "Intelligence Center", href: "/my-ixai/intelligence" },
      { label: "Settings", href: "/my-ixai/settings" },
    ],
  },
  {
    heading: "Exit",
    items: [
      { label: "返回官網", href: "/" },
      { action: "signOut", label: "登出", href: "/login" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { mounted, session, signOut } = useIdentity();
  const isWorkspaceRoute = pathname === "/my-ixai" || pathname.startsWith("/my-ixai/");
  const isAuthenticated = mounted && session.mode === "authenticated";
  const publicNavGroups: NavGroup[] = [
    {
      heading: "官網",
      items: [
        { label: "市場首頁", href: "/", primary: true },
        { label: "每日晨報", href: "/daily-brief" },
        { label: "市場總覽", href: "/market" },
        { label: "每週情報", href: "/weekly-brief" },
      ],
    },
    {
      heading: "產品",
      items: [
        { label: "FCN", href: "/fcn" },
        { label: "IXAI Platform", href: "/pro" },
        { label: "About 一玄", href: "/about" },
        ...(isAuthenticated
          ? [
              { label: "我的 IXAI Workspace", href: "/my-ixai/home" },
              { action: "signOut" as const, label: "登出", href: "/login" },
            ]
          : [{ label: "登入", href: "/login" }]),
      ],
    },
  ];
  const navGroups = isWorkspaceRoute ? workspaceNavGroups : publicNavGroups;
  const title = isWorkspaceRoute ? "IXAI Workspace" : "市場情報";
  const subtitle = isWorkspaceRoute ? "登入後的產品工作區。" : "每日市場情報入口。";
  const footerLabel = isWorkspaceRoute ? "Workspace Mode" : "Public Website";
  const footerText = isWorkspaceRoute
    ? "Portfolio、Risk、FCN、Intelligence 與 Settings 已分離成工作區導覽。"
    : "官網導覽保留品牌、教育與市場內容，不混入 Workspace。";

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
