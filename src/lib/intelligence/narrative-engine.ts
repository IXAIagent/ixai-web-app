import type { NormalizedNewsItem } from "@/src/types/news";
import {
  AI_MOMENTUM_LABELS,
  MACRO_PRESSURE_LABELS,
  MARKET_REGIME_LABELS,
  VOLATILITY_STATE_LABELS,
  inferMarketRegime,
  type MarketRegimeSnapshot,
} from "@/src/lib/intelligence/market-regime";

// v1.32 — Narrative Intelligence Engine.
//
// Turns selected headlines + curated upcoming events into a market
// strategist-style narrative bundle. The output is intentionally
// institutional / risk-first — no targets, no calls to action, no hype.
// Public surfaces (/weekly-brief, /daily-brief) consume this bundle to
// render narrative cards; personalized analysis remains in IXAI Pro.

export type NarrativeImportance = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type RankedHeadline = {
  title: string;
  source: string;
  category: string;
  importance: NarrativeImportance;
  importanceReason: string;
  publishedAt?: string;
};

export type CrossMarketLink = {
  from: string;
  to: string;
  note: string;
};

export type NarrativeBundle = {
  marketNarrative: string;
  pricingWhat: string[];
  riskFocus: string;
  crossMarketNarrative: string;
  crossMarketLinks: CrossMarketLink[];
  volatilityNarrative: string;
  aiNarrative: string;
  taiwanNarrative: string;
  intelligenceTakeaway: string;
  regime: MarketRegimeSnapshot;
  importanceRanking: RankedHeadline[];
};

export type NarrativeUpcomingEvent = {
  date: string;
  title: string;
  category:
    | "fed_rates"
    | "macro_data"
    | "us_earnings"
    | "taiwan_event"
    | "crypto_event"
    | "geopolitics";
  whyItMatters: string;
  relatedAssets: string[];
};

const HIGH_IMPORTANCE_PATTERN =
  /\b(fomc|fed (?:decision|minutes)|cpi|pce|nfp|payroll|gdp|nvda|nvidia|tsmc|台積)\b/i;
const MEDIUM_HIGH_IMPORTANCE_PATTERN =
  /\b(earnings|guidance|capex|hyperscaler|broadcom|avgo|micron|amd|hbm|cowos)\b|台股|半導體/i;
const MEDIUM_IMPORTANCE_PATTERN =
  /\b(stocks|equities|yields?|treasury|tariff|powell|inflation|jobs)\b|關稅|通膨|利率/i;
const LOW_IMPORTANCE_PATTERN = /\b(bitcoin|btc|crypto|ethereum)\b|比特幣|加密/i;

function scoreItem(item: NormalizedNewsItem): {
  importance: NarrativeImportance;
  reason: string;
} {
  const haystack = `${item.title} ${item.summary ?? ""}`;

  if (HIGH_IMPORTANCE_PATTERN.test(haystack)) {
    return {
      importance: 10,
      reason: "全球風險資產 pricing 主導變數（Fed / 通膨 / NVDA / TSMC）。",
    };
  }

  if (MEDIUM_HIGH_IMPORTANCE_PATTERN.test(haystack)) {
    return {
      importance: 7,
      reason: "影響 AI capex 與半導體供應鏈定價的關鍵訊號。",
    };
  }

  if (MEDIUM_IMPORTANCE_PATTERN.test(haystack)) {
    return {
      importance: 5,
      reason: "影響利率、美元與美股風險資產的折現率。",
    };
  }

  if (LOW_IMPORTANCE_PATTERN.test(haystack)) {
    return {
      importance: 3,
      reason: "Crypto 與槓桿情緒輔助訊號，非本週主導因素。",
    };
  }

  return {
    importance: 2,
    reason: "一般市場訊號；未觸碰主要 pricing 因子。",
  };
}

export function rankHeadlinesByImportance(items: NormalizedNewsItem[]): RankedHeadline[] {
  const ranked = items.map((item) => {
    const { importance, reason } = scoreItem(item);

    return {
      title: item.title,
      source: item.sourceLabel,
      category: item.category,
      importance,
      importanceReason: reason,
      publishedAt: item.publishedAt,
    } satisfies RankedHeadline;
  });

  // Stable sort by importance desc, then by recency.
  ranked.sort((a, b) => {
    if (b.importance !== a.importance) {
      return b.importance - a.importance;
    }

    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bTime - aTime;
  });

  // Cap per category so the top of the list does not become a single-theme
  // wall (e.g. 7 NVDA headlines crowding out everything else).
  const perCategoryCap = 3;
  const counts = new Map<string, number>();
  const limited: RankedHeadline[] = [];

  for (const headline of ranked) {
    const count = counts.get(headline.category) ?? 0;
    if (count >= perCategoryCap) {
      continue;
    }

    counts.set(headline.category, count + 1);
    limited.push(headline);

    if (limited.length >= 12) {
      break;
    }
  }

  return limited;
}

function selectFirstTitle(items: NormalizedNewsItem[]): string | undefined {
  return items[0]?.title;
}

function buildCrossMarketLinks(
  regime: MarketRegimeSnapshot,
  upcoming: NarrativeUpcomingEvent[],
): CrossMarketLink[] {
  const links: CrossMarketLink[] = [];

  // Fed → USD → AI beta → Taiwan semis → Crypto → FCN volatility
  const fedEvent = upcoming.find(
    (event) => event.category === "fed_rates" || event.category === "macro_data",
  );

  links.push({
    from: "Fed / 利率",
    to: "USD 強弱",
    note:
      regime.macroPressure === "high"
        ? "鷹派訊號偏多，美元維持高位，壓抑非美資產與 Crypto 風險偏好。"
        : regime.macroPressure === "low"
          ? "鴿派訊號累積，美元承壓，有利成長股、台股 AI 與 Crypto。"
          : "Fed 路徑尚未明確；美元維持區間，跨市場資金尚未轉向。",
  });

  links.push({
    from: "USD 強弱",
    to: "US AI beta (NVDA / QQQ)",
    note:
      regime.aiMomentum === "strong"
        ? "AI capex 韌性 + 美元未過度走強 → AI beta 估值仍可被資金延續。"
        : regime.aiMomentum === "weak"
          ? "若 AI 訂單能見度下修，AI beta 估值會率先承壓。"
          : "AI 主線需配合利率與 capex 兩端驗證；單一變數不足以反轉。",
  });

  links.push({
    from: "US AI beta",
    to: "Taiwan semis (2330 / AVGO 供應鏈)",
    note:
      "台積電與 AI server 供應鏈是全球 AI trade 的映射；美股 AI 強弱會在 24 小時內 read-across 到台股。",
  });

  links.push({
    from: "Taiwan semis",
    to: "Crypto risk appetite",
    note:
      regime.regime === "risk_on"
        ? "Risk-on 擴散時，Crypto 通常跟隨高 beta 科技股；資金擴散有利槓桿情緒。"
        : regime.regime === "risk_off"
          ? "Risk-off 階段 Crypto 先被去槓桿，BTC / ETH 流動性敏感度上升。"
          : "Crypto 仍是輔助觀察；其波動方向不主導台股 AI。",
  });

  links.push({
    from: "Cross-market 結果",
    to: "FCN 波動率脈絡",
    note:
      regime.volatilityState === "stressed"
        ? "波動率升高直接拉近 worst-of 到 KI 的距離；FCN 教育角度需強化監控敘事。"
        : regime.volatilityState === "compressed"
          ? "波動率壓縮會讓 FCN coupon 看似吸引力高；需注意這是定價結果，不是低風險訊號。"
          : "波動率維持正常區間；FCN worst-of 仍取決於籃子集中度。",
  });

  if (fedEvent) {
    links.push({
      from: `下週 ${fedEvent.title}（${fedEvent.date}）`,
      to: "整條 cross-market 鏈",
      note: `${fedEvent.whyItMatters}（影響資產：${fedEvent.relatedAssets.join(" / ")}）`,
    });
  }

  return links;
}

export function buildNarrativeBundle({
  items,
  upcomingEvents,
  pastTopByCategory,
}: {
  items: NormalizedNewsItem[];
  upcomingEvents: NarrativeUpcomingEvent[];
  pastTopByCategory: {
    fedMacro?: NormalizedNewsItem;
    aiSemi?: NormalizedNewsItem;
    taiwan?: NormalizedNewsItem;
    crypto?: NormalizedNewsItem;
    usEquities?: NormalizedNewsItem;
    earnings?: NormalizedNewsItem;
  };
}): NarrativeBundle {
  const regime = inferMarketRegime(items);
  const importanceRanking = rankHeadlinesByImportance(items);

  const pricingWhat: string[] = [];
  if (regime.aiMomentum === "strong") {
    pricingWhat.push("AI capex sustainability — 雲端業者資本支出能否延續下半年訂單能見度。");
  } else if (regime.aiMomentum === "weak") {
    pricingWhat.push("AI capex sustainability — 訂單能見度下修風險開始被市場 pricing。");
  } else {
    pricingWhat.push("AI capex sustainability — 市場仍在等待下一波 guidance 驗證 capex 延續性。");
  }

  if (regime.macroPressure === "high") {
    pricingWhat.push("Fed higher-for-longer — 殖利率與美元壓力延續，壓抑成長股估值。");
  } else if (regime.macroPressure === "low") {
    pricingWhat.push("Fed easing path — 降息預期累積，成長股折現率改善。");
  } else {
    pricingWhat.push("Fed path uncertainty — 通膨與就業數據尚未給出單一方向。");
  }

  pricingWhat.push("Taiwan AI export cycle — 台積電與 AI server 供應鏈訂單兌現節奏。");
  pricingWhat.push(
    regime.regime === "risk_on"
      ? "USD liquidity — 美元未過度走強，跨市場流動性偏寬鬆。"
      : regime.regime === "risk_off"
        ? "USD liquidity — 美元偏強，非美資產與 Crypto 承壓。"
        : "USD liquidity — 美元維持區間，跨資產資金尚未集中。",
  );
  pricingWhat.push(
    regime.volatilityState === "compressed"
      ? "Volatility compression — 低 VIX 環境下市場樂觀，但 tail risk 並未消失。"
      : regime.volatilityState === "stressed"
        ? "Volatility expansion — 波動率升高，去槓桿壓力擴散至高 beta 資產。"
        : "Volatility regime — 波動率維持正常區間。",
  );

  const fedTitle = selectFirstTitle(
    pastTopByCategory.fedMacro ? [pastTopByCategory.fedMacro] : [],
  );
  const aiTitle = selectFirstTitle(
    pastTopByCategory.aiSemi ? [pastTopByCategory.aiSemi] : [],
  );
  const taiwanTitle = selectFirstTitle(
    pastTopByCategory.taiwan ? [pastTopByCategory.taiwan] : [],
  );

  const marketNarrative = [
    `IXAI 觀察本週市場 regime：${MARKET_REGIME_LABELS[regime.regime]}（AI Momentum ${AI_MOMENTUM_LABELS[regime.aiMomentum]} · Macro Pressure ${MACRO_PRESSURE_LABELS[regime.macroPressure]} · Volatility ${VOLATILITY_STATE_LABELS[regime.volatilityState]}）。`,
    fedTitle
      ? `利率端：「${fedTitle}」是本週 Fed / macro 主要訊號，直接影響美元、殖利率與美股估值折現率。`
      : "利率端：本週缺乏主導性的 Fed / macro 事件，市場仍在等待下一個明確訊號。",
    aiTitle
      ? `AI 端：「${aiTitle}」反映 capex 與半導體供應鏈節奏；台股 AI 鏈會在 24 小時內讀取此訊號。`
      : "AI 端：本週 AI capex 訊號不集中，市場仍在等待下一輪 hyperscaler guidance。",
    taiwanTitle
      ? `台股端：「${taiwanTitle}」是本週台股 AI 供應鏈的代表訊號，與外資配置同步觀察。`
      : "台股端：本週台股缺乏單一主導訊號；外資資金流與法說節奏是主要觀察軸。",
  ].join(" ");

  const riskFocus =
    regime.regime === "risk_off"
      ? `風險焦點：${regime.signals.riskOff[0] ?? "波動率升高"}。Risk-off 階段，跨資產去槓桿壓力會率先打到高 beta AI 與 Crypto。`
      : regime.macroPressure === "high"
        ? `風險焦點：${regime.signals.macro[0] ?? "Fed higher-for-longer"} 仍是科技股估值的主要折現變數，殖利率與美元同步走強會放大壓力。`
        : `風險焦點：本週主動性風險訊號偏少；下一個 Fed / earnings event 是定價反轉的觸發點。`;

  const crossMarketLinks = buildCrossMarketLinks(regime, upcomingEvents);
  const crossMarketNarrative = `從 ${crossMarketLinks
    .slice(0, 4)
    .map((link) => link.from)
    .join(" → ")} → ${crossMarketLinks[crossMarketLinks.length - 1]?.to ?? "整體風險偏好"}：${crossMarketLinks[0]?.note ?? ""}`;

  const volatilityNarrative =
    regime.volatilityState === "stressed"
      ? "波動率敘事：VIX 升高 + 強迫去槓桿訊號 → 高 beta AI、Crypto、FCN worst-of 同時承壓。教育角度提醒，FCN worst-of 距離 KI 會被波動率非線性拉近。"
      : regime.volatilityState === "compressed"
        ? "波動率敘事：VIX 壓縮 → coupon 結構商品定價變得「便宜」是錯覺；波動率低不等於風險低。FCN 教育角度需強調 worst-of 集中度。"
        : "波動率敘事：波動率維持正常區間，沒有單一觸發訊號；觀察 VIX 是否同時與美元、殖利率共振。";

  const aiNarrative =
    regime.aiMomentum === "strong"
      ? "AI 敘事：hyperscaler capex 仍延續；AI server / HBM / 先進製程供應鏈訂單能見度是 read-across 的核心。"
      : regime.aiMomentum === "weak"
        ? "AI 敘事：訂單能見度開始被質疑；NVDA / AVGO / MU 下一輪 guidance 是 inflection 觀察點。"
        : "AI 敘事：市場仍在等待下一輪 hyperscaler guidance；AI capex 趨勢未變但需驗證。";

  const taiwanNarrative = taiwanTitle
    ? `台股 AI 敘事：「${taiwanTitle}」與 TSMC / 廣達 / 緯創 / 緯穎 / 奇鋐供應鏈節奏一致；外資權重 + 法說展望是定價核心。`
    : "台股 AI 敘事：缺乏單一主導訊號；外資資金流、TSMC 月營收與法說窗口仍是觀察主軸。";

  const intelligenceTakeaway =
    `IXAI takeaway：在 ${MARKET_REGIME_LABELS[regime.regime]} 環境下，` +
    (regime.aiMomentum === "strong" ? "AI 主線仍具支撐力" : regime.aiMomentum === "weak" ? "AI 主線估值容錯率降低" : "AI 主線仍待驗證") +
    "；下一個 Fed / earnings event 是市場定價的重新校準節點，IXAI 不提供買賣建議。";

  return {
    marketNarrative,
    pricingWhat,
    riskFocus,
    crossMarketNarrative,
    crossMarketLinks,
    volatilityNarrative,
    aiNarrative,
    taiwanNarrative,
    intelligenceTakeaway,
    regime,
    importanceRanking,
  };
}
