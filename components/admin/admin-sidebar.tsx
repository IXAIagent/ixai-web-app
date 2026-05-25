"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/src/lib/analytics/analytics";

const GROUPS = [
  {
    heading: "Overview",
    items: [
      ["Console Home", "/admin"],
      ["Intelligence Snapshot", "/admin#intelligence"],
      ["Audience Graph", "/admin#audience"],
      ["Conversion Funnel", "/admin#funnel"],
    ],
  },
  {
    heading: "Editorial",
    items: [
      ["Daily Pipeline", "/admin/daily-briefs"],
      ["Weekly Pipeline", "/admin/daily-briefs#weekly"],
      ["Publishing Queue", "/admin/daily-briefs#queue"],
    ],
  },
  {
    heading: "Growth",
    items: [
      ["Subscribers", "/admin#distribution"],
      ["Membership", "/admin#membership"],
      ["Pro Waitlist", "/admin#membership"],
      ["Distribution", "/admin#distribution"],
    ],
  },
  {
    heading: "Analytics",
    items: [
      ["PostHog Events", "/admin#intelligence"],
      ["Search Console", "/admin#system"],
      ["Source Attribution", "/admin#distribution"],
    ],
  },
  {
    heading: "System",
    items: [
      ["Environment", "/admin#system"],
      ["Health", "/admin#system"],
      ["Logs", "/admin#system"],
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
          Operating Console
        </h1>
        <p className="mt-2 text-xs leading-5 text-white/42">
          Internal intelligence, audience, distribution and membership control layer.
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
