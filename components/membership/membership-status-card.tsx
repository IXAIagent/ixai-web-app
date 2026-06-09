"use client";

import { useCallback, useEffect, useState } from "react";
import { Crown, ShieldCheck } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";
import type { PortfolioDashboardSummary } from "@/src/lib/portfolio/dashboard";

type MembershipVariant = "account" | "pro";

type DashboardResponse = {
  ok: boolean;
  summary?: PortfolioDashboardSummary;
};

const FREE_ENTITLEMENTS = {
  canViewFcn: true,
  canViewPortfolio: true,
  canViewPro: false,
  canViewRisk: true,
};

const TIER_LABEL = {
  basic: "IXAI Basic",
  free: "IXAI Free",
  pro: "IXAI Pro",
} as const;

const FEATURE_LABELS = [
  ["Portfolio", "Portfolio", "canViewPortfolio"],
  ["FCN", "FCN", "canViewFcn"],
  ["Risk", "Risk", "canViewRisk"],
  ["Pro", "Pro", "canViewPro"],
] as const;

export function MembershipStatusCard({ variant = "account" }: { variant?: MembershipVariant }) {
  const [summary, setSummary] = useState<PortfolioDashboardSummary | null>(null);
  const [status, setStatus] = useState<"error" | "loading" | "ready" | "unauthenticated">(
    "loading",
  );

  const loadMembership = useCallback(async () => {
    setStatus("loading");

    const headers = await getSupabaseAuthorizationHeaders();

    if (!headers) {
      setSummary(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      const response = await fetch("/api/portfolio/dashboard", {
        cache: "no-store",
        headers,
      });
      const payload = (await response.json().catch(() => ({}))) as DashboardResponse;

      if (!response.ok || !payload.summary) {
        setSummary(payload.summary ?? null);
        setStatus(response.status === 401 ? "unauthenticated" : "error");
        return;
      }

      setSummary(payload.summary);
      setStatus("ready");
    } catch {
      setSummary(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadMembership();
    });
  }, [loadMembership]);

  const membershipTier = summary?.membershipTier ?? "free";
  const entitlements = summary?.entitlements ?? FREE_ENTITLEMENTS;
  const canViewPro = entitlements.canViewPro;

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <FeatureIcon icon={variant === "pro" ? Crown : ShieldCheck} shadow={false} />
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
              Membership Status
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
              Current Plan：{TIER_LABEL[membershipTier]}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              IXAI 目前只建立權限基礎，不含付款流程。功能開放依 membership / entitlement 判斷。
            </p>
          </div>
        </div>
        <span className="w-fit rounded border border-[rgba(9,41,31,0.22)] bg-[var(--ixai-forest)] px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-cream)]">
          {membershipTier}
        </span>
      </div>

      {status === "loading" ? (
        <p className="mt-4 rounded-lg border border-[var(--ixai-border)] bg-white/45 px-3 py-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          正在讀取會員權限...
        </p>
      ) : null}

      {status === "unauthenticated" ? (
        <p className="mt-4 rounded-lg border border-[rgba(176,141,87,0.28)] bg-white/45 px-3 py-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          登入後即可讀取你的會員方案。未登入狀態先以 Free 權限顯示。
        </p>
      ) : null}

      {status === "error" ? (
        <p className="mt-4 rounded-lg border border-[color-mix(in_srgb,var(--ixai-risk-watch)_38%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_9%,white)] px-3 py-2 text-xs leading-6 text-[var(--ixai-forest)]">
          暫時無法確認會員權限，付費 Pro 功能維持關閉。
        </p>
      ) : null}

      {variant === "pro" && !canViewPro ? (
        <div className="mt-4 rounded-lg border border-[color-mix(in_srgb,var(--ixai-risk-watch)_38%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-watch)_9%,white)] p-3 text-sm leading-7 text-[var(--ixai-forest)]">
          <p className="font-semibold">IXAI Pro Membership Required</p>
          <p className="mt-1 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            你目前可使用 Portfolio、FCN 與 Risk 基礎功能；完整 Pro Workspace 將保留給 Pro 方案。
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {FEATURE_LABELS.map(([label, shortLabel, key]) => {
          const enabled = entitlements[key];

          return (
            <div
              className="rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2"
              key={key}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[rgba(9,41,31,0.52)]">
                {shortLabel}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--ixai-forest)]">
                {enabled ? "Available" : "Locked"}
              </p>
              <p className="sr-only">{label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
