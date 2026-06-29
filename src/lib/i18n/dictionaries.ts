import { DEFAULT_LOCALE, type IXAILocale } from "@/src/lib/i18n/locales";

type Dictionary = {
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
    copilot: string;
    exitHeading: string;
    fcn: string;
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
    exitPublic: string;
  };
};

const zhTW: Dictionary = {
  language: {
    compactLabel: "語言",
    currentLabel: "目前語言",
    fullLabel: "Change language",
    helper: "Public App 與 Workspace 共用此語言偏好。",
    label: "Language",
  },
  publicNav: {
    about: "About 一玄",
    dailyBrief: "每日晨報",
    fcn: "FCN",
    headingOfficial: "官網",
    headingProduct: "產品",
    home: "市場首頁",
    login: "登入",
    market: "市場總覽",
    platform: "IXAI Platform",
    signOut: "登出",
    subtitle: "每日市場情報入口。",
    title: "市場情報",
    weeklyBrief: "每週情報",
    workspace: "我的 IXAI Workspace",
  },
  settingsLanguage: {
    copy: "Public App 與 Workspace 共用此語言偏好。本版使用 localStorage + cookie，不接 Supabase。",
    helper: "未來可同步到 user preferences；目前不啟用 ixai_user_preferences optional sync。",
    label: "Language",
    status: "Available",
    title: "Language preference",
  },
  workspaceNav: {
    assetInput: "Asset Input",
    copilot: "Copilot",
    exitHeading: "Exit",
    fcn: "FCN Center",
    home: "Workspace Home",
    intelligence: "Intelligence Center",
    notifications: "Notifications",
    portfolio: "Portfolio Center",
    risk: "Risk Center",
    settings: "Settings",
    signOut: "登出",
    subtitle: "登入後的產品工作區。",
    timeline: "Timeline",
    title: "IXAI Workspace",
    watchlist: "Watchlist",
    workspaceHeading: "Workspace",
    exitPublic: "返回官網",
  },
};

const dictionaries: Record<IXAILocale, Dictionary> = {
  "zh-TW": zhTW,
  "zh-CN": {
    language: {
      compactLabel: "语言",
      currentLabel: "当前语言",
      fullLabel: "Change language",
      helper: "Public App 与 Workspace 共用此语言偏好。",
      label: "Language",
    },
    publicNav: {
      about: "About 一玄",
      dailyBrief: "每日晨报",
      fcn: "FCN",
      headingOfficial: "官网",
      headingProduct: "产品",
      home: "市场首页",
      login: "登录",
      market: "市场总览",
      platform: "IXAI Platform",
      signOut: "登出",
      subtitle: "每日市场情报入口。",
      title: "市场情报",
      weeklyBrief: "每周情报",
      workspace: "我的 IXAI Workspace",
    },
    settingsLanguage: {
      copy: "Public App 与 Workspace 共用此语言偏好。本版使用 localStorage + cookie，不连接 Supabase。",
      helper: "未来可同步到 user preferences；目前不启用 ixai_user_preferences optional sync。",
      label: "Language",
      status: "Available",
      title: "语言偏好",
    },
    workspaceNav: {
      assetInput: "Asset Input",
      copilot: "Copilot",
      exitHeading: "Exit",
      fcn: "FCN Center",
      home: "Workspace Home",
      intelligence: "Intelligence Center",
      notifications: "Notifications",
      portfolio: "Portfolio Center",
      risk: "Risk Center",
      settings: "Settings",
      signOut: "登出",
      subtitle: "登录后的产品工作区。",
      timeline: "Timeline",
      title: "IXAI Workspace",
      watchlist: "Watchlist",
      workspaceHeading: "Workspace",
      exitPublic: "返回官网",
    },
  },
  "en-US": {
    language: {
      compactLabel: "Language",
      currentLabel: "Current language",
      fullLabel: "Change language",
      helper: "Public App and Workspace share this language preference.",
      label: "Language",
    },
    publicNav: {
      about: "About",
      dailyBrief: "Daily Brief",
      fcn: "FCN",
      headingOfficial: "Public",
      headingProduct: "Product",
      home: "Home",
      login: "Log in",
      market: "Market",
      platform: "IXAI Platform",
      signOut: "Sign out",
      subtitle: "Daily market intelligence entry.",
      title: "Market Intelligence",
      weeklyBrief: "Weekly Brief",
      workspace: "My IXAI Workspace",
    },
    settingsLanguage: {
      copy: "Public App and Workspace share this language preference. This version uses localStorage + cookie, without Supabase.",
      helper: "Future versions may sync to user preferences; ixai_user_preferences optional sync is not enabled now.",
      label: "Language",
      status: "Available",
      title: "Language preference",
    },
    workspaceNav: {
      assetInput: "Asset Input",
      copilot: "Copilot",
      exitHeading: "Exit",
      fcn: "FCN Center",
      home: "Workspace Home",
      intelligence: "Intelligence Center",
      notifications: "Notifications",
      portfolio: "Portfolio Center",
      risk: "Risk Center",
      settings: "Settings",
      signOut: "Sign out",
      subtitle: "Authenticated product workspace.",
      timeline: "Timeline",
      title: "IXAI Workspace",
      watchlist: "Watchlist",
      workspaceHeading: "Workspace",
      exitPublic: "Back to public site",
    },
  },
  "ja-JP": {
    language: {
      compactLabel: "言語",
      currentLabel: "現在の言語",
      fullLabel: "Change language",
      helper: "Public App と Workspace は同じ言語設定を共有します。",
      label: "Language",
    },
    publicNav: {
      about: "About 一玄",
      dailyBrief: "デイリーブリーフ",
      fcn: "FCN",
      headingOfficial: "公式サイト",
      headingProduct: "プロダクト",
      home: "マーケットホーム",
      login: "ログイン",
      market: "マーケット",
      platform: "IXAI Platform",
      signOut: "ログアウト",
      subtitle: "日々のマーケット情報入口。",
      title: "マーケット情報",
      weeklyBrief: "ウィークリーブリーフ",
      workspace: "My IXAI Workspace",
    },
    settingsLanguage: {
      copy: "Public App と Workspace は同じ言語設定を共有します。本版は localStorage + cookie を使い、Supabase には接続しません。",
      helper: "将来 user preferences と同期できますが、現在 ixai_user_preferences optional sync は有効化していません。",
      label: "Language",
      status: "Available",
      title: "言語設定",
    },
    workspaceNav: {
      assetInput: "Asset Input",
      copilot: "Copilot",
      exitHeading: "Exit",
      fcn: "FCN Center",
      home: "Workspace Home",
      intelligence: "Intelligence Center",
      notifications: "Notifications",
      portfolio: "Portfolio Center",
      risk: "Risk Center",
      settings: "Settings",
      signOut: "ログアウト",
      subtitle: "ログイン後のプロダクト Workspace。",
      timeline: "Timeline",
      title: "IXAI Workspace",
      watchlist: "Watchlist",
      workspaceHeading: "Workspace",
      exitPublic: "公式サイトへ戻る",
    },
  },
  "ko-KR": {
    language: {
      compactLabel: "언어",
      currentLabel: "현재 언어",
      fullLabel: "Change language",
      helper: "Public App과 Workspace가 같은 언어 설정을 공유합니다.",
      label: "Language",
    },
    publicNav: {
      about: "About 一玄",
      dailyBrief: "데일리 브리프",
      fcn: "FCN",
      headingOfficial: "공식 사이트",
      headingProduct: "제품",
      home: "시장 홈",
      login: "로그인",
      market: "시장 개요",
      platform: "IXAI Platform",
      signOut: "로그아웃",
      subtitle: "매일 시장 정보를 읽는 입구.",
      title: "시장 정보",
      weeklyBrief: "위클리 브리프",
      workspace: "My IXAI Workspace",
    },
    settingsLanguage: {
      copy: "Public App과 Workspace가 같은 언어 설정을 공유합니다. 이번 버전은 localStorage + cookie를 사용하며 Supabase에는 연결하지 않습니다.",
      helper: "향후 user preferences와 동기화할 수 있지만 지금은 ixai_user_preferences optional sync를 활성화하지 않습니다.",
      label: "Language",
      status: "Available",
      title: "언어 설정",
    },
    workspaceNav: {
      assetInput: "Asset Input",
      copilot: "Copilot",
      exitHeading: "Exit",
      fcn: "FCN Center",
      home: "Workspace Home",
      intelligence: "Intelligence Center",
      notifications: "Notifications",
      portfolio: "Portfolio Center",
      risk: "Risk Center",
      settings: "Settings",
      signOut: "로그아웃",
      subtitle: "로그인 후 사용하는 제품 Workspace.",
      timeline: "Timeline",
      title: "IXAI Workspace",
      watchlist: "Watchlist",
      workspaceHeading: "Workspace",
      exitPublic: "공식 사이트로 돌아가기",
    },
  },
};

export function getDictionary(locale: IXAILocale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
