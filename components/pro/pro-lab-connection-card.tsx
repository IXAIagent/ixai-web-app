"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Database, ShieldCheck } from "lucide-react";
import { LockedFeatureCard } from "@/components/pro/locked-feature-card";
import {
  canAccessFCN,
  canAccessPortfolio,
  canAccessRiskEngine,
  type IXAIEntitlements,
} from "@/src/lib/pro/feature-gates";
import { getSupabaseAuthorizationHeaders } from "@/src/lib/supabase/client";

type BackendHealth = {
  ok: boolean;
  backendUrlConfigured: boolean;
  backendStatus: string;
  checkedAt: string;
  source: "ixai-backend";
};

type BackendUiState =
  | { label: "檢查中"; tone: "pending"; detail: "正在確認系統連線。" }
  | { label: "已連線"; tone: "ok"; detail: string }
  | { label: "尚未設定"; tone: "muted"; detail: string }
  | { label: "暫時無法連線"; tone: "warning"; detail: string };

type ProAccess = {
  status: "not_connected" | "connected" | "preview" | "active" | "expired" | "revoked";
  canOpenPro: boolean;
  canUsePortfolio: boolean;
  canUseFCN: boolean;
  billingRequired: boolean;
  source: "supabase" | "manual" | "fallback";
  reason: string;
};

type ProAccessResponse = {
  accountLink: ProAccountLink;
  ok: boolean;
  authenticated: boolean;
  proAccess: ProAccess;
};

type ProAccountLink = {
  status:
    | "not_started"
    | "linked"
    | "backend_not_configured"
    | "backend_contract_missing"
    | "error";
  backendAccountId: string | null;
  requiresAction: boolean;
};

type AccountLinkResponse = {
  accountLink: ProAccountLink;
  message: string;
  ok: boolean;
  status: ProAccountLink["status"] | "not_authenticated";
};

type ProMembership = {
  accountId: string | null;
  planCode: "free" | "personal" | "pro" | "enterprise" | string;
  status: string;
  entitlements: IXAIEntitlements;
};

type ProMembershipResponse = {
  membership: ProMembership | null;
  message?: string;
  ok: boolean;
  status: "ok" | "not_authenticated" | "not_linked" | "backend_not_configured" | "error";
};

type ProEntitlementsResponse = {
  entitlements: IXAIEntitlements;
  message?: string;
  ok: boolean;
  plan: string;
  status: "ok" | "not_authenticated" | "not_linked" | "backend_not_configured" | "error";
};

const IXAI_PRO_LAB_URL = "https://ixai-website-clean.vercel.app/login";

function mapBackendState(health: BackendHealth | null, failed: boolean): BackendUiState {
  if (!health && !failed) {
    return {
      label: "檢查中",
      tone: "pending",
      detail: "正在確認系統連線。",
    };
  }

  if (!health || failed) {
    return {
      label: "暫時無法連線",
      tone: "warning",
      detail: "IXAI Pro 連線暫時無法確認。",
    };
  }

  if (health.ok) {
    return {
      label: "已連線",
      tone: "ok",
      detail: "IXAI Pro 系統可用。",
    };
  }

  if (!health.backendUrlConfigured) {
    return {
      label: "尚未設定",
      tone: "muted",
      detail: "此環境尚未設定 Pro 系統連線。",
    };
  }

  return {
    label: "暫時無法連線",
    tone: "warning",
    detail: "IXAI Pro 系統暫時無法使用。",
  };
}

function toneClass(tone: BackendUiState["tone"]) {
  if (tone === "ok") {
    return "border-emerald-700/20 bg-emerald-50/70 text-emerald-900";
  }

  if (tone === "warning") {
    return "border-amber-700/22 bg-amber-50/80 text-amber-950";
  }

  return "border-[var(--ixai-border)] bg-white/50 text-[var(--ixai-forest)]";
}

function proAccessTone(status: ProAccess["status"] | "checking") {
  if (status === "active" || status === "preview") {
    return "border-emerald-700/20 bg-emerald-50/70 text-emerald-950";
  }

  if (status === "expired" || status === "revoked") {
    return "border-amber-700/22 bg-amber-50/80 text-amber-950";
  }

  return "border-[var(--ixai-border)] bg-white/50 text-[var(--ixai-forest)]";
}

function proAccessLabel(status: ProAccess["status"] | "checking") {
  const labels = {
    active: "已啟用",
    checking: "檢查中",
    connected: "已連接",
    expired: "已到期",
    not_connected: "未連接",
    preview: "測試資格",
    revoked: "已停用",
  };

  return labels[status];
}

function proAccessReasonLabel(status: ProAccess["status"] | "checking") {
  const labels = {
    active: "你的 Pro 使用資格已啟用。",
    checking: "正在確認 Pro 使用資格。",
    connected: "你的 App 帳號已連接，完整 Pro 使用權仍需測試資格或付費權限。",
    expired: "你的 Pro 使用資格已到期。",
    not_connected: "請先登入並綁定 Pro 帳號。",
    preview: "你目前可使用 Pro 測試資格。",
    revoked: "你的 Pro 使用資格已停用。",
  };

  return labels[status];
}

function accountLinkTone(status: ProAccountLink["status"] | "checking") {
  if (status === "linked") {
    return "border-emerald-700/20 bg-emerald-50/70 text-emerald-950";
  }

  if (status === "backend_contract_missing" || status === "backend_not_configured") {
    return "border-amber-700/22 bg-amber-50/80 text-amber-950";
  }

  if (status === "error") {
    return "border-rose-700/20 bg-rose-50/75 text-rose-950";
  }

  return "border-[var(--ixai-border)] bg-white/50 text-[var(--ixai-forest)]";
}

function accountLinkLabel(status: ProAccountLink["status"] | "checking") {
  const labels = {
    backend_contract_missing: "系統串接準備中",
    backend_not_configured: "系統尚未設定",
    checking: "檢查中",
    error: "暫時無法綁定",
    linked: "已綁定",
    not_started: "尚未綁定",
  };

  return labels[status];
}

function membershipLabel(membership: ProMembership | null) {
  if (!membership) {
    return "尚未綁定";
  }

  const labels: Record<string, string> = {
    enterprise: "Enterprise",
    free: "Free",
    personal: "Personal",
    pro: "Pro",
  };

  return labels[membership.planCode] ?? membership.planCode;
}

function planBadgeLabel(planCode: string | null | undefined) {
  return (planCode || "free").toUpperCase();
}

export function ProLabConnectionCard({
  source,
  showProAccess = false,
  showBackendStatus = false,
}: {
  source: "account" | "pro" | "pro_preview";
  showProAccess?: boolean;
  showBackendStatus?: boolean;
}) {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [failed, setFailed] = useState(false);
  const [proAccess, setProAccess] = useState<ProAccess | null>(null);
  const [proAccessFailed, setProAccessFailed] = useState(false);
  const [accountLink, setAccountLink] = useState<ProAccountLink | null>(null);
  const [accountLinkMessage, setAccountLinkMessage] = useState(
    "正在確認 Pro 帳號綁定狀態。",
  );
  const [accountLinkPending, setAccountLinkPending] = useState(false);
  const [membership, setMembership] = useState<ProMembership | null>(null);
  const [membershipMessage, setMembershipMessage] = useState("會員方案尚未確認。");
  const [entitlementPlan, setEntitlementPlan] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<IXAIEntitlements | null>(null);

  async function loadEntitlements(authHeaders: HeadersInit) {
    const response = await fetch("/api/pro/entitlements", {
      cache: "no-store",
      headers: authHeaders,
    });
    const payload = (await response.json()) as ProEntitlementsResponse;

    setEntitlementPlan(payload.plan);
    setEntitlements(payload.entitlements);

    return payload;
  }

  useEffect(() => {
    if (!showBackendStatus) {
      return;
    }

    let mounted = true;

    fetch("/api/backend/health", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as BackendHealth;
        if (mounted) {
          setHealth(payload);
          setFailed(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setFailed(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [showBackendStatus]);

  useEffect(() => {
    if (!showProAccess) {
      return;
    }

    let mounted = true;

    async function loadAccess() {
      const authHeaders = await getSupabaseAuthorizationHeaders();
      const response = await fetch("/api/pro/access", {
        cache: "no-store",
        headers: authHeaders,
      });
      const payload = (await response.json()) as ProAccessResponse;

      if (mounted) {
        setAccountLink(payload.accountLink);
        setAccountLinkMessage(accountLinkMessageFromState(payload.accountLink));
        setProAccess(payload.proAccess);
        setProAccessFailed(false);
      }

      if (authHeaders && mounted) {
        const membershipResponse = await fetch("/api/pro/membership", {
          cache: "no-store",
          headers: authHeaders,
        });
        const membershipPayload = (await membershipResponse.json()) as ProMembershipResponse;
        await loadEntitlements(authHeaders);

        if (mounted) {
          setMembership(membershipPayload.membership);
          setMembershipMessage(
            membershipPayload.ok
              ? "已讀取你的會員方案與功能權限。"
              : "完成帳號綁定後即可確認會員方案。",
          );
        }
      }
    }

    void loadAccess().catch(() => {
      if (mounted) {
        setProAccessFailed(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [showProAccess]);

  const backend = mapBackendState(health, failed);
  const proStatus = proAccess?.status ?? "checking";
  const accountLinkStatus = accountLink?.status ?? "checking";
  const sourceLabel =
    source === "account" ? "帳號頁" : source === "pro" ? "Pro 頁" : "Pro 預覽";
  const accessReason = proAccessFailed
    ? "暫時無法確認 Pro 使用資格，付費功能維持關閉。"
    : proAccessReasonLabel(proStatus);
  const canOpenPro = proAccess?.canOpenPro === true;
  const showAccountLink = source === "account" && showProAccess;
  const activeEntitlements = entitlements ?? membership?.entitlements ?? null;
  const gatedFeatures = [
    {
      description: "完成 Pro 權限後，會開放投資組合相關分析。",
      enabled: canAccessPortfolio(activeEntitlements),
      name: "投資組合分析",
    },
    {
      description: "完成 Pro 權限後，會開放 FCN 監控與觀察日提醒。",
      enabled: canAccessFCN(activeEntitlements),
      name: "FCN 監控",
    },
    {
      description: "完成 Pro 權限後，會開放風險中心與情境提醒。",
      enabled: canAccessRiskEngine(activeEntitlements),
      name: "風險中心",
    },
  ];
  const betaOpenAccess = accountLinkStatus === "linked";
  const legacyLoginWarning =
    "IXAI Pro 目前仍是獨立測試環境。App 共用登入正在串接中；若你有受邀測試帳號，請使用指定的 Pro 帳密。";

  async function handleConnectProAccount() {
    setAccountLinkPending(true);

    try {
      const authHeaders = await getSupabaseAuthorizationHeaders();
      const response = await fetch("/api/pro/account-link", {
        cache: "no-store",
        headers: authHeaders,
        method: "POST",
      });
      const payload = (await response.json()) as AccountLinkResponse;

      setAccountLink(payload.accountLink);
      setAccountLinkMessage(accountLinkMessageFromState(payload.accountLink));

      if (payload.accountLink.status === "linked" && authHeaders) {
        const membershipResponse = await fetch("/api/pro/membership", {
          cache: "no-store",
          headers: authHeaders,
        });
        const membershipPayload = (await membershipResponse.json()) as ProMembershipResponse;
        await loadEntitlements(authHeaders);

        setMembership(membershipPayload.membership);
        setMembershipMessage(
          membershipPayload.ok
            ? "已讀取你的會員方案與功能權限。"
            : "完成帳號綁定後即可確認會員方案。",
        );
      }
    } catch {
      setAccountLink({
        backendAccountId: null,
        requiresAction: true,
        status: "error",
      });
      setAccountLinkMessage("Pro 帳號綁定暫時無法完成。");
    } finally {
      setAccountLinkPending(false);
    }
  }

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.3)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            IXAI Pro · {sourceLabel}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
            IXAI Pro 正在與 App 帳號整合中。
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            完成後，使用者將可用同一組帳號進入 Pro。測試期間，已登入並完成綁定的使用者可試用 Pro 模組；目前不含付款、券商串接、真實部位資料或投資建議。
          </p>
          <p className="mt-2 max-w-3xl rounded-lg border border-amber-700/20 bg-amber-50/80 px-3 py-2 text-xs leading-6 text-amber-950">
            {legacyLoginWarning}
          </p>
        </div>

        <div className="grid min-w-[210px] gap-2">
          {showProAccess ? (
            <div className={`rounded-lg border px-3 py-2 ${proAccessTone(proStatus)}`}>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Pro 使用資格
              </p>
              <p className="mt-1 text-sm font-semibold">{proAccessLabel(proStatus)}</p>
              <p className="mt-1 text-xs leading-5 opacity-80">{accessReason}</p>
              {proAccess?.billingRequired ? (
                <p className="mt-2 text-xs leading-5 opacity-80">
                  完整 Pro 使用權未來會需要付費或人工核准。
                </p>
              ) : null}
            </div>
          ) : null}

          {showBackendStatus ? (
            <div className={`rounded-lg border px-3 py-2 ${toneClass(backend.tone)}`}>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                <Database className="h-3.5 w-3.5" aria-hidden="true" />
                系統連線
              </p>
              <p className="mt-1 text-sm font-semibold">{backend.label}</p>
              <p className="mt-1 text-xs leading-5 opacity-80">{backend.detail}</p>
            </div>
          ) : null}

          {showAccountLink ? (
            <div className={`rounded-lg border px-3 py-2 ${accountLinkTone(accountLinkStatus)}`}>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                帳號綁定
              </p>
              <p className="mt-1 text-sm font-semibold">{accountLinkLabel(accountLinkStatus)}</p>
              <p className="mt-1 text-xs leading-5 opacity-80">{accountLinkMessage}</p>
            </div>
          ) : null}

          {showAccountLink ? (
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/50 px-3 py-2 text-[var(--ixai-forest)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ixai-forest)]">
                會員方案
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{membershipLabel(membership)}</p>
                <span className="rounded border border-[rgba(9,41,31,0.24)] bg-[var(--ixai-forest)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ixai-cream)]">
                  {planBadgeLabel(entitlementPlan ?? membership?.planCode)}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">
                {membershipMessage}
              </p>
              <div className="mt-2 grid gap-1 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                {[
                  ["每日晨報", activeEntitlements?.daily_brief],
                  ["每週情報", activeEntitlements?.weekly_brief],
                  ["關注清單", activeEntitlements?.watchlist],
                  ["投資組合", canAccessPortfolio(activeEntitlements)],
                  ["FCN 監控", canAccessFCN(activeEntitlements)],
                  ["風險中心", canAccessRiskEngine(activeEntitlements)],
                ].map(([label, enabled]) => (
                  <span className="flex items-center justify-between gap-2" key={String(label)}>
                    <span>{label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
                      {enabled ? "可使用" : "未開放"}
                    </span>
                  </span>
                ))}
              </div>
              <div className="mt-3 grid gap-2">
                {gatedFeatures.map((feature) => (
                  <LockedFeatureCard
                    description={feature.description}
                    enabled={feature.enabled}
                    key={feature.name}
                    name={feature.name}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {!showAccountLink && showProAccess ? (
            <div className="rounded-lg border border-[var(--ixai-border)] bg-white/50 px-3 py-2 text-[var(--ixai-forest)]">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                Pro 模組
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--ixai-ink-muted)]">
                Pro 入口會依照同一份 App 會員方案與權限顯示。
              </p>
              <div className="mt-3 grid gap-2">
                {gatedFeatures.map((feature) => (
                  <LockedFeatureCard
                    description={feature.description}
                    enabled={feature.enabled}
                    key={feature.name}
                    name={feature.name}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
        {showAccountLink ? (
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              accountLinkPending ||
              proStatus === "checking" ||
              proAccess?.status === "not_connected" ||
              accountLink?.status === "linked"
            }
            onClick={handleConnectProAccount}
            type="button"
          >
            <ShieldCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
            {accountLinkPending ? "連線中..." : "綁定 Pro 帳號"}
          </button>
        ) : null}
        {showProAccess && proAccess?.status === "not_connected" ? (
          <Link
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
            href="/login"
          >
            登入後綁定 Pro
          </Link>
        ) : betaOpenAccess || canOpenPro || showAccountLink ? (
          <a
            aria-label="在獨立測試環境開啟 IXAI Pro"
            className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
            href={IXAI_PRO_LAB_URL}
            rel="noreferrer"
            target="_blank"
            title="在獨立測試環境開啟 IXAI Pro"
          >
            <span>開啟 IXAI Pro</span>
            <ArrowUpRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          </a>
        ) : (
          <div className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-center text-sm font-medium text-[var(--ixai-forest-soft)]">
            Pro 使用權保留給受邀測試或付費使用者
          </div>
        )}
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
          href="/pro"
        >
          <ShieldCheck className="h-4 w-4 text-[var(--ixai-forest)]" aria-hidden="true" />
          查看 Pro 測試區
        </Link>
        <a
          aria-label="了解為什麼 Pro 測試區目前是獨立登入"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/45 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest-soft)]"
          href={IXAI_PRO_LAB_URL}
          rel="noreferrer"
          target="_blank"
          title="開啟獨立 Pro 測試區"
        >
          Pro 測試區目前是獨立登入
          <ArrowUpRight className="h-4 w-4 text-[var(--ixai-forest)]" aria-hidden="true" />
        </a>
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
        這個區塊只確認帳號與 Pro 入口狀態，不載入投資部位、FCN 部位、券商資料或個人化建議。
        綁定帳號不代表已開通付費 Pro；舊版 Pro 測試區尚未完成共用登入。
      </p>
    </section>
  );
}

function accountLinkMessageFromState(accountLink: ProAccountLink) {
  if (accountLink.status === "linked") {
    return "你的 App 帳號已完成 Pro 身份綁定；完整 Pro 使用權仍需測試資格或付費權限。";
  }

  if (accountLink.status === "backend_not_configured") {
    return "此環境尚未設定 Pro 系統連線，暫時無法開始綁定。";
  }

  if (accountLink.status === "backend_contract_missing") {
    return "Pro 帳號串接仍在準備中。";
  }

  if (accountLink.status === "error") {
    return "Pro 帳號綁定檢查暫時失敗。";
  }

  return "請先綁定 App 帳號，再確認 Pro 使用資格。";
}
