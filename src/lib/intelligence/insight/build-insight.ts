import { buildSocialFunnel } from "@/src/lib/intelligence/insight/build-social-funnel";
import { extractInsightEvents } from "@/src/lib/intelligence/insight/extract-events";
import { extractMarketSignals } from "@/src/lib/intelligence/insight/extract-signals";
import type { IXAIInsightInput, IXAIInsightOutput } from "@/src/lib/intelligence/insight/types";

function sentence(value: string, fallback: string, maxLength = 180) {
  const normalized = (value || fallback)
    .replace(/\*\*/g, "")
    .replace(/Short Insight|Observation\s*\d+/gi, "")
    .replace(/相較前一份 Brief[，：:]?\s*/g, "")
    .replace(/相較最近\s*\d+\s*份 Daily Intelligence[，：:]?\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= maxLength) {
    return /[。！？!?]$/.test(normalized) ? normalized : `${normalized}。`;
  }

  const clauses = normalized
    .split(/(?<=[。！？!?；;])|，|,/)
    .map((part) => part.trim())
    .filter(Boolean);
  let output = "";

  for (const clause of clauses) {
    const next = output ? `${output}，${clause}` : clause;
    if (next.length > maxLength) {
      break;
    }
    output = next;
  }

  const resolved = output || normalized.slice(0, maxLength);
  return /[。！？!?]$/.test(resolved) ? resolved : `${resolved}。`;
}

function themesFromInput(input: IXAIInsightInput) {
  const raw = input.newsItems
    .map((item) => `${item.category} ${item.title} ${item.summary ?? ""} ${item.tags?.join(" ") ?? ""}`)
    .join(" ");
  const themes: string[] = [];

  if (/fed|rate|yield|treasury|dollar|inflation|利率|殖利率|美元|通膨/i.test(raw)) themes.push("利率 / 美元");
  if (/ai|nvidia|semiconductor|software|cloud|半導體|晶片|企業軟體|雲端/i.test(raw)) themes.push("AI / Tech");
  if (/taiwan|tsmc|台股|台積|供應鏈/i.test(raw)) themes.push("台灣 AI 供應鏈");
  if (/crypto|btc|eth|bitcoin|stablecoin|加密|流動性/i.test(raw)) themes.push("Crypto 流動性");
  if (/risk|vix|volatility|credit|波動|風險/i.test(raw)) themes.push("Risk Regime");

  return themes.length ? themes : ["利率 / 美元", "AI / Tech", "Risk Regime"];
}

function scopedNewsItems(input: IXAIInsightInput) {
  const datedItems = input.newsItems
    .map((item) => ({
      item,
      time: new Date(item.publishedAt).getTime(),
    }))
    .filter((entry) => Number.isFinite(entry.time));

  if (!datedItems.length) {
    return input.newsItems;
  }

  const latest = Math.max(...datedItems.map((entry) => entry.time));
  const windowMs = input.period === "weekly" ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 60 * 1000;
  const scoped = datedItems
    .filter((entry) => latest - entry.time <= windowMs)
    .map((entry) => entry.item);

  if (input.period === "weekly") {
    return scoped.length >= 8 ? scoped : input.newsItems;
  }

  return scoped.length >= 5 ? scoped : input.newsItems;
}

function buildNarrativeTension(input: IXAIInsightInput, themes: string[]) {
  const periodLabel = input.period === "weekly" ? "本週" : "今天";
  const primary = themes[0] ?? "利率 / 美元";
  const secondary = themes[1] ?? "AI / Tech";

  if (primary.includes("利率") && secondary.includes("AI")) {
    return `${periodLabel}的矛盾在於：AI 敘事仍有吸引力，但利率與估值壓力正在限制風險偏好的擴散。`;
  }

  if (primary.includes("AI")) {
    return `${periodLabel}的矛盾在於：AI 主線仍在，但市場需要確認它是擴散到更多產業，還是只停留在少數大型股。`;
  }

  return `${periodLabel}的矛盾在於：市場有局部催化，但風險偏好是否足以擴散仍需要更多確認。`;
}

function buildWhatChanged(input: IXAIInsightInput, themes: string[]) {
  const periodLabel = input.period === "weekly" ? "本週" : "今天";
  const priorThemes = input.continuityContext?.tags ?? [];
  const newTheme = themes.find((theme) => !priorThemes.includes(theme)) ?? themes[1] ?? themes[0] ?? "風險偏好";

  if (input.period === "weekly") {
    return `${periodLabel}變化不是 Daily 訊號的平均值，而是新聞與下週事件共同指向 ${newTheme} 是否成為新的觀察焦點。`;
  }

  return `${periodLabel}變化在於 ${newTheme} 的權重上升；若延續，市場主線會從單一 headline 轉向更完整的風險定價。`;
}

function buildWatchNext(input: IXAIInsightInput, themes: string[]) {
  const upcoming = input.upcomingEvents?.[0];

  if (upcoming) {
    return `${upcoming.date ? `${upcoming.date} ` : ""}${upcoming.title}：${upcoming.whyItMatters ?? "觀察它是否改變利率、AI 與風險偏好。"}。`;
  }

  if (themes.some((theme) => theme.includes("AI"))) {
    return "觀察 AI 資本支出、企業軟體需求與半導體供應鏈是否同向。";
  }

  return "觀察美債殖利率、美元、波動率與市場廣度是否同向。";
}

export function buildIXAIInsight(input: IXAIInsightInput): IXAIInsightOutput {
  const scopedInput = {
    ...input,
    newsItems: scopedNewsItems(input),
  };
  const keyEvents = extractInsightEvents(scopedInput.newsItems);
  const marketSignals = extractMarketSignals(keyEvents);
  const themes = themesFromInput(scopedInput);
  const periodLabel = input.period === "weekly" ? "本週" : "今天";
  const mainSignal = marketSignals[0]?.signal ?? `${periodLabel}市場仍在等待更明確訊號。`;
  const narrativeTension = buildNarrativeTension(input, themes);
  const whatChanged = buildWhatChanged(input, themes);
  const whatToWatchNext = buildWatchNext(input, themes);
  const whyItMatters = sentence(
    `${mainSignal} 這會影響資金願不願意承擔科技成長、Crypto 流動性與高 beta 風險。`,
    `${periodLabel}訊號會影響市場風險偏好與估值容錯率。`,
    170,
  );
  const ixuanView = sentence(
    `${periodLabel}一玄觀點：重點不是把新聞排成清單，而是找出事件背後的市場訊號。${narrativeTension}${whatToWatchNext}`,
    `${periodLabel}一玄觀點聚焦事件、訊號、風險與下一步觀察。`,
    220,
  );

  return {
    ixuanView,
    keyEvents,
    marketSignals,
    narrativeTension,
    socialFunnel: buildSocialFunnel({
      mainSignal,
      narrativeTension,
      period: input.period,
      whatToWatchNext,
    }),
    whatChanged,
    whatToWatchNext,
    whyItMatters,
  };
}
