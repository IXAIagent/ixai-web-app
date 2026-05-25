"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { OfflineStatus } from "@/components/pwa/offline-status";
import { PwaRegister } from "@/components/pwa/pwa-register";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#061811] text-[var(--ixai-cream)]">
        <PwaRegister />
        <OfflineStatus />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ixai-cream)] text-[var(--foreground)]">
      {/* v1.32.1 — mobile top bar now carries hamburger + section title +
          IXAI mark. The MobileHeader component owns the drawer so the
          app-shell stays declarative and there is only ever one header
          per breakpoint (mobile-only). Desktop sidebar is unchanged. */}
      <MobileHeader />

      <Sidebar />
      <PwaRegister />
      <OfflineStatus />

      <main className="min-h-screen pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-[calc(3.85rem+env(safe-area-inset-top))] md:ml-56 md:pb-0 md:pt-0">
        {children}
        <Footer />
      </main>

      <MobileNav />
    </div>
  );
}
