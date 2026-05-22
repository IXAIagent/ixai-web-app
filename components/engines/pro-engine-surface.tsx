import Link from "next/link";
import { ArrowRight, ArrowUpRight, LockKeyhole } from "lucide-react";
import { proEngineSurfaces, type ProEngineSurface } from "@/src/lib/engines/pro-engine-surfaces";
import {
  formatFcnDate,
  formatFcnPercent,
  getFcnRiskLabel,
} from "@/src/lib/fcn/engine";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";
import type { FcnPortfolioSnapshot } from "@/src/types/fcn";

const toneClasses: Record<ProEngineSurface["metric"]["tone"], string> = {
  calm: "text-emerald-900/78 bg-emerald-900/[0.06] border-emerald-900/10",
  watch: "text-[var(--ixai-forest)] bg-[rgba(176,141,87,0.12)] border-[rgba(176,141,87,0.26)]",
  stress: "text-[#5c2d1d] bg-[#9f5530]/[0.08] border-[#9f5530]/20",
};

function EngineCard({ engine }: { engine: ProEngineSurface }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
            {engine.label}
          </p>
          <h3 className="mt-2 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
            {engine.title}
          </h3>
        </div>
        <span className="rounded-md border border-[var(--ixai-border)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">
          {engine.status === "preview" ? "Preview" : "Locked"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-[var(--ixai-border)] bg-white/42 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--ixai-ink-muted)]">
            {engine.metric.label}
          </p>
          <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${toneClasses[engine.metric.tone]}`}>
            {engine.metric.value}
          </span>
        </div>
        <p className="text-sm font-semibold text-[var(--ixai-forest)]">
          {engine.state}
        </p>
        <p className="text-sm leading-6 text-[var(--ixai-forest-soft)]">
          {engine.signal}
        </p>
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--ixai-ink-muted)]">
        {engine.summary}
      </p>

      <div className="mt-4 grid gap-2">
        {engine.lockedItems.map((item) => (
          <div
            className="flex items-center justify-between rounded-md border border-[var(--ixai-border)] bg-[rgba(9,41,31,0.025)] px-3 py-2"
            key={item}
          >
            <span className="text-xs font-medium text-[var(--ixai-forest-soft)]">
              {item}
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ixai-gold)]">
              <LockKeyhole className="h-3 w-3" aria-hidden="true" />
              Pro
            </span>
          </div>
        ))}
      </div>

      {engine.href ? (
        <p className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
          查看風險觀察
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </p>
      ) : null}

      {engine.status === "locked" ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgba(255,250,240,0.94)] to-transparent backdrop-blur-[1px]" />
      ) : null}
    </>
  );

  if (engine.href) {
    return (
      <Link
        className="relative block overflow-hidden rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-3.5 shadow-[0_12px_34px_rgba(9,41,31,0.045)] transition active:scale-[0.995] hover:border-[rgba(176,141,87,0.46)] hover:bg-[rgba(255,250,240,0.96)] sm:p-4 sm:shadow-[0_18px_48px_rgba(9,41,31,0.055)]"
        href={engine.href}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className="relative overflow-hidden rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-3.5 shadow-[0_12px_34px_rgba(9,41,31,0.045)] sm:p-4 sm:shadow-[0_18px_48px_rgba(9,41,31,0.055)]">
      {content}
    </article>
  );
}

function withFcnSummary(fcnSnapshot?: FcnPortfolioSnapshot): ProEngineSurface[] {
  if (!fcnSnapshot?.highestRiskPosition) {
    return proEngineSurfaces;
  }

  const highestRisk = fcnSnapshot.highestRiskPosition;
  const weakest = highestRisk.worstOf;

  return proEngineSurfaces.map((engine) => {
    if (engine.id !== "fcn") {
      return engine;
    }

    if (!weakest) {
      return {
        ...engine,
        state: "等待市場資料",
        signal: `${fcnSnapshot.totalFcns} 檔 FCN 已建立監控，但 quote 尚未形成可用 worst-of。`,
        metric: {
          label: "Monitored FCNs",
          value: `${fcnSnapshot.totalFcns}`,
          tone: "calm",
        },
      };
    }

    return {
      ...engine,
      state: `${highestRisk.position.name} · ${getFcnRiskLabel(highestRisk.riskLevel)}`,
      signal: `${weakest.symbol} 是目前 weakest underlying，表現 ${formatFcnPercent(weakest.priceChangePercent)}；下一個 coupon date：${formatFcnDate(fcnSnapshot.nextCouponDate)}。`,
      metric: {
        label: "Monitored FCNs",
        value: `${fcnSnapshot.totalFcns}`,
        tone: highestRisk.riskLevel === "highRisk" || highestRisk.riskLevel === "breached" ? "stress" : "watch",
      },
    };
  });
}

export function ProEngineSurface({ fcnSnapshot }: { fcnSnapshot?: FcnPortfolioSnapshot }) {
  const surfaces = withFcnSummary(fcnSnapshot);

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.72)] p-3.5 shadow-[0_14px_42px_rgba(9,41,31,0.045)] sm:p-5 sm:shadow-[0_24px_72px_rgba(9,41,31,0.055)]">
      <div className="flex flex-col gap-3 border-b border-[var(--ixai-border)] pb-3.5 sm:gap-4 sm:pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
            Your IXAI Intelligence
          </p>
          <h2 className="mt-1.5 text-lg font-semibold leading-6 text-[var(--ixai-forest)] sm:mt-2 sm:text-xl sm:leading-8">
            Free 是市場情報，IXAI Pro 是你的情報引擎。
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ixai-ink-muted)] sm:leading-7">
            目前先開放 FCN 風險觀察示範。未來會接上 portfolio、watchlist、
            風險提醒與 AI morning brief，形成個人化監控工作流。
          </p>
        </div>
        <a
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2 text-sm font-medium text-[var(--ixai-forest)] sm:w-fit"
          href={ixaiEcosystem.proDashboardUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {ixaiEcosystem.cta.enterPro}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-3.5 grid gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-3">
        {surfaces.map((engine) => (
          <EngineCard engine={engine} key={engine.id} />
        ))}
      </div>
    </section>
  );
}
