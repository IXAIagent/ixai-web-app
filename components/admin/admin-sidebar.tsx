"use client";

import { usePathname } from "next/navigation";
import { ShellNavButton, ShellSidebarSection, shellTokens } from "@/components/shell/shell-primitives";
import { trackEvent } from "@/src/lib/analytics/analytics";

const GROUPS = [
  {
    heading: "總覽",
    items: [
      ["控制台首頁", "/admin"],
      ["情報快照", "/admin#intelligence"],
      ["受眾圖譜", "/admin#audience"],
      ["轉換漏斗", "/admin#funnel"],
    ],
  },
  {
    heading: "內容營運",
    items: [
      ["每日簡報流程", "/admin/daily-briefs"],
      ["每週情報流程", "/admin/daily-briefs#weekly"],
      ["發佈佇列", "/admin/daily-briefs#queue"],
    ],
  },
  {
    heading: "成長營運",
    items: [
      ["訂閱者", "/admin#distribution"],
      ["會員系統", "/admin#membership"],
      ["Pro 等候名單", "/admin#pro-readiness"],
      ["分發系統", "/admin#distribution"],
    ],
  },
  {
    heading: "分析",
    items: [
      ["PostHog 事件", "/admin#intelligence"],
      ["搜尋流量", "/admin#system"],
      ["來源歸因", "/admin#distribution"],
    ],
  },
  {
    heading: "系統",
    items: [
      ["環境變數", "/admin#system"],
      ["系統健康", "/admin#system"],
      ["系統紀錄", "/admin#system"],
    ],
  },
] as const;

function isActive(pathname: string, href: string) {
  const [path] = href.split("#");
  if (path === "/admin") return pathname === "/admin";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={`hidden ${shellTokens.adminSidebarWidth} shrink-0 border-r border-white/10 bg-[#071a14] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col`}>
      <div className="border-b border-white/10 px-4 py-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
          IXAI
        </p>
        <h1 className="mt-2 text-lg font-semibold text-[var(--ixai-cream)]">
          營運控制台
        </h1>
        <p className="mt-2 text-xs leading-5 text-white/42">
          內部情報、受眾、分發與會員營運控制層。
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => (
          <ShellSidebarSection key={group.heading} title={group.heading}>
            {group.items.map(([label, href]) => {
              const active = isActive(pathname, href);
              return (
                <ShellNavButton
                  active={active}
                  href={href}
                  key={`${group.heading}-${label}`}
                  label={label}
                  onClick={() =>
                    trackEvent("admin_section_click", {
                      path: pathname,
                      section: label,
                      surface: "admin_sidebar",
                    })
                  }
                />
              );
            })}
          </ShellSidebarSection>
        ))}
      </nav>
    </aside>
  );
}
