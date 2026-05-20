import type { DailyBriefDraft, DailyIntelligenceDraft } from "@/src/types/editorial";
import type { NormalizedNewsItem } from "@/src/types/news";

function byCategory(items: NormalizedNewsItem[], category: string) {
  return items.find((item) => item.category === category);
}

function nowIso() {
  return new Date().toISOString();
}

function minutesAgoLabel(minutes: number) {
  return `Updated ${minutes} mins ago`;
}

export function generateDailyIntelligenceFromNews(
  newsItems: NormalizedNewsItem[],
): DailyIntelligenceDraft {
  const rates = byCategory(newsItems, "Rates");
  const ai = byCategory(newsItems, "AI / Tech");
  const crypto = byCategory(newsItems, "Crypto");
  const equities = byCategory(newsItems, "Equities");
  const risk = byCategory(newsItems, "Risk");
  const generatedAt = nowIso();

  return {
    todayHeadline: "利率仍是定價核心，AI 與 Crypto 風險偏好需要重新校準",
    riskFocus: {
      label: "IXAI Risk Focus",
      title: risk?.title ?? "今日最大風險是忽略利率對風險資產的再定價速度。",
      summary:
        risk?.summary ??
        "市場表面風險偏好改善，但利率若再度上行，高 beta 資產可能同步回撤。",
      updatedLabel: minutesAgoLabel(6),
    },
    feedItems: [
      rates,
      ai,
      crypto,
      equities,
    ]
      .filter((item): item is NormalizedNewsItem => Boolean(item))
      .map((item, index) => ({
        category: item.category,
        title: item.title,
        summary: item.summary ?? "IXAI intake captured this market item for editorial review.",
        updatedLabel: minutesAgoLabel(8 + index * 4),
      })),
    marketRegimeNote:
      "Risk-on 表象仍在，但不是全面擴散。IXAI 會先追蹤利率、美元、VIX 與 AI 領漲廣度是否一致。",
    marketRegime: "mixed",
    aiTechObservation:
      ai?.summary ??
      "AI 主線仍受資本支出與供應鏈能見度支撐，但估值容錯率下降。",
    cryptoObservation:
      crypto?.summary ??
      "Crypto 仍是流動性敏感資產，對美元與實質利率變化反應較快。",
    whatToMonitor: [
      "美債長端殖利率是否重新上行",
      "NVIDIA 與 AI 供應鏈是否維持領漲廣度",
      "BTC / ETH 是否同步反映風險偏好",
      "VIX 低位是否掩蓋資產集中度風險",
    ],
    sessionLabel: "Asia Session",
    generatedAt,
  };
}

export async function generateDailyIntelligenceDraft(): Promise<DailyBriefDraft> {
  return generateDailyIntelligenceDraftFromNews([]);
}

export function generateDailyIntelligenceDraftFromNews(
  newsItems: NormalizedNewsItem[],
): DailyBriefDraft {
  const intelligence = generateDailyIntelligenceFromNews(newsItems);
  const now = nowIso();
  const slug = `daily-intelligence-${now.slice(0, 10)}`;

  return {
    id: `generated-${slug}`,
    slug,
    status: "review",
    title: intelligence.todayHeadline,
    marketSummary:
      "IXAI 根據今日 intake layer 的市場訊號，整理利率、AI 科技、Crypto 與美股廣度的風險脈絡。這是一份待編輯審核的 daily intelligence draft。",
    editorialNote: intelligence.marketRegimeNote,
    sections: [
      {
        category: "rates",
        headline: "利率仍是今日風險資產的定價核心。",
        summary:
          byCategory(newsItems, "Rates")?.summary ??
          "長端殖利率若維持高檔，高估值科技股與風險資產仍需重新定價。",
        ixaiView:
          "IXAI 先觀察利率是否影響股票領漲廣度與 Crypto beta，而不是只看單一資產方向。",
      },
      {
        category: "ai_market",
        headline: "AI 主線延續，但資金集中度仍是風險來源。",
        summary: intelligence.aiTechObservation,
        ixaiView:
          "AI 並非單純追價敘事，需要用資本支出、供應鏈能見度與估值容錯率共同檢查。",
      },
      {
        category: "crypto",
        headline: "BTC / ETH 仍反映流動性與風險偏好。",
        summary: intelligence.cryptoObservation,
        ixaiView:
          "Crypto 應被視為市場流動性的敏感指標，而不是與總經無關的獨立行情。",
      },
      {
        category: "us_market",
        headline: "美股指數穩定，但市場廣度仍需確認。",
        summary:
          byCategory(newsItems, "Equities")?.summary ??
          "指數層面維持韌性，但領漲集中度提高會放大回撤風險。",
        ixaiView:
          "若 SPY、QQQ 與 VIX 訊號分歧，應降低對單一 risk-on 敘事的依賴。",
      },
    ],
    riskFocus: intelligence.whatToMonitor,
    intelligence,
    createdAt: now,
    updatedAt: now,
  };
}
