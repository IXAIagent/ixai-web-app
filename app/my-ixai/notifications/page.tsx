import { NotificationCenterSummary } from "@/components/notifications/notification-center-summary";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/notifications",
  description:
    "IXAI Workspace Notification Center converts alert cards into local notification readback without delivery.",
  title: "Notifications | 我的 IXAI",
});

export default function MyIxaiNotificationsPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
            Workspace Notifications
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
            Notification Center
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
            將 Alert Engine readback 轉成 local notification cards。本頁不啟用 push、email、LINE、Telegram 或 backend persistence。
          </p>
        </section>

        <NotificationCenterSummary />
      </section>
    </main>
  );
}
