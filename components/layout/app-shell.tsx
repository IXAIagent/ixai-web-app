import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import Link from "next/link";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[var(--ixai-cream)] text-[var(--foreground)]">
      <div className="fixed inset-x-0 top-0 z-20 border-b border-[rgba(176,141,87,0.28)] bg-[rgba(245,240,230,0.88)] px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              IXAI
            </p>
            <p className="text-sm font-semibold text-[var(--ixai-forest)]">
              市場入口
            </p>
          </Link>
          <div className="h-8 w-8 rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-paper)] text-center text-sm font-semibold leading-8 text-[var(--ixai-forest)]">
            I
          </div>
        </div>
      </div>

      <Sidebar />

      <main className="min-h-screen pb-24 pt-16 md:ml-64 md:pb-0 md:pt-0">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
