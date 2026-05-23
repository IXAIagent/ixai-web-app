import Link from "next/link";
import { ArrowLeft, BellRing } from "lucide-react";
import { InstallAppCard } from "@/components/pwa/install-app-card";
import { NotificationPreferencesPanel } from "@/components/pwa/notification-preferences-panel";
import { PushPermissionCard } from "@/components/pwa/push-permission-card";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "通知設定 — IXAI",
  description:
    "管理 IXAI Public App 的桌面與行動通知偏好，包含 Daily Brief、市場風險、台股 AI、Crypto 與 IXAI Pro 更新。",
});

export default function NotificationSettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-2xl border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.16)] sm:p-7">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-[rgba(176,141,87,0.18)] text-[var(--ixai-gold)]">
            <BellRing className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
            Notification Settings
          </p>
        </div>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-9 sm:text-4xl sm:leading-snug">
          管理 IXAI 通知。
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
          這裡是 IXAI 通知層的偏好設定。Public App 目前先建立通知架構與權限流程，
          真正的市場推播會在後續逐步開放。所有偏好都保留在你的裝置上。
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          IXAI Public Beta
        </p>
      </section>

      <PushPermissionCard />

      <section className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          通知類別
        </p>
        <h2 className="mt-2 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
          選擇你想接收的市場 Intelligence 類別
        </h2>
        <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
          切換偏好會立即儲存於此裝置；尚未在此啟用通知權限時，類別只會以偏好形式記住。
        </p>
        <div className="mt-5">
          <NotificationPreferencesPanel />
        </div>
        <p className="mt-5 border-t border-[var(--ixai-border)] pt-3 text-xs leading-6 text-[var(--ixai-ink-muted)] sm:mt-6 sm:pt-4">
          通知內容偏市場 Intelligence 與風險觀察，不會出現買賣指令、明牌或績效保證。
        </p>
      </section>

      <InstallAppCard />

      <Link
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/45 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
        href="/account"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        返回我的 IXAI
      </Link>
    </div>
  );
}
