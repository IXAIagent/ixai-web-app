import type { LucideIcon } from "lucide-react";
import { AlertCircle, DatabaseZap, ShieldAlert } from "lucide-react";

export type WorkspaceStateMessageVariant =
  | "fallback-active"
  | "no-coverage"
  | "no-data"
  | "provider-unavailable";

const stateCopy: Record<WorkspaceStateMessageVariant, { icon: LucideIcon; title: string }> = {
  "fallback-active": {
    icon: DatabaseZap,
    title: "使用備用資料",
  },
  "no-coverage": {
    icon: ShieldAlert,
    title: "覆蓋範圍尚未建立",
  },
  "no-data": {
    icon: AlertCircle,
    title: "暫無資料",
  },
  "provider-unavailable": {
    icon: ShieldAlert,
    title: "資料暫時無法更新",
  },
};

export function WorkspaceStateMessage({
  body,
  variant,
}: {
  body: string;
  variant: WorkspaceStateMessageVariant;
}) {
  const state = stateCopy[variant];
  const Icon = state.icon;

  return (
    <div className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-[var(--ixai-forest)]">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)]">
          <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold">{state.title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">{body}</p>
        </div>
      </div>
    </div>
  );
}
