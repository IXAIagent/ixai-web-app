import { AlertTriangle, BellRing, Cpu, Landmark } from "lucide-react";
import { PreviewBadge } from "@/components/pro/preview-badge";

const ALERTS = [
  {
    icon: Landmark,
    title: "總經警示",
    copy: "利率壓力仍是成長股估值風險的主要輸入。",
  },
  {
    icon: Cpu,
    title: "AI 供應鏈警示",
    copy: "當 NVDA / TSM / server 標的集中時，台灣 AI 供應鏈維持高度關聯。",
  },
  {
    icon: BellRing,
    title: "幣圈流動性警示",
    copy: "BTC/ETH 波動作為風險偏好訊號監控，並非交易指令。",
  },
  {
    icon: AlertTriangle,
    title: "FCN 風險警示",
    copy: "示意警示：當波動與集中度重疊時，Worst-of 敏感度上升。",
  },
];

export function ProAlertPreview() {
  return (
    <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          AI 警示預覽
        </p>
        <PreviewBadge />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {ALERTS.map((alert) => {
          const Icon = alert.icon;
          return (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/48 p-4" key={alert.title}>
              <div className="flex items-center gap-2 text-[var(--ixai-gold)]">
                <Icon className="h-4 w-4 stroke-current" aria-hidden="true" fill="none" />
                <h3 className="text-sm font-semibold text-[var(--ixai-forest)]">
                  {alert.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">{alert.copy}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
