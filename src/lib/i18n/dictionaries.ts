import { DEFAULT_LOCALE, type IXAILocale } from "@/src/lib/i18n/locales";

export const I18N_NAMESPACES = [
  "common",
  "navigation",
  "workspace",
  "settings",
  "health",
  "beta",
  "errors",
  "buttons",
  "labels",
] as const;

export type I18NNamespace = (typeof I18N_NAMESPACES)[number];
export type NamespaceDictionary = Record<string, string>;
export type TranslationPack = Record<I18NNamespace, NamespaceDictionary>;

export type Dictionary = TranslationPack & {
  language: {
    compactLabel: string;
    currentLabel: string;
    fullLabel: string;
    helper: string;
    label: string;
  };
  publicNav: {
    about: string;
    dailyBrief: string;
    fcn: string;
    headingOfficial: string;
    headingProduct: string;
    home: string;
    login: string;
    market: string;
    platform: string;
    signOut: string;
    subtitle: string;
    title: string;
    weeklyBrief: string;
    workspace: string;
  };
  settingsLanguage: {
    copy: string;
    helper: string;
    label: string;
    status: string;
    title: string;
  };
  workspaceNav: {
    assetInput: string;
    beta: string;
    copilot: string;
    exitHeading: string;
    exitPublic: string;
    fcn: string;
    health: string;
    home: string;
    intelligence: string;
    notifications: string;
    portfolio: string;
    risk: string;
    settings: string;
    signOut: string;
    subtitle: string;
    timeline: string;
    title: string;
    watchlist: string;
    workspaceHeading: string;
  };
};

const zhTWPack: TranslationPack = {
  common: {
    appName: "IXAI",
    betaPreview: "V14 Beta Preview",
    footerDisclaimer: "市場資料與內容僅供資訊參考，不構成投資建議、買賣指令或報酬承諾。",
    landingBody: "從每日市場情報、FCN 教育到 IXAI Pro 監控工作區，一玄把投資顧問經驗轉化成可持續使用的 AI 投資情報系統。",
    landingCtaFcn: "了解 FCN 監控",
    landingCtaPrimary: "閱讀每日晨報",
    landingCtaPro: "申請 Pro 測試",
    landingEyebrow: "一玄 AI 投資助理",
    landingTitle: "一玄 AI 投資助理，幫你看懂市場，也看見風險。",
    learnPro: "了解 IXAI Pro",
    publicWebsite: "Public Website",
    workspaceMode: "Workspace Mode",
  },
  navigation: {
    about: "About 一玄",
    assetInput: "Asset Input",
    beta: "V14 Beta",
    copilot: "Copilot",
    dailyBrief: "每日晨報",
    exit: "Exit",
    fcn: "FCN Center",
    health: "Health Center",
    home: "市場首頁",
    intelligence: "Intelligence Center",
    login: "登入",
    market: "市場總覽",
    notifications: "Notifications",
    platform: "IXAI Platform",
    portfolio: "Portfolio Center",
    productHeading: "產品",
    publicBack: "返回官網",
    publicHeading: "官網",
    publicSubtitle: "每日市場情報入口。",
    publicTitle: "市場情報",
    risk: "Risk Center",
    settings: "Settings",
    signOut: "登出",
    timeline: "Timeline",
    watchlist: "Watchlist",
    weeklyBrief: "每週情報",
    workspace: "我的 IXAI Workspace",
    workspaceHeading: "Workspace",
    workspaceHome: "Workspace Home",
    workspaceSubtitle: "登入後的產品工作區。",
    workspaceTitle: "IXAI Workspace",
  },
  workspace: {
    assetInputTitle: "快速新增資產",
    betaCardDescription: "查看 V14 Beta checklist、release notes 與 feedback template。",
    betaCardTitle: "V14 Beta Preview",
    centersEyebrow: "Workspace Centers",
    centersTitle: "主要工作中心",
    fcnCta: "進入 FCN Center",
    healthCardDescription: "檢查 provider、cache、runtime safety、data quality 與 i18n readiness。",
    healthCardTitle: "Health Center",
    heroBody: "V14 Beta 功能主線已完成。V13 Sprint 1 重新啟動國際化主線，先建立可擴充的 dictionary、provider、language switcher 與 Public / Workspace 共用 locale persistence。",
    heroCtaPrimary: "進入 Portfolio Center",
    heroEyebrow: "IXAI Workspace",
    heroTitle: "歡迎回到 IXAI Workspace。",
    localeCardBody: "目前頁面已接入 V13 Sprint 1 locale provider。Home、Settings、Health、Beta 與 Public navigation 共用同一套字典。",
    localeCardTitle: "Internationalization foundation active",
    open: "Open",
    safeShell: "Static safe shell",
    snapshotTitle: "Live Intelligence snapshot",
  },
  settings: {
    accountDescription: "查看帳號狀態與 Workspace transition。完整會員與方案設定留待後續版本。",
    accountLabel: "Account",
    available: "Available",
    brokerDescription: "Broker connection 將採 read-only、consent-first、安全 credential 管理；目前未啟用。",
    brokerLabel: "Broker Connections",
    comingSoon: "Coming Soon",
    dataDescription: "資料隱私、local pending input、manual price overlay 與未來 export / delete controls 的設定區。",
    dataLabel: "Data & Privacy",
    footerNote: "Settings Preview 僅整理 Workspace preference architecture。本頁不啟用付款、會員升級、broker sync、通知投遞、自動交易或投資建議。",
    heroBody: "Settings 目前是 Workspace 設定預覽頁，先整理帳號、通知、語言、地區、資料與未來 broker connection 的資訊架構；本版不改 auth、membership、entitlement 或 payment。",
    heroEyebrow: "Workspace Settings Preview",
    heroTitle: "Settings",
    languageCopy: "Public App 與 Workspace 共用此語言偏好。本版使用 localStorage + cookie，不接 Supabase。",
    languageHelper: "未來可同步到 user preferences；目前不啟用 ixai_user_preferences optional sync。",
    languageLabel: "Language",
    languageStatus: "Available",
    languageTitle: "Language preference",
    notificationsDescription: "通知偏好入口已存在；正式 alert routing、LINE / email delivery 尚未啟用。",
    notificationsLabel: "Notifications",
    open: "Open",
    preview: "Preview",
    regionDescription: "地區與市場偏好將服務 US / TW / HK / CN / JP / KR / EU / SG / Crypto / FCN。",
    regionLabel: "Region",
    sharedLocaleNote: "Workspace Settings manages the same locale state used by the Public App. This version does not enable Supabase user-preference sync.",
  },
  health: {
    binancePending: "Manual refresh has not checked BTCUSDT through the internal quote route yet.",
    binanceStatus: "Binance status",
    checking: "Checking",
    dataQualitySummary: "Data quality summary",
    fcnReadiness: "FCN live risk readiness",
    generated: "Generated",
    healthCenter: "Workspace Health Center",
    i18nDetail: "V13 Sprint 1 locale foundation is localStorage + cookie only and now exposes namespace dictionaries.",
    i18nStatus: "i18n foundation status",
    marketApi: "Market API",
    morningBriefDetail: "Morning Brief uses on-demand Workspace Intelligence and fallback sections.",
    morningBriefReadiness: "Morning Brief readiness",
    overallHealth: "Overall Health",
    portfolioReadiness: "Portfolio valuation readiness",
    quoteCacheStatus: "Quote cache status",
    refresh: "Refresh Health",
    runtimeDetail: "Runtime safety uses manual refresh, budget guards, settled fallbacks, and no direct browser provider fetch.",
    runtimeStatus: "Runtime safety status",
    subtitle: "Read-only health view for market provider status, cache awareness, runtime safety, data quality, and V13 i18n foundation. Refresh is manual to avoid request storms.",
    title: "Production readiness health",
    yahooPending: "Manual refresh has not checked AAPL through the internal quote route yet.",
    yahooStatus: "Yahoo status",
  },
  beta: {
    beforeUsers: "Before inviting users",
    blocked: "blocked",
    betaNote: "Beta note: V14 Beta Preview is invite-only later. This dashboard does not enable trading, broker connection, recommendations, target prices, automated execution, AI model calls, scheduler, LINE, Telegram, email, or push delivery.",
    dashboardTitle: "Beta Readiness Dashboard",
    not_started: "not started",
    openHealth: "Open Health Center",
    partial: "partial",
    productionQa: "Production QA",
    productionQaBody: "Run production-like route smoke, verify copy/export/print, and confirm no white screen, no RESULT_CODE_HUNG, and no repeated 401/404/provider storm.",
    ready: "ready",
    subtitle: "Invite-only readiness view for V14. Beta is not public yet. Production verification remains required before any external testing claim.",
    total: "Total",
  },
  errors: {
    missingTranslation: "Missing translation",
    unavailable: "Unavailable",
    unknown: "Unknown",
  },
  buttons: {
    changeLanguage: "Change language",
    copy: "Copy",
    export: "Export",
    open: "Open",
    refresh: "Refresh",
  },
  labels: {
    currentLanguage: "目前語言",
    language: "Language",
    localePersistence: "localStorage + cookie",
    manualRefreshPending: "manual refresh pending",
  },
};

const enUSPack: TranslationPack = {
  common: {
    appName: "IXAI",
    betaPreview: "V14 Beta Preview",
    footerDisclaimer: "Market data and content are for informational reference only and do not constitute investment advice, trading instructions, or return promises.",
    landingBody: "From daily market intelligence and FCN education to the IXAI Pro monitoring workspace, I-Xuan turns advisory experience into a durable AI investment intelligence system.",
    landingCtaFcn: "Learn FCN monitoring",
    landingCtaPrimary: "Read Daily Brief",
    landingCtaPro: "Apply for Pro Beta",
    landingEyebrow: "I-Xuan AI Investment Assistant",
    landingTitle: "IXAI helps you understand markets and see risk clearly.",
    learnPro: "Learn IXAI Pro",
    publicWebsite: "Public Website",
    workspaceMode: "Workspace Mode",
  },
  navigation: {
    about: "About",
    assetInput: "Asset Input",
    beta: "V14 Beta",
    copilot: "Copilot",
    dailyBrief: "Daily Brief",
    exit: "Exit",
    fcn: "FCN Center",
    health: "Health Center",
    home: "Home",
    intelligence: "Intelligence Center",
    login: "Log in",
    market: "Market",
    notifications: "Notifications",
    platform: "IXAI Platform",
    portfolio: "Portfolio Center",
    productHeading: "Product",
    publicBack: "Back to public site",
    publicHeading: "Public",
    publicSubtitle: "Daily market intelligence entry.",
    publicTitle: "Market Intelligence",
    risk: "Risk Center",
    settings: "Settings",
    signOut: "Sign out",
    timeline: "Timeline",
    watchlist: "Watchlist",
    weeklyBrief: "Weekly Brief",
    workspace: "My IXAI Workspace",
    workspaceHeading: "Workspace",
    workspaceHome: "Workspace Home",
    workspaceSubtitle: "Authenticated product workspace.",
    workspaceTitle: "IXAI Workspace",
  },
  workspace: {
    assetInputTitle: "Quick asset input",
    betaCardDescription: "Review the V14 Beta checklist, release notes, and feedback template.",
    betaCardTitle: "V14 Beta Preview",
    centersEyebrow: "Workspace Centers",
    centersTitle: "Main workspace centers",
    fcnCta: "Open FCN Center",
    healthCardDescription: "Check provider, cache, runtime safety, data quality, and i18n readiness.",
    healthCardTitle: "Health Center",
    heroBody: "The V14 Beta feature mainline is complete. V13 Sprint 1 resumes the internationalization track with extensible dictionaries, provider wiring, language switching, and shared Public / Workspace locale persistence.",
    heroCtaPrimary: "Open Portfolio Center",
    heroEyebrow: "IXAI Workspace",
    heroTitle: "Welcome back to IXAI Workspace.",
    localeCardBody: "This page is connected to the V13 Sprint 1 locale provider. Home, Settings, Health, Beta, and Public navigation share the same dictionary layer.",
    localeCardTitle: "Internationalization foundation active",
    open: "Open",
    safeShell: "Static safe shell",
    snapshotTitle: "Live Intelligence snapshot",
  },
  settings: {
    accountDescription: "Review account status and Workspace transition. Full membership and plan settings remain for a later version.",
    accountLabel: "Account",
    available: "Available",
    brokerDescription: "Broker connection will be read-only, consent-first, and credential-safe; it is not enabled now.",
    brokerLabel: "Broker Connections",
    comingSoon: "Coming Soon",
    dataDescription: "Settings area for data privacy, local pending input, manual price overlays, and future export / delete controls.",
    dataLabel: "Data & Privacy",
    footerNote: "Settings Preview only organizes Workspace preference architecture. This page does not enable payments, membership upgrades, broker sync, delivery, automated trading, or investment advice.",
    heroBody: "Settings is currently the Workspace settings preview. It organizes account, notification, language, region, data, and future broker connection architecture without changing auth, membership, entitlement, or payment behavior.",
    heroEyebrow: "Workspace Settings Preview",
    heroTitle: "Settings",
    languageCopy: "Public App and Workspace share this language preference. This version uses localStorage + cookie, without Supabase.",
    languageHelper: "Future versions may sync to user preferences; ixai_user_preferences optional sync is not enabled now.",
    languageLabel: "Language",
    languageStatus: "Available",
    languageTitle: "Language preference",
    notificationsDescription: "Notification preferences exist as an entry point; formal alert routing, LINE, and email delivery are not enabled.",
    notificationsLabel: "Notifications",
    open: "Open",
    preview: "Preview",
    regionDescription: "Region and market preferences will support US / TW / HK / CN / JP / KR / EU / SG / Crypto / FCN.",
    regionLabel: "Region",
    sharedLocaleNote: "Workspace Settings manages the same locale state used by the Public App. This version does not enable Supabase user-preference sync.",
  },
  health: {
    binancePending: "Manual refresh has not checked BTCUSDT through the internal quote route yet.",
    binanceStatus: "Binance status",
    checking: "Checking",
    dataQualitySummary: "Data quality summary",
    fcnReadiness: "FCN live risk readiness",
    generated: "Generated",
    healthCenter: "Workspace Health Center",
    i18nDetail: "V13 Sprint 1 locale foundation is localStorage + cookie only and now exposes namespace dictionaries.",
    i18nStatus: "i18n foundation status",
    marketApi: "Market API",
    morningBriefDetail: "Morning Brief uses on-demand Workspace Intelligence and fallback sections.",
    morningBriefReadiness: "Morning Brief readiness",
    overallHealth: "Overall Health",
    portfolioReadiness: "Portfolio valuation readiness",
    quoteCacheStatus: "Quote cache status",
    refresh: "Refresh Health",
    runtimeDetail: "Runtime safety uses manual refresh, budget guards, settled fallbacks, and no direct browser provider fetch.",
    runtimeStatus: "Runtime safety status",
    subtitle: "Read-only health view for market provider status, cache awareness, runtime safety, data quality, and V13 i18n foundation. Refresh is manual to avoid request storms.",
    title: "Production readiness health",
    yahooPending: "Manual refresh has not checked AAPL through the internal quote route yet.",
    yahooStatus: "Yahoo status",
  },
  beta: {
    beforeUsers: "Before inviting users",
    blocked: "blocked",
    betaNote: "Beta note: V14 Beta Preview is invite-only later. This dashboard does not enable trading, broker connection, recommendations, target prices, automated execution, AI model calls, scheduler, LINE, Telegram, email, or push delivery.",
    dashboardTitle: "Beta Readiness Dashboard",
    not_started: "not started",
    openHealth: "Open Health Center",
    partial: "partial",
    productionQa: "Production QA",
    productionQaBody: "Run production-like route smoke, verify copy/export/print, and confirm no white screen, no RESULT_CODE_HUNG, and no repeated 401/404/provider storm.",
    ready: "ready",
    subtitle: "Invite-only readiness view for V14. Beta is not public yet. Production verification remains required before any external testing claim.",
    total: "Total",
  },
  errors: {
    missingTranslation: "Missing translation",
    unavailable: "Unavailable",
    unknown: "Unknown",
  },
  buttons: {
    changeLanguage: "Change language",
    copy: "Copy",
    export: "Export",
    open: "Open",
    refresh: "Refresh",
  },
  labels: {
    currentLanguage: "Current language",
    language: "Language",
    localePersistence: "localStorage + cookie",
    manualRefreshPending: "manual refresh pending",
  },
};

function withLegacyAliases(pack: TranslationPack): Dictionary {
  return {
    ...pack,
    language: {
      compactLabel: pack.labels.language,
      currentLabel: pack.labels.currentLanguage,
      fullLabel: pack.buttons.changeLanguage,
      helper:
        pack.settings.languageCopy ??
        "Public App and Workspace share this language preference.",
      label: pack.labels.language,
    },
    publicNav: {
      about: pack.navigation.about,
      dailyBrief: pack.navigation.dailyBrief,
      fcn: pack.navigation.fcn,
      headingOfficial: pack.navigation.publicHeading,
      headingProduct: pack.navigation.productHeading,
      home: pack.navigation.home,
      login: pack.navigation.login,
      market: pack.navigation.market,
      platform: pack.navigation.platform,
      signOut: pack.navigation.signOut,
      subtitle: pack.navigation.publicSubtitle,
      title: pack.navigation.publicTitle,
      weeklyBrief: pack.navigation.weeklyBrief,
      workspace: pack.navigation.workspace,
    },
    settingsLanguage: {
      copy: pack.settings.languageCopy,
      helper: pack.settings.languageHelper,
      label: pack.settings.languageLabel,
      status: pack.settings.languageStatus,
      title: pack.settings.languageTitle,
    },
    workspaceNav: {
      assetInput: pack.navigation.assetInput,
      beta: pack.navigation.beta,
      copilot: pack.navigation.copilot,
      exitHeading: pack.navigation.exit,
      exitPublic: pack.navigation.publicBack,
      fcn: pack.navigation.fcn,
      health: pack.navigation.health,
      home: pack.navigation.workspaceHome,
      intelligence: pack.navigation.intelligence,
      notifications: pack.navigation.notifications,
      portfolio: pack.navigation.portfolio,
      risk: pack.navigation.risk,
      settings: pack.navigation.settings,
      signOut: pack.navigation.signOut,
      subtitle: pack.navigation.workspaceSubtitle,
      timeline: pack.navigation.timeline,
      title: pack.navigation.workspaceTitle,
      watchlist: pack.navigation.watchlist,
      workspaceHeading: pack.navigation.workspaceHeading,
    },
  };
}

const dictionaries: Record<IXAILocale, Dictionary> = {
  "zh-TW": withLegacyAliases(zhTWPack),
  "zh-CN": withLegacyAliases(zhTWPack),
  "en-US": withLegacyAliases(enUSPack),
  "ja-JP": withLegacyAliases(enUSPack),
  "ko-KR": withLegacyAliases(enUSPack),
};

export function getDictionary(locale: IXAILocale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function translate(
  dictionary: Dictionary,
  namespace: I18NNamespace,
  key: string,
  fallback?: string,
): string {
  return dictionary[namespace][key] ?? fallback ?? `${namespace}.${key}`;
}
