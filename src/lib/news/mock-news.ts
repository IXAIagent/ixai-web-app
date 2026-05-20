import type { NormalizedNewsItem } from "@/src/types/news";

const fetchedAt = "2026-05-20T08:20:00.000Z";

export const mockNewsItems: NormalizedNewsItem[] = [
  {
    id: "mock-rates-fed-yields-2026-05-20",
    title: "美債殖利率維持高檔，市場重新檢視降息時點",
    summary:
      "聯準會官員談話使利率路徑仍具不確定性，高估值科技股與風險資產需要重新檢查折現率壓力。",
    category: "rates",
    source: "ixai-mock",
    sourceLabel: "IXAI Mock Intake",
    publishedAt: "2026-05-20T07:52:00.000Z",
    fetchedAt,
  },
  {
    id: "mock-ai-nvidia-capex-2026-05-20",
    title: "AI 資本支出敘事延續，NVIDIA 仍是市場風險溫度計",
    summary:
      "大型雲端支出與晶片供應鏈能見度仍支撐 AI 主線，但資金集中度升高讓預期落差更敏感。",
    category: "ai_tech",
    source: "ixai-mock",
    sourceLabel: "IXAI Mock Intake",
    publishedAt: "2026-05-20T07:58:00.000Z",
    fetchedAt,
  },
  {
    id: "mock-crypto-liquidity-2026-05-20",
    title: "BTC 與 ETH 延續流動性敏感交易",
    summary:
      "數位資產仍像風險偏好的放大器，美元與實質利率若出現反向波動，短線 beta 可能被重新定價。",
    category: "crypto",
    source: "ixai-mock",
    sourceLabel: "IXAI Mock Intake",
    publishedAt: "2026-05-20T08:04:00.000Z",
    fetchedAt,
  },
  {
    id: "mock-equities-breadth-2026-05-20",
    title: "美股領漲結構偏窄，指數穩定但市場廣度尚未全面改善",
    summary:
      "SPY 與 QQQ 定價維持韌性，惟領漲集中在 AI 與大型科技，風險擴散仍需確認。",
    category: "equities",
    source: "ixai-mock",
    sourceLabel: "IXAI Mock Intake",
    publishedAt: "2026-05-20T08:08:00.000Z",
    fetchedAt,
  },
  {
    id: "mock-taiwan-semiconductor-2026-05-20",
    title: "台積電與半導體供應鏈維持市場主線，但需觀察估值與匯率壓力",
    summary:
      "台灣半導體仍受 AI 資本支出支撐，惟新台幣、外資流向與美股科技股波動會同步影響短線風險偏好。",
    category: "semiconductors",
    source: "ixai-mock",
    sourceLabel: "IXAI Mock Intake",
    publishedAt: "2026-05-20T08:10:00.000Z",
    fetchedAt,
  },
  {
    id: "mock-risk-regime-2026-05-20",
    title: "VIX 低位不等於風險消失，利率仍是今日主要壓力源",
    summary:
      "波動率回落提供 risk-on 表象，但若利率再度上行，AI、Crypto 與高 beta 資產可能同步回撤。",
    category: "risk",
    source: "ixai-mock",
    sourceLabel: "IXAI Mock Intake",
    publishedAt: "2026-05-20T08:12:00.000Z",
    fetchedAt,
  },
];
