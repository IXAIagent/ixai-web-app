import type { DailyBriefDraft } from "@/src/types/editorial";

const timestamp = "2026-05-19T08:00:00.000Z";

export const mockGeneratedDrafts: DailyBriefDraft[] = [
  {
    id: "draft-2026-05-20-market-intelligence",
    slug: "2026-05-20-market-intelligence",
    status: "review",
    title: "美債利率維持定價核心，AI 與 Crypto 風險偏好分化",
    marketSummary:
      "市場仍以美債殖利率與聯準會官員談話作為估值錨點。AI 科技股維持資金集中，但 NVIDIA 與半導體供應鏈需要觀察財報與資本支出指引；BTC、ETH 則呈現流動性敏感的高 beta 結構。",
    editorialNote:
      "本日重點不是追逐單一價格變動，而是確認資金是否仍願意承擔久期、AI 成長與 Crypto 波動三種風險。",
    sections: [
      {
        category: "rates",
        headline: "美債殖利率仍是風險資產的第一層定價變數。",
        summary:
          "聯準會官員談話使市場重新檢視降息時點，長端殖利率若維持高檔，將壓抑高估值資產的擴張空間。",
        ixaiView:
          "需要觀察的是利率波動是否開始影響信用利差與股票領漲廣度，而不只是單日殖利率方向。",
      },
      {
        category: "ai_market",
        headline: "AI 科技股主線仍在，但資金集中度偏高。",
        summary:
          "NVIDIA 仍是 AI capex 週期的核心觀察標的，雲端資本支出與半導體供應鏈能見度將影響整體風險偏好。",
        ixaiView:
          "AI 主線沒有消失，但估值容錯率下降。更適合用供應鏈與現金流品質檢查，而不是用敘事追價。",
      },
      {
        category: "crypto",
        headline: "BTC / ETH 反映流動性預期與風險偏好變化。",
        summary:
          "數位資產短線仍容易受美元、實質利率與 ETF 資金流影響，波動可能領先傳統高 beta 資產。",
        ixaiView:
          "Crypto 應被視為流動性敏感資產，而非獨立於總經之外的行情。",
      },
      {
        category: "taiwan_market",
        headline: "台積電與半導體仍是台股風險溫度計。",
        summary:
          "台股結構仍與 AI 供應鏈、外資配置和匯率高度相關，權值股若量能轉弱，指數韌性可能下降。",
        ixaiView:
          "觀察台積電不只是看價格，而是看半導體鏈是否仍能支撐台股評價與資金流。",
      },
    ],
    riskFocus: [
      "美債殖利率上行造成高估值科技股壓力。",
      "NVIDIA 財報前後的預期落差。",
      "BTC / ETH 對流動性訊號的放大反應。",
      "台股半導體權值股集中度風險。",
    ],
    publishedAt: undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];
