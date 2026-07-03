"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, Send, ShieldAlert } from "lucide-react";

import { NotificationCenterSummary } from "@/components/notifications/notification-center-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceEmptyState,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";
import { useTranslation } from "@/src/lib/i18n";
import { getWorkspaceNotificationSummary, type WorkspaceNotificationSummary } from "@/src/lib/notifications";
import { getNotificationDeliveryReadiness } from "@/src/lib/notifications/delivery";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function severityTone(severity: string) {
  if (severity === "critical" || severity === "high") return "border-[color-mix(in_srgb,var(--ixai-risk-critical)_30%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-critical)_8%,white)]";
  if (severity === "warning") return "border-[color-mix(in_srgb,var(--ixai-risk-watch)_34%,transparent)] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_9%,white)]";
  return "border-[var(--ixai-border)] bg-white/68";
}

export function NotificationsExperienceWorkspace() {
  const { t } = useTranslation("productPolish");
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

  const infoCount = Math.max((summary?.notificationCount ?? 0) - (summary?.criticalCount ?? 0) - (summary?.highCount ?? 0), 0);
  const importantNotifications = (summary?.notifications ?? []).filter((item) => item.severity === "critical" || item.severity === "high");
  const todayNotifications = (summary?.notifications ?? []).filter((item) => item.severity !== "critical" && item.severity !== "high").slice(0, 6);
  const historyNotifications = (summary?.notifications ?? []).slice(0, 8);

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          eyebrow="Notifications"
          kpis={[
            { description: "需要優先查看的提醒。", icon: ShieldAlert, label: t("important"), tone: summary?.criticalCount ? "critical" : "default", value: String(summary?.criticalCount ?? 0) },
            { description: "今天值得留意的提醒。", icon: Bell, label: t("today"), tone: summary?.highCount ? "warning" : "default", value: String(summary?.highCount ?? 0) },
            { description: "一般狀態或資訊提醒。", icon: CheckCircle2, label: t("informationOnly"), value: String(infoCount) },
            { description: "外部通知尚未啟用。", icon: Send, label: t("dataStatus"), value: delivery.readyChannelCount > 0 ? "App 內可用" : t("preparing") },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                今天需要注意
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{summary?.unreadCount ?? 0} 則未讀</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                只整理需要注意、今天留意與一般資訊，不把事件 log 放在第一眼。
              </p>
            </>
          }
          summary="提醒中心把風險、FCN、watchlist 與系統狀態整理成優先級，不啟用 email、LINE、Telegram 或外部推送。"
          title="提醒中心：今天有哪些需要注意。"
        />

        <WorkspaceProductSection
          description="依優先級呈現今天的提醒，不顯示原始事件紀錄。"
          eyebrow={t("today")}
          title="今天的提醒"
        >
          {summary?.notifications.length ? (
            <div className="grid gap-4">
              <div className="grid gap-3 lg:grid-cols-2">
                {importantNotifications.length ? importantNotifications.map((item) => (
                  <article className={`rounded-lg border p-4 ${severityTone(item.severity)}`} key={item.id}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.title}</p>
                      <span className="rounded-full border border-current/20 bg-white/48 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                        {t("important")}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.message}</p>
                  </article>
                )) : (
                  <WorkspaceEmptyState
                    body={t("noImmediateAction")}
                    icon={CheckCircle2}
                    title={t("completed")}
                  />
                )}
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-[var(--ixai-forest)]">{t("today")}</p>
                <div className="grid gap-3 lg:grid-cols-2">
                  {todayNotifications.map((item) => (
                <article className={`rounded-lg border p-4 ${severityTone(item.severity)}`} key={item.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.title}</p>
                    <span className="rounded-full border border-current/20 bg-white/48 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                      {item.severity === "critical" || item.severity === "high" ? "需要留意" : "資訊"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.message}</p>
                </article>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-[var(--ixai-forest)]">{t("history")}</p>
                <div className="grid gap-2">
                  {historyNotifications.map((item) => (
                    <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3 text-sm text-[var(--ixai-forest-soft)]" key={`history-${item.id}`}>
                      {item.title}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <WorkspaceEmptyState
              actionHref="/my-ixai/watchlist"
              actionLabel={t("emptyAlertsAction")}
              body={t("emptyAlertsBody")}
              icon={Bell}
              title={t("emptyAlertsTitle")}
            />
          )}
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="顯示通知功能狀態，但不用工程語言。"
          eyebrow="Notification Settings"
          title="通知方式"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "App 內提醒目前可用。", icon: Bell, label: "App 內提醒", value: delivery.readyChannelCount > 0 ? "可用" : "準備中" },
              { description: "外部 email 尚未啟用。", icon: Send, label: "Email", value: "準備中" },
              { description: "LINE / Telegram 尚未啟用。", icon: Send, label: "外部推送", value: "準備中" },
              { description: "不會自動送出外部通知。", icon: CheckCircle2, label: "安全邊界", value: "保留" },
            ]}
          />
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {delivery.channels.map((channel) => (
              <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4" key={channel.channel}>
                <p className="text-base font-semibold capitalize text-[var(--ixai-forest)]">{channel.channel}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {channel.status === "active" ? "已可使用" : "尚未啟用 / 準備中"}
                </p>
              </article>
            ))}
          </div>
        </WorkspaceProductSection>

        <WorkspaceDiagnosticsPanel description="通知方式、讀取狀態與安全邊界">
          <NotificationCenterSummary autoLoad={false} />
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            {delivery.informationalOnlyDisclaimer}
          </p>
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}
