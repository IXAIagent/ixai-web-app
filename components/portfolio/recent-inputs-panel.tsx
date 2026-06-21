"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import {
  loadRecentPortfolioInputs,
  type RecentPortfolioInput,
} from "@/src/lib/portfolio/input/recent-inputs";

const CATEGORY_LABEL: Record<RecentPortfolioInput["category"], string> = {
  CASH: "Cash",
  CRYPTO: "Crypto",
  DUAL: "Dual",
  FCN: "FCN",
  GRID: "Grid",
  STOCK: "Stock",
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("zh-TW", {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      month: "2-digit",
    }).format(new Date(value));
  } catch {
    return "剛剛";
  }
}

export function RecentInputsPanel() {
  const [items, setItems] = useState<RecentPortfolioInput[]>([]);

  useEffect(() => {
    function syncItems() {
      setItems(loadRecentPortfolioInputs());
    }

    syncItems();
    window.addEventListener("ixai:portfolio-input:changed", syncItems);
    window.addEventListener("storage", syncItems);

    return () => {
      window.removeEventListener("ixai:portfolio-input:changed", syncItems);
      window.removeEventListener("storage", syncItems);
    };
  }, []);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Recent Inputs
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
            最近建立的資產草稿
          </h2>
        </div>
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] sm:w-fit"
          href="/my-ixai/input"
        >
          前往 Asset Input
          <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {items.slice(0, 3).map((item) => (
            <article
              className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
              key={item.id}
            >
              <div className="flex items-start justify-between gap-3">
                <FeatureIcon icon={Clock3} size="sm" shadow={false} />
                <span className="rounded-full border border-[rgba(176,141,87,0.32)] bg-white/70 px-2.5 py-1 font-mono text-[10px] font-semibold text-[var(--ixai-forest-soft)]">
                  {CATEGORY_LABEL[item.category]}
                </span>
              </div>
              <h3 className="mt-3 break-words text-lg font-semibold text-[var(--ixai-forest)]">
                {item.title}
              </h3>
              <p className="mt-1 text-xs font-semibold text-[var(--ixai-gold)]">
                {formatDate(item.createdAt)}
              </p>
              <ul className="mt-3 grid gap-1 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {item.details.slice(0, 3).map((detail) => (
                  <li className="break-words" key={detail}>
                    {detail}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <p className="text-sm leading-7 text-[var(--ixai-forest-soft)]">
            尚未有本機輸入紀錄。新增股票、Crypto 或 FCN 後，這裡會顯示最近的 local mock state。
            v4.10 之後，新的輸入也會同步到 Input Truth Bridge，並以 pending 狀態出現在 Workspace readback。
          </p>
        </div>
      )}
    </section>
  );
}
