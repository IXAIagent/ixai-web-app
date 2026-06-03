"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LockedFeatureCard } from "@/components/pro/locked-feature-card";
import {
  applyBetaOpenAccess,
  canAccessFCN,
  canAccessPortfolio,
  canAccessRiskEngine,
  canUseBetaOpenAccess,
  normalizeEntitlements,
  type IXAIEntitlements,
} from "@/src/lib/pro/feature-gates";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";

type FeatureKey = "portfolio" | "fcn_monitoring" | "risk_engine";

type EntitlementsResponse = {
  entitlements?: IXAIEntitlements;
  message?: string;
  ok: boolean;
  plan?: string;
  status: string;
};

type ProAccessResponse = {
  accountLink: {
    status: "not_started" | "linked" | "backend_not_configured" | "backend_contract_missing" | "error";
  };
  authenticated: boolean;
  ok: boolean;
};

type WorkspaceSection = {
  title: string;
  copy: string;
};

const featureLabels: Record<FeatureKey, string> = {
  fcn_monitoring: "FCN 監控",
  portfolio: "投資組合分析",
  risk_engine: "風險中心",
};

function canAccessFeature(feature: FeatureKey, entitlements: IXAIEntitlements) {
  if (feature === "portfolio") {
    return canAccessPortfolio(entitlements);
  }

  if (feature === "fcn_monitoring") {
    return canAccessFCN(entitlements);
  }

  return canAccessRiskEngine(entitlements);
}

export function FeatureGatedPage({
  description,
  feature,
  moduleName,
  sections,
}: {
  description: string;
  feature: FeatureKey;
  moduleName: string;
  sections: WorkspaceSection[];
}) {
  const [entitlements, setEntitlements] = useState<IXAIEntitlements>(() =>
    normalizeEntitlements(null),
  );
  const [accountLinkStatus, setAccountLinkStatus] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [message, setMessage] = useState("正在確認功能權限。");
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    let mounted = true;

    async function loadEntitlements() {
      const headers = await getSupabaseAuthorizationHeaders();

      if (!headers) {
        if (mounted) {
          setAccountLinkStatus(null);
          setAuthenticated(false);
          setEntitlements(normalizeEntitlements(null));
          setMessage("請先登入並完成帳號綁定，再確認 Pro 使用資格。");
          setPlan("free");
        }
        return;
      }

      const accessResponse = await fetch("/api/pro/access", {
        cache: "no-store",
        headers,
      });
      const accessPayload = (await accessResponse.json()) as ProAccessResponse;
      const response = await fetch("/api/pro/entitlements", {
        cache: "no-store",
        headers,
      });
      const payload = (await response.json()) as EntitlementsResponse;

      if (!mounted) {
        return;
      }

      const betaOpenAccess = canUseBetaOpenAccess({
        accountLinkStatus: accessPayload.accountLink?.status,
        authenticated: accessPayload.authenticated,
      });
      setAccountLinkStatus(accessPayload.accountLink?.status ?? null);
      setAuthenticated(accessPayload.authenticated === true);
      setEntitlements(applyBetaOpenAccess(normalizeEntitlements(payload.entitlements), betaOpenAccess));
      setMessage(
        betaOpenAccess
          ? "已完成帳號綁定，可試用 Pro 模組。這不代表已開通付費 Pro。"
          : payload.ok
            ? "已讀取你的 IXAI 會員方案與功能權限。"
            : "請先完成 Pro 帳號綁定。",
      );
      setPlan(payload.plan ?? "free");
    }

    void loadEntitlements().catch(() => {
      if (mounted) {
        setMessage("暫時無法讀取功能權限，Pro 模組會先維持關閉。");
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const enabled = canAccessFeature(feature, entitlements);
  const betaEnabled = canUseBetaOpenAccess({ accountLinkStatus, authenticated });
  const stateLabel = enabled ? "測試可用" : "Pro 保留功能";
  const normalizedPlan = useMemo(() => plan.toUpperCase(), [plan]);
  const gateInstruction = !authenticated
    ? "請先登入，再使用 IXAI Pro 測試功能。"
    : accountLinkStatus !== "linked"
      ? "請先綁定 Pro 帳號。"
      : "Pro 測試功能已可使用。";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ixai-gold)] sm:text-[11px]">
          IXAI Pro
        </p>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:text-4xl">
          {moduleName}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">{description}</p>
        <p className="mt-3 max-w-3xl rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs leading-6 text-white/60">
          測試期間，已登入並完成綁定的使用者可試用這個 Pro 模組。這不是永久免費 Pro，也不包含付款、券商串接或個人化投資建議。
        </p>
      </section>

      <section className="grid gap-3 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-forest)]">
              目前方案
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--ixai-forest)]">
              {normalizedPlan}
              {betaEnabled ? " / 測試資格" : ""}
            </p>
          </div>
          <span className="rounded-lg border border-[rgba(9,41,31,0.24)] bg-[var(--ixai-forest)] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-cream)]">
            {stateLabel}
          </span>
        </div>

        <LockedFeatureCard
          description={`需要功能權限：${featureLabels[feature]}。${message}`}
          enabled={enabled}
          name={moduleName}
        />

        {enabled ? (
          <div className="grid gap-3 md:grid-cols-2">
            {sections.map((section) => (
              <article
                className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4"
                key={section.title}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                  測試版內容
                </p>
                <h2 className="mt-2 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                  {section.copy}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-amber-700/20 bg-amber-50/80 p-4 text-sm leading-7 text-amber-950">
            {gateInstruction}
          </div>
        )}

        <p className="text-xs leading-6 text-[var(--ixai-ink-muted)]">
          本頁不載入投資部位、FCN 部位、券商資料、付款狀態、交易指令或個人化投資建議。
        </p>
      </section>

      <div className="grid gap-2 sm:flex sm:flex-wrap">
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
          href="/account"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--ixai-cream)]" aria-hidden="true" />
          回到我的 IXAI
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
          href="/pro"
        >
          <ShieldCheck className="h-4 w-4 text-[var(--ixai-forest)]" aria-hidden="true" />
          查看 Pro 測試區
        </Link>
      </div>
    </main>
  );
}
