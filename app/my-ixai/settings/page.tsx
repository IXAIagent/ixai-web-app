import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Globe2,
  KeyRound,
  Languages,
  Settings,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { SettingsRuntimeDiagnosticsControl } from "@/components/workspace/settings-runtime-diagnostics-control";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/settings",
  description:
    "Settings 是 IXAI Workspace 的帳號、偏好、通知、語言、地區與未來 broker connection 設定預覽。",
  title: "Settings | 我的 IXAI",
});

const settingsAreas = [
  {
    description: "查看帳號狀態與 Workspace transition。完整會員與方案設定留待後續版本。",
    href: "/account",
    icon: UserCircle,
    label: "Account",
    status: "Available",
  },
  {
    description: "通知偏好入口已存在；正式 alert routing、LINE / email delivery 尚未啟用。",
    href: "/settings/notifications",
    icon: Bell,
    label: "Notifications",
    status: "Preview",
  },
  {
    description: "語言偏好將支援 zh-TW、zh-CN、en-US、ja-JP、ko-KR。此版只保留 IA 位置。",
    href: null,
    icon: Languages,
    label: "Language",
    status: "Coming Soon",
  },
  {
    description: "地區與市場偏好將服務 US / TW / HK / CN / JP / KR / EU / SG / Crypto / FCN。",
    href: null,
    icon: Globe2,
    label: "Region",
    status: "Coming Soon",
  },
  {
    description: "Broker connection 將採 read-only、consent-first、安全 credential 管理；目前未啟用。",
    href: null,
    icon: KeyRound,
    label: "Broker Connections",
    status: "Coming Soon",
  },
  {
    description: "資料隱私、local pending input、manual price overlay 與未來 export / delete controls 的設定區。",
    href: null,
    icon: ShieldCheck,
    label: "Data & Privacy",
    status: "Coming Soon",
  },
];

export default function MyIxaiSettingsPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                Workspace Settings Preview
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                Settings
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                Settings 目前是 Workspace 設定預覽頁，先整理帳號、通知、語言、地區、資料與未來 broker connection 的資訊架構；本版不改 auth、membership、entitlement 或 payment。
              </p>
            </div>
            <FeatureIcon icon={Settings} shadow={false} tone="cream" />
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {settingsAreas.map((area) => {
            const Icon = area.icon;
            const content = (
              <article className="flex min-h-56 flex-col justify-between rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)]">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <FeatureIcon icon={Icon} size="sm" shadow={false} />
                    <span className="rounded-full border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.82)] px-2.5 py-1 font-mono text-[10px] font-semibold text-[var(--ixai-forest-soft)]">
                      {area.status}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-[var(--ixai-forest)]">
                    {area.label}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                    {area.description}
                  </p>
                </div>
                {area.href ? (
                  <span className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]">
                    Open
                    <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-3 py-2 text-sm font-semibold text-[var(--ixai-forest-soft)]">
                    Coming Soon
                  </span>
                )}
              </article>
            );

            return area.href ? (
              <Link href={area.href} key={area.label}>
                {content}
              </Link>
            ) : (
              <div key={area.label}>{content}</div>
            );
          })}
        </section>

        <SettingsRuntimeDiagnosticsControl />

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          Settings Preview 僅整理 Workspace preference architecture。本頁不啟用付款、會員升級、broker sync、通知投遞、自動交易或投資建議。
        </p>
      </section>
    </main>
  );
}
