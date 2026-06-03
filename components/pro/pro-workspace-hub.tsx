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

const modules = [
  {
    copy: "查看投資組合總覽、資產配置、部位整理與 AI 投資筆記的測試版入口。",
    href: "/portfolio",
    icon: BriefcaseBusiness,
    key: "portfolio",
    label: "投資組合分析",
    cta: "開啟投資組合",
  },
  {
    copy: "查看 FCN 持倉、配息時程、KI / KO 觀察與 Worst-of 監控的測試版入口。",
    href: "/fcn",
    icon: ShieldCheck,
    key: "fcn",
    label: "FCN 監控",
    cta: "開啟 FCN",
  },
  {
    copy: "查看投資組合風險、集中度、情境監控與 AI 風險提醒的測試版入口。",
    href: "/risk",
    icon: RadioTower,
    key: "risk",
    label: "風險中心",
    cta: "開啟風險中心",
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ixai-gold)] sm:text-[11px]">
          IXAI Pro 入口
        </p>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight sm:text-5xl">
          IXAI Pro 正在與 App 帳號整合中。
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
          IXAI Pro 是進階投資情報工作區。完成共用登入後，使用者將可用同一組帳號進入 Pro。
        </p>
        <p className="mt-3 max-w-3xl rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-xs leading-6 text-white/60">
          目前舊版 Pro 測試區仍是獨立環境；若你有受邀測試帳號，請使用指定的 Pro 帳密。
        </p>
      </section>

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
            className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4"
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

      <section className="grid gap-3 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          const available =
            module.key === "portfolio"
              ? moduleAvailability.portfolio
              : module.key === "fcn"
                ? moduleAvailability.fcn
                : moduleAvailability.risk;

          return (
            <article
              className="rounded-lg border border-[rgba(176,141,87,0.3)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-5"
              key={module.key}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[rgba(9,41,31,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="rounded border border-emerald-700/20 bg-emerald-50/70 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-950">
                  {available ? "測試可用" : "請先綁定"}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
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
