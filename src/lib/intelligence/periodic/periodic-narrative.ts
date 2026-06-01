import type {
  PeriodicIntelligenceInput,
  PeriodicIntelligenceNarrative,
  PeriodicIntelligencePeriod,
} from "@/src/lib/intelligence/periodic/types";
import { buildIXAIInsight } from "@/src/lib/intelligence/insight";
import type { NormalizedNewsItem } from "@/src/types/news";

const PERIOD_LABEL: Record<PeriodicIntelligencePeriod, string> = {
  daily: "今日",
  monthly: "本月",
  weekly: "本週",
  yearly: "今年",
};

function clean(value?: string) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function clamp(value: string | undefined, fallback: string, maxLength = 110) {
  const normalized = clean(value) || fallback;

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clauses = normalized
    .split(/(?<=[。！？!?；;])|，|,/)
    .map((part) => part.trim())
    .filter(Boolean);
  let output = "";

  for (const clause of clauses) {
    const separator = /[。！？!?；;]$/.test(output) ? "" : "，";
    const next = output ? `${output}${separator}${clause}` : clause;
    if (next.length > maxLength) {
      break;
    }
    output = next;
  }

  return output || normalized.slice(0, maxLength);
}

function sentence(value: string | undefined, fallback: string, maxLength = 110) {
  const output = clamp(value, fallback, maxLength);
  return /[。！？!?]$/.test(output) ? output : `${output}。`;
}

function firstItem(items: NormalizedNewsItem[], pattern: RegExp) {
  return items.find((item) => pattern.test(`${item.category} ${item.title} ${item.summary ?? ""} ${item.tags?.join(" ") ?? ""}`));
}

function itemLabel(item?: NormalizedNewsItem) {
  if (!item) {
    return undefined;
  }

  return clamp(item.summary || item.title, item.title, 82);
}

function unique(items: string[]) {
  return Array.from(new Set(items.map(clean).filter(Boolean)));
}

function inferThemeItems(items: NormalizedNewsItem[]) {
  const raw = items.map((item) => `${item.category} ${item.title} ${item.summary ?? ""} ${item.tags?.join(" ") ?? ""}`).join(" ");
  const themes: string[] = [];

  if (/fed|fomc|rate|yield|treasury|inflation|cpi|pce|美元|利率|殖利率|通膨/i.test(raw)) {
    themes.push("rates / macro pricing");
  }
  if (/ai|nvidia|nvda|semiconductor|chip|cloud|software|台積|半導體|晶片|伺服器|企業軟體/i.test(raw)) {
    themes.push("AI / tech earnings power");
  }
  if (/taiwan|tsmc|台股|台積電|供應鏈|外資/i.test(raw)) {
    themes.push("Taiwan AI supply chain");
  }
  if (/bitcoin|btc|ethereum|eth|crypto|stablecoin|加密|比特幣|流動性/i.test(raw)) {
    themes.push("crypto liquidity");
  }
  if (/risk|volatility|vix|credit|geopolitic|波動|風險|地緣/i.test(raw)) {
    themes.push("risk regime");
  }
  if (/earnings|guidance|revenue|財報|法說|展望/i.test(raw)) {
    themes.push("earnings / guidance");
  }

  return themes.length ? themes : ["rates / macro pricing", "AI / tech earnings power", "risk regime"];
}

function categoryDiversity(items: NormalizedNewsItem[]) {
  return new Set(items.map((item) => item.category)).size;
}

export function buildPeriodicIntelligenceNarrative(
  input: PeriodicIntelligenceInput,
): PeriodicIntelligenceNarrative {
  const periodLabel = PERIOD_LABEL[input.period];
  const items = input.newsItems;
  const macro = firstItem(items, /fed|fomc|rate|yield|treasury|inflation|cpi|pce|美元|利率|殖利率|通膨/i);
  const ai = firstItem(items, /ai|nvidia|nvda|semiconductor|chip|cloud|software|台積|半導體|晶片|伺服器|企業軟體/i);
  const crypto = firstItem(items, /bitcoin|btc|ethereum|eth|crypto|stablecoin|加密|比特幣|流動性/i);
  const taiwan = firstItem(items, /taiwan|tsmc|台股|台積電|供應鏈|外資/i);
  const risk = firstItem(items, /risk|volatility|vix|credit|geopolitic|波動|風險|地緣/i);
  const earnings = firstItem(items, /earnings|guidance|revenue|財報|法說|展望/i);
  const dominantThemes = inferThemeItems(items).slice(0, 5);
  const risingThemes = unique([
    ai ? "AI / tech earnings power" : "",
    earnings ? "earnings / guidance" : "",
    taiwan ? "Taiwan AI supply chain" : "",
    crypto ? "crypto liquidity" : "",
  ]).slice(0, 3);
  const fadingThemes = unique(
    input.continuityContext?.tags?.filter((tag) => !dominantThemes.includes(tag)) ?? [],
  ).slice(0, 3);
  const primary = dominantThemes[0] ?? "rates / macro pricing";
  const secondary = dominantThemes[1] ?? "AI / tech earnings power";
  const upcoming = input.upcomingEvents?.[0];
  const diversity = categoryDiversity(items);
  const insight = buildIXAIInsight(input);

  const whatHappened = sentence(
    [
      macro ? `Macro：${itemLabel(macro)}` : "",
      ai ? `AI / Tech：${itemLabel(ai)}` : "",
      taiwan ? `Taiwan：${itemLabel(taiwan)}` : "",
      crypto ? `Crypto：${itemLabel(crypto)}` : "",
    ].filter(Boolean).join(" "),
    `${periodLabel}公開新聞訊號分散，IXAI 先以利率、AI 科技與風險偏好建立市場脈絡。`,
    180,
  );
  const whyItMatters = sentence(
    `${periodLabel}重點不是單一 headline，而是 ${primary} 與 ${secondary} 是否一起改變風險偏好。`,
    `${periodLabel}重點在市場是否重新定價利率、AI 成長與風險資產容錯率。`,
    140,
  );
  const whatChanged = sentence(
    input.continuityContext?.narrative
      ? `${periodLabel}相較前期，主要變化是 ${risingThemes[0] ?? primary} 是否接棒成為更明確的市場焦點。`
      : `${periodLabel}市場主線以 ${primary} 為核心，並觀察 ${secondary} 是否升溫或降溫。`,
    `${periodLabel}市場主線仍需觀察延續與轉向。`,
    150,
  );
  const whatToWatchNext = unique([
    upcoming ? `${upcoming.date}｜${upcoming.title}：${upcoming.whyItMatters}` : "",
    macro ? "觀察美債殖利率、美元與 Fed 訊號是否同向。" : "",
    ai ? "觀察 AI capex、企業軟體與半導體供應鏈是否同向。" : "",
    taiwan ? "觀察台股 AI 供應鏈外資與法說訊號。" : "",
    crypto ? "觀察 BTC / ETH 流動性與 ETF / stablecoin 相關訊號。" : "",
    risk ? "觀察波動率、信用壓力與市場廣度。" : "",
  ]).slice(0, 6);
  const mainNarrative = sentence(
    `${periodLabel}市場主線是 ${primary}，但真正需要判斷的是 ${secondary} 是否讓風險偏好擴散，或被利率與估值壓力限制。`,
    `${periodLabel}市場主線需要從新聞事件轉成跨市場定價脈絡。`,
    180,
  );
  const riskNarrative = sentence(
    risk
      ? `${periodLabel}最大風險在於 ${itemLabel(risk)}，這會影響高 beta 科技、Crypto 與 FCN worst-of 相關風險意識。`
      : `${periodLabel}風險不在單一事件，而在利率、美元、波動率與市場廣度是否同時惡化。`,
    `${periodLabel}風險敘事以波動率、利率與市場廣度為主。`,
    160,
  );
  const ixuanView = sentence(
    insight.questionDriven?.ixuanView ||
    insight.ixuanView ||
    `${periodLabel}一玄觀點：市場不是缺少資訊，而是需要判斷哪一條敘事正在被重新定價。${primary} 若延續，下一步要看 ${whatToWatchNext[0] ?? "利率、AI 與風險偏好是否同向"}。`,
    `${periodLabel}一玄觀點聚焦市場正在 pricing 什麼，而不是追逐單一新聞。`,
    190,
  );
  const socialHook = insight.questionDriven?.centralQuestion || insight.socialFunnel.hook;
  const socialConflict = sentence(
    insight.questionDriven?.keyAnswer ||
    insight.socialFunnel.conflict ||
    `${primary} 看似是主線，但 ${secondary} 與風險偏好正在拉扯市場方向。`,
    "主線存在，但風險約束也在升高。",
    86,
  );
  const socialPayoff = sentence(
    insight.questionDriven?.evidence[0] ||
    insight.socialFunnel.payoff ||
    `${periodLabel}完整 Brief 會把新聞拆成主線、風險與下一步觀察，而不是只列 headline。`,
    `${periodLabel}完整 Brief 已整理市場主線與風險脈絡。`,
    78,
  );
  const clearCTA = insight.socialFunnel.cta;

  return {
    clearCTA,
    dominantThemes,
    fadingThemes,
    ixuanView,
    mainNarrative,
    period: input.period,
    risingThemes,
    riskNarrative,
    socialConflict,
    socialHook,
    socialPayoff,
    sourceItemCount: items.length,
    whatChanged: diversity > 1 ? whatChanged : sentence(`${periodLabel}來源覆蓋仍有限，先以 ${primary} 建立保守市場脈絡。`, whatChanged),
    whatHappened,
    whatToWatchNext,
    whyItMatters,
  };
}
