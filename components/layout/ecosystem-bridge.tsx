import Link from "next/link";
import { ixaiIdentity } from "@/src/lib/ixai/identity";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";

type EcosystemBridgeVariant = "public" | "pro";

export function EcosystemBridge({
  className = "",
  variant = "public",
}: {
  className?: string;
  variant?: EcosystemBridgeVariant;
}) {
  const isPro = variant === "pro";

  return (
    <section
      className={`rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.84)] p-4 shadow-[0_16px_48px_rgba(9,41,31,0.045)] sm:p-5 ${className}`}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            {ixaiEcosystem.labels.ecosystem}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-8 text-[var(--ixai-forest)]">
            {isPro
              ? "你正在使用 IXAI Pro。"
              : "你正在使用 IXAI Public Intelligence。"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-ink-muted)]">
            {isPro
              ? "返回 Public Intelligence 查看每日市場情報、研究內容與市場觀察。"
              : "Public App 提供免費市場情報、教育與每日觀察；需要更深入的 AI 風險監控與 Portfolio Intelligence，可進入 IXAI Pro Dashboard。"}
          </p>
          <p className="mt-2 text-xs leading-6 text-[var(--ixai-ink-muted)]">
            {ixaiIdentity.sharedAccountMessage}
          </p>
        </div>

        {isPro ? (
          <a
            className="ixai-cta-forest inline-flex w-fit rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-semibold"
            href={`${ixaiEcosystem.publicAppUrl}${ixaiEcosystem.dailyBriefUrl}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {ixaiEcosystem.cta.returnDailyBrief}
          </a>
        ) : (
          <div className="flex flex-wrap gap-3">
            <a
              className="ixai-cta-forest inline-flex rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-semibold"
              href={ixaiEcosystem.proDashboardUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {ixaiEcosystem.cta.enterPro}
            </a>
            <Link
              className="inline-flex rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)]"
              href={ixaiEcosystem.dailyBriefUrl}
            >
              {ixaiEcosystem.cta.viewDailyBrief}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
