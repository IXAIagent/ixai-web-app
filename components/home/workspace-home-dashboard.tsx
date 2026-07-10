"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CalendarClock,
  Eye,
  LineChart,
  Newspaper,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

import {
  WorkspaceDiagnosticsPanel,
  WorkspaceEmptyState,
  WorkspaceInsightCard,
  WorkspaceKpiGrid,
  WorkspaceLoadingCard,
  WorkspaceProductHero,
  WorkspaceProductSection,
  WorkspaceStateMessage,
  WorkspaceStatusBadge,
} from "@/components/workspace/product";
import {
  getIntelligenceAlertSnapshot,
  type IntelligenceAlert,
  type IntelligenceAlertSnapshot,
} from "@/src/lib/intelligence/alerts";
import type { IntelligenceHealth, IntelligenceItem } from "@/src/lib/intelligence/platform";
import { runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "待建立";
  return new Intl.NumberFormat("zh-TW", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "待更新";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "待更新";

  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function healthLabel(health: IntelligenceHealth | undefined) {
  if (health === "critical") return "需要優先處理";
  if (health === "elevated" || health === "watch") return "需要留意";
  if (health === "healthy") return "穩定";
  return "資料整理中";
}

function healthTone(health: IntelligenceHealth | undefined) {
  if (health === "critical") return "critical" as const;
  if (health === "elevated" || health === "watch") return "warning" as const;
  if (health === "healthy") return "success" as const;
  return "default" as const;
}

function alertTone(alert: IntelligenceAlert) {
  if (alert.severity === "critical" || alert.notificationPriority === "urgent") return "critical" as const;
  if (alert.severity === "warning" || alert.notificationPriority === "high") return "warning" as const;
  return "default" as const;
}

function alertBadge(alert: IntelligenceAlert) {
  if (alert.notificationPriority === "urgent") return "Urgent";
  if (alert.notificationPriority === "high") return "High";
  if (alert.notificationPriority === "normal") return "Normal";
  return "Low";
}

function affectedLabel(alert: IntelligenceAlert) {
  const affected = [
    ...alert.affectedSymbols,
    ...alert.affectedFcnIds,
    ...alert.affectedAssetIds,
  ].slice(0, 4);

  return affected.length > 0 ? affected.join(", ") : "Workspace";
}

function itemBadge(item: IntelligenceItem) {
  if (item.priority === "urgent") return "Urgent";
  if (item.priority === "high") return "High";
  if (item.health === "critical") return "Critical";
  if (item.health === "watch" || item.health === "elevated") return "Watch";
  return "Info";
}

export function WorkspaceHomeDashboard() {
  const [snapshot, setSnapshot] = useState<IntelligenceAlertSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    async function loadHomeSnapshot() {
      setIsLoading(true);
      const result = await runWorkspaceSafe("v20c-home-alert-snapshot", getIntelligenceAlertSnapshot, null);

      if (!mountedRef.current) return;
      setSnapshot(result.data);
      setIsLoading(false);
    }

    queueMicrotask(() => void loadHomeSnapshot());

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const platform = snapshot?.platformSnapshot;
  const alerts = useMemo(() => snapshot?.alerts ?? [], [snapshot?.alerts]);
  const focusItems = platform?.todayFocus.items.slice(0, 3) ?? [];
  const criticalAlerts = alerts
    .filter((alert) => alert.notificationPriority === "urgent" || alert.notificationPriority === "high" || alert.severity === "critical")
    .slice(0, 3);
  const fcnAlerts = alerts
    .filter((alert) => alert.ruleFamily === "fcn" || alert.affectedFcnIds.length > 0)
    .slice(0, 3);
  const dataQualityAlerts = alerts.filter((alert) => alert.type === "data-quality" || alert.type === "provider-fallback");
  const marketItems = platform?.market.items.slice(0, 3) ?? [];
  const portfolioItems = platform?.portfolio.items.slice(0, 3) ?? [];
  const fcnItems = platform?.fcn.items.slice(0, 3) ?? [];
  const todayQuestion = focusItems[0]?.title ?? criticalAlerts[0]?.title ?? "今天沒有需要立即處理的項目";

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/portfolio", icon: WalletCards, label: "查看我的資產" },
            { href: "/my-ixai/notifications", icon: Bell, label: "查看重要提醒", variant: "secondary" },
          ]}
          eyebrow="Today"
          kpis={[
            {
              description: "IXAI 今天整理出的前三個重點。",
              icon: Sparkles,
              label: "Today Focus",
              tone: focusItems.length > 0 ? "success" : "default",
              value: String(focusItems.length),
            },
            {
              description: "目前可估算的資產總覽。",
              icon: WalletCards,
              label: "Portfolio",
              value: formatCurrency(platform?.portfolio.estimatedValue),
            },
            {
              description: "需要先看的提醒。",
              icon: ShieldAlert,
              label: "Critical Alerts",
              tone: criticalAlerts.length > 0 ? "critical" : "success",
              value: String(criticalAlerts.length),
            },
            {
              description: "資料品質或覆蓋不足，會留在 Advanced。",
              icon: TriangleAlert,
              label: "Data Quality",
              tone: dataQualityAlerts.length > 0 ? "warning" : "success",
              value: String(dataQualityAlerts.length),
            },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                今天最重要的是什麼？
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{todayQuestion}</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                IXAI 會先整理重點，再讓你逐步查看 Portfolio、FCN、Markets 與 Alerts。這不是投資建議。
              </p>
            </>
          }
          summary="Workspace Home 只放今天需要理解與優先處理的事情；技術細節與資料品質問題都收在 Advanced。"
          title="今天你需要知道什麼。"
        />

        {isLoading ? (
          <WorkspaceLoadingCard
            body="正在整理 Today Focus、Portfolio Health、FCN Watch 與重要提醒。"
            title="正在整理你的投資工作台"
          />
        ) : null}

        {!isLoading && !snapshot ? (
          <WorkspaceStateMessage
            body="目前無法整理首頁重點。請稍後重新整理；既有 Workspace 頁面仍可分別查看。"
            variant="provider-unavailable"
          />
        ) : null}

        <WorkspaceProductSection
          description="先看最重要的三件事，再決定要進 Portfolio、FCN、Markets 或 Alerts。"
          eyebrow="Today Focus"
          title="今天最值得先看的事"
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {focusItems.length > 0 ? (
              focusItems.map((item) => (
                <WorkspaceInsightCard
                  actionHref={
                    item.domain === "portfolio"
                      ? "/my-ixai/portfolio"
                      : item.domain === "fcn"
                        ? "/my-ixai/fcn"
                        : item.domain === "market"
                          ? "/my-ixai/watchlist"
                          : "/my-ixai/risk"
                  }
                  actionLabel="查看細節"
                  badge={itemBadge(item)}
                  badgeVariant={item.priority}
                  icon={Sparkles}
                  key={item.id}
                  summary={item.summary}
                  title={item.title}
                  tone={healthTone(item.health)}
                  why={item.whyItMatters}
                />
              ))
            ) : (
              <WorkspaceEmptyState
                body="目前沒有新的重點。新增資產、FCN 或 Watchlist 後，IXAI 會把相關變化整理到這裡。"
                icon={Sparkles}
                title="今天沒有需要立即處理的重點。"
              />
            )}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          action={<WorkspaceStatusBadge variant={platform?.portfolio.health === "healthy" ? "healthy" : "warning"}>{healthLabel(platform?.portfolio.health)}</WorkspaceStatusBadge>}
          description="Portfolio Health 只回答你的資產狀態，不混入市場新聞或系統資訊。"
          eyebrow="Portfolio Health"
          title="我的資產現在如何"
        >
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <WorkspaceKpiGrid
              items={[
                {
                  description: "目前可估算的總資產。",
                  icon: WalletCards,
                  label: "Estimated Value",
                  value: formatCurrency(platform?.portfolio.estimatedValue),
                },
                {
                  description: "有進入 Intelligence Platform 的資產數。",
                  icon: LineChart,
                  label: "Positions",
                  value: String(platform?.portfolio.positionCount ?? 0),
                },
                {
                  description: "今天需要注意的 Portfolio items。",
                  icon: ShieldAlert,
                  label: "Portfolio Items",
                  tone: (platform?.portfolio.items.length ?? 0) > 0 ? "warning" : "default",
                  value: String(platform?.portfolio.items.length ?? 0),
                },
              ]}
            />
            <div className="grid gap-3">
              {portfolioItems.length > 0 ? (
                portfolioItems.map((item) => (
                  <WorkspaceInsightCard
                    actionHref="/my-ixai/portfolio"
                    actionLabel="Inspect Portfolio"
                    badge={itemBadge(item)}
                    badgeVariant={item.priority}
                    key={item.id}
                    summary={item.summary}
                    title={item.title}
                    tone={healthTone(item.health)}
                    why={item.whyItMatters}
                  />
                ))
              ) : (
                <WorkspaceEmptyState
                  actionHref="/my-ixai/input"
                  actionLabel="新增資產"
                  body="No assets yet. Add holdings so IXAI can explain portfolio health instead of showing a blank dashboard."
                  icon={WalletCards}
                  title="Portfolio health is waiting for assets."
                />
              )}
            </div>
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="只顯示需要先處理的提醒；資料品質問題留在 Advanced，避免打斷主要工作流。"
          eyebrow="Critical Alerts"
          title="哪些提醒最重要"
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.map((alert) => (
                <WorkspaceInsightCard
                  actionHref="/my-ixai/notifications"
                  actionLabel="查看提醒"
                  badge={alertBadge(alert)}
                  badgeVariant={alert.notificationPriority}
                  icon={Bell}
                  key={alert.id}
                  summary={`${alert.summary} Affects: ${affectedLabel(alert)}.`}
                  title={alert.title}
                  tone={alertTone(alert)}
                  why={alert.whyItMatters}
                />
              ))
            ) : (
              <WorkspaceEmptyState
                body="No urgent alerts. If FCN, Portfolio, or market items become important, they will appear here first."
                icon={Bell}
                title="No critical alerts right now."
              />
            )}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="FCN Watch focuses on KI/KO, observation, coupon and data coverage. It does not duplicate the full FCN page."
          eyebrow="FCN Watch"
          title="哪些 FCN 要注意"
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {(fcnAlerts.length > 0 ? fcnAlerts : fcnItems).slice(0, 3).map((item) => {
              if ("whyItMatters" in item && "summary" in item && "ruleFamily" in item) {
                return (
                  <WorkspaceInsightCard
                    actionHref="/my-ixai/fcn"
                    actionLabel="查看 FCN"
                    badge={alertBadge(item)}
                    badgeVariant={item.notificationPriority}
                    icon={CalendarClock}
                    key={item.id}
                    summary={item.summary}
                    title={item.title}
                    tone={alertTone(item)}
                    why={item.whyItMatters}
                  />
                );
              }

              return (
                <WorkspaceInsightCard
                  actionHref="/my-ixai/fcn"
                  actionLabel="查看 FCN"
                  badge={itemBadge(item)}
                  badgeVariant={item.priority}
                  icon={CalendarClock}
                  key={item.id}
                  summary={item.summary}
                  title={item.title}
                  tone={healthTone(item.health)}
                  why={item.whyItMatters}
                />
              );
            })}
            {fcnAlerts.length === 0 && fcnItems.length === 0 ? (
              <WorkspaceEmptyState
                actionHref="/my-ixai/input/fcn"
                actionLabel="新增 FCN"
                body="No FCN watch items yet. Add FCN positions to monitor observations, coupons, KI/KO distance and coverage."
                icon={CalendarClock}
                title="No FCN items need attention."
              />
            ) : null}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Market Summary explains external events that may affect your attention. Portfolio performance stays on Portfolio."
          eyebrow="Market Summary"
          title="今天市場發生什麼"
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {marketItems.length > 0 ? (
              marketItems.map((item) => (
                <WorkspaceInsightCard
                  actionHref="/my-ixai/watchlist"
                  actionLabel="查看市場"
                  badge={itemBadge(item)}
                  badgeVariant={item.priority}
                  icon={Newspaper}
                  key={item.id}
                  summary={item.summary}
                  title={item.title}
                  tone={healthTone(item.health)}
                  why={item.whyItMatters}
                />
              ))
            ) : (
              <WorkspaceEmptyState
                actionHref="/my-ixai/watchlist"
                actionLabel="建立 Watchlist"
                body="No market events today. Add watched symbols so IXAI can explain which events affect your attention."
                icon={Newspaper}
                title="Market summary is waiting for your watchlist."
              />
            )}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          action={
            <a
              className="inline-flex rounded-full border border-[var(--ixai-border)] bg-white/68 px-4 py-2 text-sm font-semibold text-[var(--ixai-forest)] transition hover:border-[var(--ixai-gold)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ixai-gold)]"
              href="/my-ixai/morning-brief"
            >
              閱讀完整 Morning Brief
            </a>
          }
          description="首頁只保留摘要；完整報告留在 Morning Brief。"
          eyebrow="Morning Brief Preview"
          title="今日摘要"
        >
          <div className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
            <p className="text-base font-semibold text-[var(--ixai-forest)]">
              先看 Today Focus，再讀完整報告。
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              Morning Brief 會整理市場、Portfolio、FCN、Risk 與下一步要留意的事；首頁不再重複完整報告。
            </p>
          </div>
        </WorkspaceProductSection>

        <WorkspaceDiagnosticsPanel description="Advanced readiness, data quality, and delivery preview checks">
          <WorkspaceKpiGrid
            items={[
              {
                description: "V20A platform readiness.",
                icon: Sparkles,
                label: "Intelligence",
                value: platform?.diagnostics.readiness ?? "unknown",
              },
              {
                description: "V20B alert preview readiness.",
                icon: Bell,
                label: "Alerts",
                value: snapshot?.diagnostics.readiness ?? "unknown",
              },
              {
                description: "Items hidden from the main page because they are data quality, not user action.",
                icon: TriangleAlert,
                label: "Data Quality Items",
                value: String(dataQualityAlerts.length),
              },
              {
                description: "Last snapshot update.",
                icon: Eye,
                label: "Last Updated",
                value: formatDateTime(snapshot?.generatedAt),
              },
            ]}
          />
          {(platform?.diagnostics.warningIssues.length ?? 0) > 0 ? (
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4">
              <h3 className="text-sm font-semibold text-[var(--ixai-forest)]">Advanced warnings</h3>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {platform?.diagnostics.warningIssues.slice(0, 5).map((issue) => (
                  <li key={issue}>- {issue}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}
