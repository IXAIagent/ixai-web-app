"use client";

import { useEffect } from "react";
import { ShellNavButton } from "@/components/shell/shell-primitives";
import { trackEvent } from "@/src/lib/analytics/analytics";

const MOBILE_LINKS = [
  ["首頁", "/admin"],
  ["內容", "/admin/daily-briefs"],
  ["受眾", "/admin#audience"],
  ["會員", "/admin#membership"],
  ["分發", "/admin#distribution"],
] as const;

export function AdminHeader() {
  useEffect(() => {
    trackEvent("admin_console_open", {
      path: window.location.pathname,
      surface: "admin_console",
    });
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#061811]/96 px-3 py-3 backdrop-blur lg:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            內部控制台
          </p>
          <h2 className="mt-1 text-sm font-semibold text-[var(--ixai-cream)]">
            IXAI 營運控制台
          </h2>
        </div>
        <nav
          aria-label="Admin quick navigation"
          className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
        >
          {MOBILE_LINKS.map(([label, href]) => (
            <ShellNavButton
              href={href}
              key={label}
              label={label}
              onClick={() =>
                trackEvent("admin_section_click", {
                  path: window.location.pathname,
                  section: label,
                  surface: "admin_mobile_header",
                })
              }
            />
          ))}
        </nav>
      </div>
    </header>
  );
}
