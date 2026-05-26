import type { MembershipPlan, MembershipRecord } from "@/src/lib/membership/memberships";

export type IntelligenceSurface =
  | "public_daily"
  | "public_weekly"
  | "market_overview"
  | "fcn_education"
  | "pro_preview"
  | "pro_portfolio"
  | "pro_fcn_risk"
  | "pro_ai_alerts"
  | "pro_watchlist"
  | "pro_macro_intelligence";

export type IntelligenceAccessState = "public" | "preview" | "gated" | "allowed";

export type IntelligenceAccessResult = {
  allowed: boolean;
  previewOnly: boolean;
  state: IntelligenceAccessState;
  requiredPlan?: Exclude<MembershipPlan, "free">;
  surface: IntelligenceSurface;
  title: string;
  reason: string;
  upgradePrompt: string;
};

type AccessContext = {
  membership?: Pick<MembershipRecord, "plan" | "status" | "expires_at"> | null;
  plan?: MembershipPlan | "anonymous";
};

const PUBLIC_SURFACES = new Set<IntelligenceSurface>([
  "public_daily",
  "public_weekly",
  "market_overview",
  "fcn_education",
]);

const PRO_SURFACES = new Set<IntelligenceSurface>([
  "pro_portfolio",
  "pro_fcn_risk",
  "pro_ai_alerts",
  "pro_watchlist",
  "pro_macro_intelligence",
]);

const SURFACE_LABELS: Record<IntelligenceSurface, string> = {
  fcn_education: "FCN 教育",
  market_overview: "市場總覽",
  pro_ai_alerts: "AI 警示層",
  pro_fcn_risk: "FCN Risk Intelligence",
  pro_macro_intelligence: "Macro Memory Layer",
  pro_portfolio: "Portfolio Intelligence",
  pro_preview: "IXAI Pro Preview",
  pro_watchlist: "Watchlist Intelligence",
  public_daily: "Daily Brief",
  public_weekly: "Weekly Intelligence",
};

const UPGRADE_PROMPTS: Record<IntelligenceSurface, string> = {
  fcn_education: "此內容屬於 Public Intelligence，可直接閱讀。",
  market_overview: "市場總覽屬於 Public Intelligence，可直接使用。",
  pro_ai_alerts: "AI 警示層屬於 IXAI Pro Intelligence，加入 Pro 等候名單以取得開放通知。",
  pro_fcn_risk: "FCN 風險情報屬於 IXAI Pro Intelligence，未來將支援個人化 monitoring workflow。",
  pro_macro_intelligence: "Macro Memory Layer 屬於 IXAI Pro Intelligence，將市場 regime 轉化為個人化風險脈絡。",
  pro_portfolio: "Portfolio Intelligence 屬於 IXAI Pro Intelligence，未來將連接個人曝險與市場記憶。",
  pro_preview: "此為 sample-only Pro preview，可公開瀏覽但不代表正式權限已開通。",
  pro_watchlist: "Watchlist Intelligence 屬於 IXAI Pro Intelligence，未來將支援個人化觀察與警示。",
  public_daily: "Daily Brief 屬於 Public Intelligence，可直接閱讀。",
  public_weekly: "Weekly Intelligence 屬於 Public Intelligence，可直接閱讀。",
};

function hasActiveAccess(membership?: AccessContext["membership"]) {
  if (!membership || membership.status === "expired" || membership.status === "cancelled") {
    return false;
  }

  if (!membership.expires_at) {
    return true;
  }

  const expiresAt = new Date(membership.expires_at).getTime();
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

function getPlan(context: AccessContext = {}): MembershipPlan | "anonymous" {
  return context.membership?.plan ?? context.plan ?? "anonymous";
}

function hasProAccess(context: AccessContext = {}) {
  const plan = getPlan(context);

  if (plan === "enterprise") {
    return true;
  }

  if (plan !== "pro") {
    return false;
  }

  return context.membership ? hasActiveAccess(context.membership) : true;
}

export function isPreviewOnlySurface(surface: IntelligenceSurface) {
  return surface === "pro_preview";
}

export function canAccessSurface(surface: IntelligenceSurface, context: AccessContext = {}) {
  if (PUBLIC_SURFACES.has(surface)) {
    return true;
  }

  if (isPreviewOnlySurface(surface)) {
    return true;
  }

  if (PRO_SURFACES.has(surface)) {
    return hasProAccess(context);
  }

  return false;
}

export function getUpgradePrompt(surface: IntelligenceSurface) {
  return UPGRADE_PROMPTS[surface];
}

export function getSurfaceAccessState(
  surface: IntelligenceSurface,
  context: AccessContext = {},
): IntelligenceAccessResult {
  const allowed = canAccessSurface(surface, context);
  const previewOnly = isPreviewOnlySurface(surface);
  const publicSurface = PUBLIC_SURFACES.has(surface);

  return {
    allowed,
    previewOnly,
    requiredPlan: PRO_SURFACES.has(surface) ? "pro" : undefined,
    reason: previewOnly
      ? "此介面僅供展示，不代表正式 Pro 權限已開通。"
      : getUpgradePrompt(surface),
    state: publicSurface ? "public" : previewOnly ? "preview" : allowed ? "allowed" : "gated",
    surface,
    title: SURFACE_LABELS[surface],
    upgradePrompt: getUpgradePrompt(surface),
  };
}
