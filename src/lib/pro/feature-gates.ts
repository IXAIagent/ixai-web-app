export type IXAIPlanCode = "free" | "personal" | "pro" | "enterprise" | string;

export type IXAIEntitlements = {
  ai_copilot: boolean;
  daily_brief: boolean;
  fcn_monitoring: boolean;
  portfolio: boolean;
  pro_preview: boolean;
  risk_engine: boolean;
  watchlist: boolean;
  weekly_brief: boolean;
};

export const FREE_ENTITLEMENTS: IXAIEntitlements = {
  ai_copilot: false,
  daily_brief: true,
  fcn_monitoring: false,
  portfolio: false,
  pro_preview: false,
  risk_engine: false,
  watchlist: true,
  weekly_brief: true,
};

export const BETA_OPEN_ACCESS_ENABLED = true;

export function normalizeEntitlements(value: unknown): IXAIEntitlements {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return Object.fromEntries(
    Object.entries(FREE_ENTITLEMENTS).map(([key, fallback]) => [
      key,
      typeof source[key] === "boolean" ? source[key] : fallback,
    ]),
  ) as IXAIEntitlements;
}

export function canUseBetaOpenAccess({
  accountLinkStatus,
  authenticated,
}: {
  accountLinkStatus?: string | null;
  authenticated?: boolean;
}) {
  return BETA_OPEN_ACCESS_ENABLED && authenticated === true && accountLinkStatus === "linked";
}

export function applyBetaOpenAccess(
  entitlements: IXAIEntitlements,
  betaOpenAccess: boolean,
): IXAIEntitlements {
  if (!betaOpenAccess) {
    return entitlements;
  }

  return {
    ...entitlements,
    fcn_monitoring: true,
    portfolio: true,
    risk_engine: true,
  };
}

export function canAccessPortfolio(entitlements: IXAIEntitlements | null | undefined) {
  return entitlements?.portfolio === true;
}

export function canAccessFCN(entitlements: IXAIEntitlements | null | undefined) {
  return entitlements?.fcn_monitoring === true;
}

export function canAccessRiskEngine(entitlements: IXAIEntitlements | null | undefined) {
  return entitlements?.risk_engine === true;
}
