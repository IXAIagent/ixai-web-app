import { Brain, LineChart, Radar, ShieldCheck, Sunrise, type LucideIcon } from "lucide-react";
import { ixaiSiteUrl } from "@/src/lib/brand/metadata";
import type { ShareCopy } from "@/src/lib/share/share-copy";

export type ShareIntelligenceSlug =
  | "market-pulse"
  | "fcn-awareness"
  | "watchlist-preview"
  | "ai-risk-monitor"
  | "morning-intelligence";

export type ShareIntelligenceItem = {
  aiContext: string;
  category: string;
  description: string;
  icon: LucideIcon;
  slug: ShareIntelligenceSlug;
  summary: string;
  title: string;
  whyItMatters: string[];
};

export const SHARE_INTELLIGENCE_ITEMS: ShareIntelligenceItem[] = [
  {
    aiContext:
      "市場風險偏好轉弱時，高 beta 科技股、Crypto 與高波動標的通常會先反映資金避險行為。IXAI 會把這類訊號轉成 market awareness，而不是買賣指令。",
    category: "Market Pulse",
    description: "一張可分享的市場風險偏好 intelligence card。",
    icon: LineChart,
    slug: "market-pulse",
    summary: "美股風險偏好轉弱，AI supply chain names 仍是觀察核心。",
    title: "Market Pulse Intelligence",
    whyItMatters: [
      "幫助使用者理解今日市場 regime 是否偏向 risk-on 或 risk-off。",
      "可連接 Watchlist memory，判斷自己的觀察標的是否處於高波動環境。",
      "未來可延伸為 LINE Morning Intelligence 的摘要入口。",
    ],
  },
  {
    aiContext:
      "FCN 的風險不只在 coupon，而在 worst-of、KI buffer、波動率與市場 regime 的交互關係。IXAI 先用教育型 intelligence 幫助使用者理解風險語境。",
    category: "FCN Awareness",
    description: "教育型 FCN 風險意識分享頁，不包含個人化條款或投資建議。",
    icon: ShieldCheck,
    slug: "fcn-awareness",
    summary: "FCN worst-of exposure 需觀察高波動標的與 KI buffer。",
    title: "FCN Risk Awareness",
    whyItMatters: [
      "FCN 使用者常只看 coupon，忽略 worst-of 與 KI proximity。",
      "市場波動升高時，FCN 風險通常需要重新被整理與理解。",
      "未來 Pro layer 才會處理個人化 FCN monitoring。",
    ],
  },
  {
    aiContext:
      "Watchlist 不只是價格清單。當 AI 能理解使用者關注的標的、主題與風險偏好，Watchlist 會變成 daily intelligence relationship 的起點。",
    category: "Watchlist Intelligence",
    description: "展示 Watchlist memory 如何成為個人 intelligence layer 的起點。",
    icon: Brain,
    slug: "watchlist-preview",
    summary: "Watchlist memory 將根據使用者偏好建立個人 intelligence layer。",
    title: "Watchlist Intelligence Preview",
    whyItMatters: [
      "自選名單是個人市場關注的第一層資料。",
      "IXAI 會把 Watchlist 與 market context、macro risk、AI supply chain 連起來。",
      "未來可成為 Pro personalized intelligence 與 alert delivery 的基礎。",
    ],
  },
  {
    aiContext:
      "AI Risk Monitor 的核心不是預測市場，而是整理利率、美元、VIX、Crypto liquidity 與 AI supply chain 的交互壓力，協助使用者建立風險意識。",
    category: "AI Risk Monitor",
    description: "展示 IXAI 如何把多資產訊號整理成風險觀察。",
    icon: Radar,
    slug: "ai-risk-monitor",
    summary: "BTC / ETH 波動升高，crypto liquidity 進入 watch state。",
    title: "AI Risk Monitor",
    whyItMatters: [
      "高波動資產常是風險偏好改變的早期訊號。",
      "總經、科技股與 Crypto 彼此影響，需要被放在同一個 context 裡看。",
      "IXAI 的角色是 decision support，不是交易指令。",
    ],
  },
  {
    aiContext:
      "Morning Intelligence 是 IXAI daily habit loop 的入口。它將市場 regime、今日焦點、watchlist relevance 與 LINE delivery readiness 組成每日可讀的情報節奏。",
    category: "Morning Intelligence",
    description: "展示 IXAI 每日主動整理市場情報的產品方向。",
    icon: Sunrise,
    slug: "morning-intelligence",
    summary: "每天早上，把市場結構與今日風險焦點送到你面前。",
    title: "Morning Intelligence",
    whyItMatters: [
      "新使用者可以先理解 IXAI 的 daily intelligence habit loop。",
      "未來可連接 LINE opt-in delivery 與個人化 preference。",
      "Public 版本維持泛用情報；Pro 版本才會進一步個人化。",
    ],
  },
];

export function getShareIntelligenceItem(slug: string) {
  return SHARE_INTELLIGENCE_ITEMS.find((item) => item.slug === slug) ?? null;
}

export function buildShareIntelligenceUrl(slug: ShareIntelligenceSlug) {
  return `${ixaiSiteUrl}/share/intelligence/${slug}`;
}

export function buildShareIntelligenceCopy(item: ShareIntelligenceItem): ShareCopy {
  return {
    body: `${item.summary} 這是一張 IXAI intelligence share card，內容僅供市場資訊與風險觀察參考。`,
    hashtags: ["IXAI", "InvestmentIntelligence", "RiskAwareness"],
    title: `${item.title} — IXAI`,
    url: buildShareIntelligenceUrl(item.slug),
  };
}
