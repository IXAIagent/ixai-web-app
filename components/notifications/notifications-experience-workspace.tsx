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
import { useTranslation } from "@/src/lib/i18n/use-locale";
import {
  getIntelligenceAlertSnapshot,
  type IntelligenceAlert,
  type IntelligenceAlertSnapshot,
} from "@/src/lib/intelligence/alerts";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function severityTone(severity: IntelligenceAlert["severity"]) {
  if (severity === "critical") return "border-[color-mix(in_srgb,var(--ixai-risk-critical)_30%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)]";
  if (severity === "warning") return "border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_9%,white)]";
  return "border-[var(--ixai-border)] bg-white/68";
}

function affectedLabel(item: IntelligenceAlert, fallback: string) {
  const affected = [
    ...item.affectedSymbols,
    ...item.affectedFcnIds,
    ...item.affectedAssetIds,
  ].slice(0, 4);

  return affected.length ? affected.join(", ") : fallback;
}

function priorityLabel(item: IntelligenceAlert, t: (key: string, fallback?: string) => string) {
  if (item.notificationPriority === "urgent") return t("priorityUrgent", "Urgent");
  if (item.notificationPriority === "high") return t("priorityHigh", "High");
  if (item.notificationPriority === "normal") return t("priorityNormal", "Normal");
  return t("priorityLow", "Low");
}

function NotificationCard({ item }: { item: IntelligenceAlert }) {
  const { t } = useTranslation("notifications");

  return (
    <article className={`rounded-lg border p-4 ${severityTone(item.severity)}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.title}</p>
        <span className="inline-flex w-fit rounded-full border border-current/20 bg-white/48 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
          {priorityLabel(item, t)}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
        <p>{t("why", "Why")}: {item.whyItMatters}</p>
        <p>{t("affected", "Affects")}: {affectedLabel(item, t("workspace", "Workspace"))}</p>
        <p className="font-semibold text-[var(--ixai-forest)]">
          {t("action", "Action")}: {item.whatToMonitor}
        </p>
      </div>
    </article>
  );
}

export function NotificationsExperienceWorkspace() {
  const { t } = useTranslation("notifications");
  const [snapshot, setSnapshot] = useState<IntelligenceAlertSnapshot | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      const result = await runWorkspaceSafe("notifications-experience-alert-snapshot", getIntelligenceAlertSnapshot, null);
      if (!mountedRef.current) return;
      setSnapshot(result.data);
    }

    queueMicrotask(() => void load());

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const alerts = useMemo(() => snapshot?.alerts ?? [], [snapshot?.alerts]);
  const urgentPriority = useMemo(
    () => alerts.filter((item) => item.notificationPriority === "urgent"),
    [alerts],
  );
  const highPriority = useMemo(
    () => alerts.filter((item) => item.notificationPriority === "high"),
    [alerts],
  );
  const normalPriority = useMemo(
    () => alerts.filter((item) => item.notificationPriority === "normal"),
    [alerts],
  );
  const lowPriority = useMemo(
    () => alerts.filter((item) => item.notificationPriority === "low"),
    [alerts],
  );
  const suppressed = snapshot?.notificationPreview.notifications.filter((item) => item.status === "suppressed") ?? [];
  const pending = snapshot?.notificationPreview.notifications.filter((item) => item.status === "pending") ?? [];
  const topItem = urgentPriority[0] ?? highPriority[0] ?? normalPriority[0] ?? lowPriority[0];

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          eyebrow={t("heroEyebrow", "Alerts")}
          kpis={[
            { description: t("urgentDescription", "Needs attention first."), icon: ShieldAlert, label: t("priorityUrgent", "Urgent"), tone: urgentPriority.length > 0 ? "critical" : "default", value: String(urgentPriority.length) },
            { description: t("highDescription", "Worth checking today."), icon: CircleAlert, label: t("priorityHigh", "High"), tone: highPriority.length > 0 ? "warning" : "default", value: String(highPriority.length) },
            { description: t("pendingDescription", "Ready for in-app preview."), icon: Bell, label: t("pending", "Pending"), value: String(pending.length) },
            { description: t("suppressedDescription", "Hidden by cooldown or de-duplication."), icon: CheckCircle2, label: t("suppressed", "Suppressed"), value: String(suppressed.length) },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                {t("heroQuestion", "What requires my attention?")}
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {topItem ? topItem.title : t("noUrgentAlerts", "No urgent alerts.")}
              </p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {t("heroBody", "IXAI turns intelligence signals into alerts that explain why they matter to your investments.")}
              </p>
            </>
          }
          summary={t("heroSummary", "Alerts answer what needs attention now, grouped by priority and explained in user language.")}
          title={t("heroTitle", "Alerts: what needs your attention.")}
        />

        <WorkspaceProductSection
          description={t("urgentSectionDescription", "Urgent and high priority alerts come first and always explain why they matter.")}
          eyebrow={t("priority", "Priority")}
          title={t("urgentAndHigh", "Urgent / High")}
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {[...urgentPriority, ...highPriority].length > 0 ? (
              [...urgentPriority, ...highPriority].map((item) => <NotificationCard item={item} key={item.id} />)
            ) : (
              <WorkspaceEmptyState
                body={t("emptyUrgentBody", "Nothing needs urgent attention. Important FCN, portfolio, or market items will appear here first.")}
                icon={CheckCircle2}
                title={t("emptyUrgentTitle", "No elevated attention needed.")}
              />
            )}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description={t("normalSectionDescription", "Normal priority alerts are worth checking, but they do not interrupt the top priority queue.")}
          eyebrow={t("priority", "Priority")}
          title={t("priorityNormal", "Normal")}
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {normalPriority.length > 0 ? (
              normalPriority.map((item) => <NotificationCard item={item} key={item.id} />)
            ) : (
              <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {t("emptyNormal", "No normal-priority alerts. Items worth checking later today will appear here.")}
              </p>
            )}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description={t("everythingElseDescription", "Lower priority and suppressed previews stay below attention items.")}
          eyebrow={t("everythingElse", "Everything Else")}
          title={t("lowSuppressedPreview", "Low / Suppressed / Channel Preview")}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">{t("priorityLow", "Low")}</h3>
              <div className="mt-3 grid gap-2">
                {lowPriority.slice(0, 4).map((item) => (
                  <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-3 text-sm text-[var(--ixai-forest-soft)]" key={item.id}>
                    {item.title}
                  </p>
                ))}
                {lowPriority.length === 0 ? <p className="text-sm text-[var(--ixai-forest-soft)]">{t("emptyLow", "No low-priority alerts right now.")}</p> : null}
              </div>
            </section>
            <section className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">{t("suppressed", "Suppressed")}</h3>
              <div className="mt-3 grid gap-2">
                {suppressed.slice(0, 4).map((item) => (
                  <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-3 text-sm text-[var(--ixai-forest-soft)]" key={item.id}>
                    {item.title}
                  </p>
                ))}
                {suppressed.length === 0 ? <p className="text-sm text-[var(--ixai-forest-soft)]">{t("emptySuppressed", "No alerts are hidden by cooldown right now.")}</p> : null}
              </div>
            </section>
            <section className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">{t("channels", "Channels")}</h3>
              <div className="mt-3 grid gap-2">
                {snapshot?.diagnostics.channelStatus.map((channel) => (
                  <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-3 text-sm text-[var(--ixai-forest-soft)]" key={channel.channel}>
                    <span className="font-semibold text-[var(--ixai-forest)]">{channel.channel}</span> · {channel.enabled ? t("ready", "Ready") : t("previewOnly", "Preview only")}
                  </p>
                ))}
                {!snapshot ? <p className="text-sm text-[var(--ixai-forest-soft)]">{t("loadingAlerts", "Loading alert preview.")}</p> : null}
              </div>
            </section>
          </div>
        </WorkspaceProductSection>

        {!alerts.length ? (
          <WorkspaceEmptyState
            actionHref="/my-ixai/watchlist"
            actionLabel={t("createWatchlist", "Create your watchlist")}
            body={t("emptyAlertsBody", "Add assets, FCNs, or watchlist items and IXAI will surface reminders that matter to your investments.")}
            icon={Bell}
            title={t("emptyAlertsTitle", "No alerts right now.")}
          />
        ) : null}

        <WorkspaceDiagnosticsPanel description={t("advancedDescription", "delivery preview and advanced checks")}>
          <WorkspaceKpiGrid
            items={[
              { description: t("inAppDescription", "In-app alert preview."), icon: Bell, label: t("inApp", "In-App"), value: snapshot?.diagnostics.inAppReady ? t("ready", "Ready") : t("preparing", "Preparing") },
              { description: t("externalDescription", "External delivery is not enabled by this page."), icon: Send, label: t("externalDelivery", "External Delivery"), value: t("off", "Off") },
              { description: t("previewTotalDescription", "Alert notification preview total."), icon: Eye, label: t("preview", "Preview"), value: String(snapshot?.notificationPreview.notifications.length ?? 0) },
            ]}
          />
          <NotificationCenterSummary autoLoad={false} />
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            {t("previewOnlyDisclaimer", "V20B creates in-app alert previews only. Telegram, LINE, email, browser push, and mobile push delivery remain disabled. This is monitoring context, not investment advice.")}
          </p>
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}
