"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Globe2,
  HeartPulse,
  Info,
  Languages,
  Lock,
  Settings,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { I18nFoundationStatusCard } from "@/components/i18n/i18n-foundation-status-card";
import { LocalizationPreferenceCard } from "@/components/i18n/localization-preference-card";
import { SettingsRuntimeDiagnosticsControl } from "@/components/workspace/settings-runtime-diagnostics-control";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";

const settingsCards = [
  {
    description: "管理登入帳號與個人 Workspace 入口。",
    href: "/account",
    icon: UserCircle,
    label: "General",
    status: "可用",
  },
  {
    description: "整理 Workspace 顯示、資產入口與工作流偏好。",
    href: "/my-ixai/home",
    icon: Settings,
    label: "Workspace",
    status: "已整理",
  },
  {
    description: "切換語言、地區與顯示格式。",
    icon: Languages,
    label: "Language",
    status: "可切換",
  },
  {
    description: "查看提醒偏好；外部推送仍未啟用。",
    href: "/settings/notifications",
    icon: Bell,
    label: "Notifications",
    status: "準備中",
  },
  {
    description: "資料與隱私設定目前以本機偏好為主。",
    icon: Lock,
    label: "Privacy",
    status: "保留",
  },
  {
    description: "查看 Beta 狀態、系統狀態與進階資訊。",
    href: "/my-ixai/beta",
    icon: Info,
    label: "About",
    status: "已整理",
  },
];

export function SettingsExperienceWorkspace() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          eyebrow="Settings"
          kpis={[
            { description: "帳號與一般設定。", icon: UserCircle, label: "General", value: "可用" },
            { description: "語言與地區顯示偏好。", icon: Globe2, label: "Language", value: "可切換" },
            { description: "提醒設定預覽。", icon: Bell, label: "Notifications", value: "準備中" },
            { description: "Health、Beta、進階診斷都在這裡。", icon: ShieldCheck, label: "Advanced", value: "已收納" },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                Advanced
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">進階資訊</p>
              <p className="mt-3 text-sm leading-6 text-white/68">
                系統狀態與 Beta 資訊不再放在第一層 navigation，統一收在 Settings。
              </p>
            </>
          }
          summary="設定頁整理語言、通知、Workspace 偏好、隱私與進階資訊。一般使用者先看可操作設定，工程診斷收到底部。"
          title="設定：管理你的 IXAI Workspace。"
        />

        <WorkspaceProductSection
          description="Settings 分成 General、Workspace、Language、Notifications、Privacy、About 與 Advanced。"
          eyebrow="Settings Overview"
          title="主要設定"
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {settingsCards.map((card) => {
              const Icon = card.icon;
              const body = (
                <article className="flex min-h-48 flex-col justify-between rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
                        <Icon className="h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
                      </span>
                      <span className="rounded-full border border-[var(--ixai-border)] bg-white/72 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
                        {card.status}
                      </span>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-[var(--ixai-forest)]">{card.label}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{card.description}</p>
                  </div>
                  {card.label === "Language" ? (
                    <div className="mt-4">
                      <LanguageSwitcher mode="full" />
                    </div>
                  ) : card.href ? (
                    <span className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]">
                      開啟
                      <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-3 py-2 text-sm font-semibold text-[var(--ixai-forest-soft)]">
                      尚未啟用
                    </span>
                  )}
                </article>
              );

              return card.href ? (
                <Link href={card.href} key={card.label}>
                  {body}
                </Link>
              ) : (
                <div key={card.label}>{body}</div>
              );
            })}
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="語言、地區與顯示格式是使用者設定，不放在 diagnostics。"
          eyebrow="Language"
          title="語言與顯示格式"
        >
          <LocalizationPreferenceCard />
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Health 與 Beta 已移到 Settings 的 Advanced / About 區。"
          eyebrow="Advanced"
          title="進階與關於"
        >
          <WorkspaceKpiGrid
            items={[
              { description: "查看系統狀態與資料完整度。", icon: HeartPulse, label: "System Health", value: "Advanced" },
              { description: "查看 Beta 狀態與回饋入口。", icon: Info, label: "Beta", value: "About" },
              { description: "執行唯讀診斷，不改資料。", icon: ShieldCheck, label: "進階診斷", value: "收合" },
            ]}
          />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]" href="/my-ixai/health">
              System Health
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
            <Link className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]" href="/my-ixai/beta">
              Beta
              <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            </Link>
          </div>
        </WorkspaceProductSection>

        <WorkspaceDiagnosticsPanel description="localization、runtime、health、source readiness">
          <I18nFoundationStatusCard />
          <SettingsRuntimeDiagnosticsControl />
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}
