"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Eye } from "lucide-react";
import { ensureDefaultWatchlistSeed } from "@/src/lib/watchlist-defaults";

export function WatchlistAccountStatus() {
  // SSR neutral count so hydration matches; localStorage is read after mount.
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setCount(ensureDefaultWatchlistSeed().length);
    }, 0);

    function refresh() {
      setCount(ensureDefaultWatchlistSeed().length);
    }

    window.addEventListener("ixai-watchlist-change", refresh);

    return () => {
      window.clearTimeout(handle);
      window.removeEventListener("ixai-watchlist-change", refresh);
    };
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
            <Eye className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              自選觀察狀態
            </p>
            <h2 className="mt-2 text-lg font-semibold leading-6 text-[var(--ixai-forest)] sm:text-xl">
              {count === null
                ? "正在讀取自選觀察..."
                : count === 0
                  ? "尚未加入任何標的"
                  : `目前自選觀察：${count} 個標的`}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              自選觀察會記住你關注的股票、ETF、指數與 Crypto；登入後可逐步同步至 IXAI Account。
            </p>
          </div>
        </div>
        <Link
          className="ixai-cta-forest inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
          href="/watchlist"
        >
          管理自選觀察
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
