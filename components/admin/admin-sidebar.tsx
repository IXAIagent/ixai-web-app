"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
      ["Pro 等候名單", "/admin#membership"],
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
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#071a14] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
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
          <div className="grid gap-1" key={group.heading}>
            <p className="px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]/80">
              {group.heading}
            </p>
            {group.items.map(([label, href]) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  className={`rounded-md px-2.5 py-2 font-mono text-xs transition ${
                    active
                      ? "bg-white/10 text-[var(--ixai-cream)]"
                      : "text-white/48 hover:bg-white/[0.055] hover:text-white/78"
                  }`}
                  href={href}
                  key={`${group.heading}-${label}`}
                  onClick={() =>
                    trackEvent("admin_section_click", {
                      path: pathname,
                      section: label,
                      surface: "admin_sidebar",
                    })
                  }
                >
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
