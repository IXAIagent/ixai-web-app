"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, RadioTower, ShieldCheck } from "lucide-react";
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

type ProAccessResponse = {
  accountLink: {
    status: "not_started" | "linked" | "backend_not_configured" | "backend_contract_missing" | "error";
  };
  authenticated: boolean;
  ok: boolean;
};

type EntitlementsResponse = {
  entitlements?: IXAIEntitlements;
  ok: boolean;
  plan?: string;
  status: string;
};

type BackendHealth = {
  backendStatus?: string;
  ok: boolean;
};

// v1.64.0 — FCN moved to first slot and marked `featured` so the module grid
// renders it wider with a primary visual treatment. Portfolio and Risk follow
// as secondary cards. Module entitlement logic is unchanged.
const modules = [
  {
    copy: "整理 FCN 持倉、配息與觀察日、KI / KO 距離、Worst-of 變化、標的集中度與 AI 風險提醒的測試版入口。",
    href: "/fcn",
    icon: ShieldCheck,
    key: "fcn",
    label: "FCN 監控",
    cta: "了解 FCN 監控",
    featured: true,
  },
  {
    copy: "查看投資組合總覽、資產配置、部位整理與 AI 投資筆記的測試版入口。",
    href: "/portfolio",
    icon: BriefcaseBusiness,
    key: "portfolio",
    label: "投資組合分析",
    cta: "開啟投資組合",
    featured: false,
  },
  {
    copy: "查看投資組合風險、集中度、情境監控與 AI 風險提醒的測試版入口。",
    href: "/risk",
    icon: RadioTower,
    key: "risk",
    label: "風險中心",
    cta: "開啟風險中心",
    featured: false,
  },
] as const;

const LEGACY_PRO_LAB_LOGIN_URL = "https://ixai-website-clean.vercel.app/login";

export function ProWorkspaceHub() {
  const [accountLinkStatus, setAccountLinkStatus] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [backendStatus, setBackendStatus] = useState("檢查中");
  const [entitlements, setEntitlements] = useState<IXAIEntitlements>(() =>
    normalizeEntitlements(null),
  );
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    let mounted = true;

    async function loadWorkspaceState() {
      const headers = await getSupabaseAuthorizationHeaders();

      if (!headers) {
        if (mounted) {
          setAuthenticated(false);
          setAccountLinkStatus(null);
          setEntitlements(normalizeEntitlements(null));
          setPlan("free");
        }
        return;
      }

      const healthResponse = await fetch("/api/backend/health", { cache: "no-store" }).catch(
        () => null,
      );
      const healthPayload = healthResponse
        ? ((await healthResponse.json().catch(() => ({}))) as BackendHealth)
        : null;

      if (mounted) {
          setBackendStatus(healthPayload?.ok ? "已連線" : "暫時無法連線");
      }

      const accessResponse = await fetch("/api/pro/access", {
        cache: "no-store",
        headers,
      });
      const accessPayload = (await accessResponse.json()) as ProAccessResponse;
      const entitlementResponse = await fetch("/api/pro/entitlements", {
        cache: "no-store",
        headers,
      });
      const entitlementPayload = (await entitlementResponse.json()) as EntitlementsResponse;
      const betaOpenAccess = canUseBetaOpenAccess({
        accountLinkStatus: accessPayload.accountLink?.status,
        authenticated: accessPayload.authenticated,
      });

      if (mounted) {
        setAuthenticated(accessPayload.authenticated === true);
        setAccountLinkStatus(accessPayload.accountLink?.status ?? null);
        setEntitlements(
          applyBetaOpenAccess(
            normalizeEntitlements(entitlementPayload.entitlements),
            betaOpenAccess,
          ),
        );
        setPlan(entitlementPayload.plan ?? "free");
      }
    }

    void loadWorkspaceState().catch(() => {
      if (mounted) {
        setBackendStatus("暫時無法連線");
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const betaEnabled = canUseBetaOpenAccess({ accountLinkStatus, authenticated });
  const planLabel = `${plan.toUpperCase()}${betaEnabled ? " / 測試資格" : ""}`;
  const moduleAvailability = {
    fcn: canAccessFCN(entitlements),
    portfolio: canAccessPortfolio(entitlements),
    risk: canAccessRiskEngine(entitlements),
  };

  return (
    // v1.64.0 — Hub no longer renders a top hero. The /pro page wraps the hub
    // with a page-level marketing prelude. The hub keeps integration-status
    // messaging inline with the Pro Lab + App-internal cards below.
    <div className="flex w-full flex-col gap-4 sm:gap-6">
      <section className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(255,250,240,0.9)] p-4 shadow-[0_18px_56px_rgba(9,41,31,0.08)] sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-forest)]">
            現有 Pro 測試區
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            開啟 IXAI Pro
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            如需使用目前的 Pro 測試版，請從這裡進入。App 共用登入仍在串接中。
          </p>
          <a
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] sm:w-auto"
            href={LEGACY_PRO_LAB_LOGIN_URL}
            rel="noreferrer"
            target="_blank"
          >
            開啟 IXAI Pro
            <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </a>
        </article>

        <article className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4 sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ixai-forest)]">
            App 內 Pro 測試區
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
            查看 Pro 測試模組
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            測試期間，已登入並完成綁定的使用者可試用 Pro 模組。目前不含付款、券商串接、真實部位資料或投資建議。
          </p>
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ["測試資格", betaEnabled ? "已開放" : authenticated ? "請先綁定帳號" : "請先登入"],
          ["會員方案", planLabel],
          ["系統連線", backendStatus],
        ].map(([label, value]) => (
          <article
            className="rounded-lg border border-[rgba(9,41,31,0.18)] bg-[rgba(255,250,240,0.9)] p-4"
            key={label}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-forest)]">
              {label}
            </p>
            <p className="mt-2 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
              {value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr]">
        {modules.map((module) => {
          const Icon = module.icon;
          const available =
            module.key === "portfolio"
              ? moduleAvailability.portfolio
              : module.key === "fcn"
                ? moduleAvailability.fcn
                : moduleAvailability.risk;
          const cardClass = module.featured
            ? "flex h-full flex-col rounded-lg border border-[rgba(176,141,87,0.55)] bg-[rgba(176,141,87,0.13)] p-5 shadow-[0_18px_56px_rgba(9,41,31,0.10)] sm:p-6"
            : "flex h-full flex-col rounded-lg border border-[rgba(176,141,87,0.3)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5";

          return (
            <article className={cardClass} key={module.key}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(9,41,31,0.34)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_8px_18px_rgba(9,41,31,0.12)]">
                  <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                </span>
                <span
                  className={`rounded border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    available
                      ? "border-[color-mix(in_srgb,var(--ixai-risk-clear)_38%,var(--ixai-border))] bg-[color-mix(in_srgb,var(--ixai-risk-clear)_14%,white)] text-[color-mix(in_srgb,var(--ixai-risk-clear)_68%,var(--ixai-forest))]"
                      : "border-[var(--ixai-border)] bg-white/55 text-[var(--ixai-forest-soft)]"
                  }`}
                >
                  {available ? "測試可用" : "請先綁定"}
                </span>
              </div>
              {module.featured ? (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                  Pro 主打模組
                </p>
              ) : null}
              <h2 className={`text-lg font-semibold leading-7 text-[var(--ixai-forest)] ${module.featured ? "mt-1 sm:text-xl" : "mt-4"}`}>
                {module.label}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {module.copy}
              </p>
              <Link
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
                href={module.href}
              >
                {module.cta}
                <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-white/50 p-4 text-xs leading-6 text-[var(--ixai-ink-muted)] sm:p-5">
        舊版 Pro 測試區目前仍是獨立環境。App 內 Pro 模組僅供測試，不含付款、券商串接、真實投資組合 / FCN 資料、交易執行或投資建議。
      </section>
    </div>
  );
}
