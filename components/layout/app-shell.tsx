import Image from "next/image";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileTopInsight } from "@/components/layout/mobile-top-insight";
import { Sidebar } from "@/components/layout/sidebar";
import { OfflineStatus } from "@/components/pwa/offline-status";
import { PwaRegister } from "@/components/pwa/pwa-register";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[var(--ixai-cream)] text-[var(--foreground)]">
      {/* v1.7: mobile top bar shows today's headline so the morning user gets
          insight at first glance, before any scroll. Replaces the generic
          "市場入口" label. Truncated to one line via line-clamp-1. */}
      <div className="fixed inset-x-0 top-0 z-20 border-b border-[rgba(176,141,87,0.28)] bg-[rgba(245,240,230,0.90)] px-3.5 pb-2.5 pt-[calc(env(safe-area-inset-top)+0.6rem)] backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <MobileTopInsight />
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)]">
            <Image
              alt="IXAI"
              className="h-auto w-6"
              height={48}
              priority
              src="/logo/ixuan-logo.png"
              width={96}
            />
          </div>
        </div>
      </div>

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
