"use client";

import { useEffect } from "react";
import { CheckCircle2, ClipboardList, Eye, Radio, Send, ShieldCheck } from "lucide-react";
import {
  ShellCard,
  ShellHeader,
  ShellMetricCard,
  ShellStatusPill,
} from "@/components/shell/shell-primitives";
import { trackEvent } from "@/src/lib/analytics/analytics";
import { getDistributionQueueSnapshot } from "@/src/lib/intelligence/distribution";
import type { DistributionQueueStatus } from "@/src/lib/intelligence/distribution";

const statusIcon = {
  draft: ClipboardList,
  published: Send,
  reviewed: ShieldCheck,
} as const;

const statusLabel: Record<DistributionQueueStatus, string> = {
  draft: "Draft",
  published: "Published",
  reviewed: "Reviewed",
};

export function DistributionQueueSnapshot() {
  const snapshot = getDistributionQueueSnapshot();

  useEffect(() => {
    trackEvent("intelligence_distribution_viewed", {
      draft_count: snapshot.counts.draft,
      path: window.location.pathname,
      published_count: snapshot.counts.published,
      reviewed_count: snapshot.counts.reviewed,
      source: "admin_distribution_queue",
      surface: "admin",
    });
  }, [snapshot.counts.draft, snapshot.counts.published, snapshot.counts.reviewed]);

  return (
    <ShellCard className="border-[var(--ixai-border)] bg-[#0a2119] p-5 sm:p-6">
      <ShellHeader
        action={<ShellStatusPill icon={Radio}>{snapshot.mode}</ShellStatusPill>}
        eyebrow="Distribution Queue"
        subtitle="Generate → Review → Distribute → Measure 的基礎佇列視圖。本版只顯示 In-App distribution readiness，不發送 LINE / Email / Push。"
        title="Intelligence Distribution Queue"
      />

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <ShellMetricCard icon={ClipboardList} label="Draft" value={snapshot.counts.draft} />
        <ShellMetricCard icon={ShieldCheck} label="Reviewed" value={snapshot.counts.reviewed} />
        <ShellMetricCard icon={Send} label="Published" value={snapshot.counts.published} />
      </div>

      <div className="mt-5 grid gap-3">
        {snapshot.items.map((item) => {
          const Icon = statusIcon[item.status];

          return (
            <article
              className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 md:grid-cols-[1fr_auto]"
              key={item.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                    <Icon className="h-3.5 w-3.5 shrink-0 stroke-current" aria-hidden="true" />
                    {statusLabel[item.status]}
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                    {item.kind}
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                    {item.channel === "in_app" ? "In-App" : item.channel}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-cream)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  Source: {item.source}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs leading-5 text-zinc-400 md:justify-end">
                {item.status === "published" ? (
                  <CheckCircle2 className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
                )}
                <span>{item.updatedAt}</span>
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-[rgba(245,240,230,0.56)]">
        {snapshot.note} Future external delivery requires explicit opt-in persistence, delivery logs,
        unsubscribe controls, and human review.
      </p>
    </ShellCard>
  );
}

