import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileTopInsight } from "@/components/layout/mobile-top-insight";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[var(--ixai-cream)] text-[var(--foreground)]">
      {/* v1.7: mobile top bar shows today's headline so the morning user gets
          insight at first glance, before any scroll. Replaces the generic
          "市場入口" label. Truncated to one line via line-clamp-1. */}
      <div className="fixed inset-x-0 top-0 z-20 border-b border-[rgba(176,141,87,0.28)] bg-[rgba(245,240,230,0.88)] px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <MobileTopInsight />
          <div className="h-8 w-8 shrink-0 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] text-center text-sm font-semibold leading-8 text-[var(--ixai-forest)]">
            I
          </div>
        </div>
      </div>

      <Sidebar />

      <main className="min-h-screen pb-24 pt-16 md:ml-56 md:pb-0 md:pt-0">
        {children}
        <Footer />
      </main>

      <MobileNav />
    </div>
  );
}
