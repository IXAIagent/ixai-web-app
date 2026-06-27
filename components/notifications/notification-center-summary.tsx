"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, RefreshCw, Send } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getWorkspaceNotificationSummary } from "@/src/lib/notifications";
import { getNotificationDeliveryReadiness } from "@/src/lib/notifications/delivery";
import type {
  WorkspaceNotificationSeverity,
  WorkspaceNotificationSummary,
} from "@/src/lib/notifications";

const READ_STORAGE_KEY = "ixai.workspace.notifications.read.v520";

const SEVERITY_CLASS: Record<WorkspaceNotificationSeverity, string> = {
  critical:
    "border-[color-mix(in_srgb,var(--ixai-risk-critical)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_9%,white)]",
  high:
    "border-[color-mix(in_srgb,var(--ixai-risk-watch)_40%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_10%,white)]",
  info: "border-[var(--ixai-border)] bg-white/70",
  warning:
    "border-[color-mix(in_srgb,var(--ixai-gold)_44%,transparent)] bg-[rgba(255,250,240,0.82)]",
};

function loadReadIds() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(READ_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function saveReadIds(ids: string[]) {
  try {
    window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Local read state should not block notification readback.
  }
}

export function NotificationCenterSummary({ autoLoad = true }: { autoLoad?: boolean }) {
  const [summary, setSummary] = useState<WorkspaceNotificationSummary | null>(null);
  const delivery = getNotificationDeliveryReadiness();
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [hasError, setHasError] = useState(false);

  async function refresh() {
    setIsLoading(true);
    setHasError(false);
    try {
      setSummary(await getWorkspaceNotificationSummary({ readIds: loadReadIds() }));
    } catch {
      setSummary(null);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  function markAllRead() {
    if (!summary) return;
    saveReadIds(summary.notifications.map((item) => item.id));
    void refresh();
  }

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    queueMicrotask(() => void refresh());
  }, [autoLoad]);

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Bell} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Notification Center
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Local notification readback
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Converts Alert Engine cards into local notifications. Delivery and backend persistence are not implemented.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:opacity-60"
            disabled={!summary || summary.notificationCount === 0}
            onClick={markAllRead}
            type="button"
          >
            <CheckCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            Mark read
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void refresh()}
            type="button"
          >
            <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            {isLoading ? "讀取中" : "重新整理"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {[
          ["Notifications", summary?.notificationCount ?? "--"],
          ["Unread", summary?.unreadCount ?? "--"],
          ["Critical", summary?.criticalCount ?? "--"],
          ["High", summary?.highCount ?? "--"],
        ].map(([label, value]) => (
          <article
            className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4"
            key={label}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
              {label}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-[var(--ixai-forest)]">
              {value}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {summary?.notifications.slice(0, 10).map((item) => (
          <article
            className={`rounded-xl border p-4 ${SEVERITY_CLASS[item.severity]}`}
            key={item.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-[var(--ixai-forest)]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
                  {item.category} · {item.sourceEngine}
                </p>
              </div>
              <span className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                {item.readStatus}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              {item.message}
            </p>
          </article>
        ))}
      </div>

      {summary?.notificationCount === 0 ? (
        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          No notification cards are available yet.
        </div>
      ) : !summary ? (
        <div className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          {hasError
            ? "Notification readback could not be loaded. Existing Workspace cards remain available."
            : "Notification readback is available on demand. Use Refresh to load local notification cards."}
        </div>
      ) : null}

      {summary ? (
        <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          {summary.informationalOnlyDisclaimer}
        </p>
      ) : null}

      <article className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
            Delivery readiness
          </p>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">
          {delivery.summary}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {delivery.channels.map((channel) => (
            <span
              className="rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]"
              key={channel.channel}
            >
              {channel.channel}: {channel.status}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
