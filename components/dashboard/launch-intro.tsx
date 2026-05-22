import Link from "next/link";
import { getPrimaryContactLinks } from "@/src/lib/brand/contact";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";

export function LaunchIntro() {
  const contactLinks = getPrimaryContactLinks();
  const lineUrl = contactLinks.line?.value ?? ixaiEcosystem.contactUrl;

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.9)] p-3.5 shadow-[0_12px_34px_rgba(9,41,31,0.045)] sm:p-5 sm:shadow-[0_16px_44px_rgba(9,41,31,0.055)]">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            IXAI 市場情報入口
          </p>
          <h2 className="mt-1.5 text-lg font-semibold leading-6 text-[var(--ixai-forest)] sm:text-xl sm:leading-8">
            免費市場 intelligence 與 AI 風險觀察平台。
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ixai-ink-muted)] sm:leading-7">
            每天閱讀 Daily Brief、追蹤市場脈搏與 FCN 風險觀察；需要個人化監控時，
            可延伸到 IXAI Pro 的 AI Wealth Operating System。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ixai-forest)] px-3 py-2 text-sm font-medium text-[var(--ixai-cream)] sm:px-4"
            href={ixaiEcosystem.dailyBriefUrl}
          >
            查看 Daily Brief
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--ixai-border)] px-3 py-2 text-sm font-medium text-[var(--ixai-forest)] sm:px-4"
            href={ixaiEcosystem.proPreviewUrl}
          >
            了解 IXAI Pro
          </Link>
          <a
            className="hidden min-h-11 items-center justify-center rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)] sm:inline-flex"
            href={ixaiEcosystem.proDashboardUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            {ixaiEcosystem.cta.enterPro}
          </a>
          <a
            className="hidden min-h-11 items-center justify-center rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)] sm:inline-flex"
            href={lineUrl}
            rel="noreferrer"
            target="_blank"
          >
            加入 LINE 諮詢
          </a>
        </div>
      </div>
    </section>
  );
}
