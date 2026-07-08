"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCircle2, CircleAlert, Eye, Send, ShieldAlert } from "lucide-react";

import { NotificationCenterSummary } from "@/components/notifications/notification-center-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceEmptyState,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";
import { getWorkspaceNotificationSummary, type WorkspaceNotificationItem, type WorkspaceNotificationSummary } from "@/src/lib/notifications";
import { getNotificationDeliveryReadiness } from "@/src/lib/notifications/delivery";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function severityTone(severity: string) {
  if (severity === "critical" || severity === "high") return "border-[color-mix(in_srgb,var(--ixai-risk-critical)_30%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)]";
  if (severity === "warning") return "border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_9%,white)]";
  return "border-[var(--ixai-border)] bg-white/68";
}

function affectedLabel(item: WorkspaceNotificationItem) {
  if (item.category === "fcn") return "FCN";
  if (item.category === "portfolio") return "Portfolio";
  if (item.category === "market" || item.category === "watchlist") return "Markets";
  if (item.category === "risk") return "Risk";
  if (item.category === "schedule") return "Timeline";
  return "Workspace";
}

function actionLabel(item: WorkspaceNotificationItem) {
  if (item.category === "fcn") return "Review FCN";
  if (item.category === "portfolio") return "Open Portfolio";
  if (item.category === "market" || item.category === "watchlist") return "Read";
  if (item.category === "risk") return "Review Risk";
  if (item.category === "schedule") return "Open Timeline";
  return "Review";
}

function NotificationCard({ item }: { item: WorkspaceNotificationItem }) {
  return (
    <article className={`rounded-lg border p-4 ${severityTone(item.severity)}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.title}</p>
        <span className="inline-flex w-fit rounded-full border border-current/20 bg-white/48 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
          {item.severity === "critical" || item.severity === "high" ? "High" : item.severity === "warning" ? "Medium" : "Information"}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
        <p>Why: {item.message}</p>
        <p>Affects: {affectedLabel(item)}</p>
        <p className="font-semibold text-[var(--ixai-forest)]">Action: {actionLabel(item)}</p>
      </div>
    </article>
  );
}

export function NotificationsExperienceWorkspace() {
  const [summary, setSummary] = useState<WorkspaceNotificationSummary | null>(null);
  const mountedRef = useRef(false);
  const delivery = getNotificationDeliveryReadiness();

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      const result = await runWorkspaceSafe("notifications-experience-summary", getWorkspaceNotificationSummary, null);
      if (!mountedRef.current) return;
      setSummary(result.data);
    }

    queueMicrotask(() => void load());

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const notifications = useMemo(() => summary?.notifications ?? [], [summary?.notifications]);
  const highPriority = useMemo(
    () => notifications.filter((item) => item.severity === "critical" || item.severity === "high"),
    [notifications],
  );
  const mediumPriority = useMemo(
    () => notifications.filter((item) => item.severity === "warning"),
    [notifications],
  );
  const information = useMemo(
    () => notifications.filter((item) => item.severity === "info"),
    [notifications],
  );
  const completed = useMemo(
    () => notifications.filter((item) => item.readStatus === "read"),
    [notifications],
  );
  const history = notifications.slice(0, 8);
  const topItem = highPriority[0] ?? mediumPriority[0] ?? information[0];

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          eyebrow="Notifications"
          kpis={[
            { description: "Needs attention first.", icon: ShieldAlert, label: "High", tone: highPriority.length > 0 ? "critical" : "default", value: String(highPriority.length) },
            { description: "Worth checking today.", icon: CircleAlert, label: "Medium", tone: mediumPriority.length > 0 ? "warning" : "default", value: String(mediumPriority.length) },
            { description: "Informational updates.", icon: Bell, label: "Information", value: String(information.length) },
            { description: "Already read or completed.", icon: CheckCircle2, label: "Completed", value: String(completed.length) },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                What requires my attention?
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {topItem ? topItem.title : "No urgent notifications."}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                Notifications are for user impact, not system logs or developer event feeds.
              </p>
            </>
          }
          summary="Notifications answer what requires attention now. Provider, runtime, delivery, and diagnostic state stay in Advanced."
          title="Notifications: what needs your attention."
        />

        <WorkspaceProductSection
          description="High priority items come first and always explain why they matter."
          eyebrow="Priority"
          title="High"
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {highPriority.length > 0 ? (
              highPriority.map((item) => <NotificationCard item={item} key={item.id} />)
            ) : (
              <WorkspaceEmptyState
                body="No high-priority notifications right now."
                icon={CheckCircle2}
                title="No elevated attention needed."
              />
            )}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Medium priority items are worth checking, but they do not interrupt the top priority queue."
          eyebrow="Priority"
          title="Medium"
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {mediumPriority.length > 0 ? (
              mediumPriority.map((item) => <NotificationCard item={item} key={item.id} />)
            ) : (
              <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                No medium-priority notifications.
              </p>
            )}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Information and completed items stay below attention items."
          eyebrow="Everything Else"
          title="Information / Completed / History"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">Information</h3>
              <div className="mt-3 grid gap-2">
                {information.slice(0, 4).map((item) => (
                  <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-3 text-sm text-[var(--ixai-forest-soft)]" key={item.id}>
                    {item.title}
                  </p>
                ))}
                {information.length === 0 ? <p className="text-sm text-[var(--ixai-forest-soft)]">No information-only updates.</p> : null}
              </div>
            </section>
            <section className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">Completed</h3>
              <div className="mt-3 grid gap-2">
                {completed.slice(0, 4).map((item) => (
                  <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-3 text-sm text-[var(--ixai-forest-soft)]" key={item.id}>
                    {item.title}
                  </p>
                ))}
                {completed.length === 0 ? <p className="text-sm text-[var(--ixai-forest-soft)]">No completed notifications yet.</p> : null}
              </div>
            </section>
            <section className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">History</h3>
              <div className="mt-3 grid gap-2">
                {history.slice(0, 5).map((item) => (
                  <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-3 text-sm text-[var(--ixai-forest-soft)]" key={`history-${item.id}`}>
                    {item.title}
                  </p>
                ))}
                {history.length === 0 ? <p className="text-sm text-[var(--ixai-forest-soft)]">No notification history yet.</p> : null}
              </div>
            </section>
          </div>
        </WorkspaceProductSection>

        {!notifications.length ? (
          <WorkspaceEmptyState
            actionHref="/my-ixai/watchlist"
            actionLabel="Create your watchlist"
            body="No notifications require attention. Add assets, FCNs, or watchlist items to make alerts more personal."
            icon={Bell}
            title="No notifications right now."
          />
        ) : null}

        <WorkspaceDiagnosticsPanel description="delivery readiness, source details, advanced notification readback">
          <WorkspaceKpiGrid
            items={[
              { description: "In-app notification preview.", icon: Bell, label: "In-App", value: delivery.readyChannelCount > 0 ? "Ready" : "Preparing" },
              { description: "External delivery is not enabled by this page.", icon: Send, label: "External Delivery", value: "Off" },
              { description: "Notification readback total.", icon: Eye, label: "Readback", value: String(summary?.notificationCount ?? 0) },
            ]}
          />
          <NotificationCenterSummary autoLoad={false} />
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            {delivery.informationalOnlyDisclaimer}
          </p>
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}
