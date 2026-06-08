import type { DailyBriefDraft, WeeklyIntelligenceDraft } from "@/src/types/editorial";
import { getDailyIntelligenceCoreFromBrief } from "@/src/lib/intelligence/core";

type EvidenceSource = {
  category?: string;
  event: string;
  source?: string;
  whyItMatters: string;
};

export type StrategistEvidenceItem = {
  label: string;
  whatHappened: string;
  whyItMatters: string;
  whatChangesMyMind: string;
};

export type SocialRiskRegimeExtraction = {
  state: string;
  trigger: string;
};

export type DailySocialIntelligenceExtraction = {
  centralQuestion: string;
  coreThesis: string;
  keyAnswer: string;
  evidenceItems: StrategistEvidenceItem[];
  counterEvidenceItems: string[];
  watchNextItems: string[];
  riskRegime: SocialRiskRegimeExtraction;
  fcnTranslation: string;
  iXuanViewAngle: string;
};

export type WeeklyCrossMarketChainItem = {
  label: "Fed / Rates" | "USD" | "AI Beta" | "Taiwan Semis" | "Crypto" | "FCN Volatility";
  narrative: string;
};

export type WeeklySocialIntelligenceExtraction = {
  centralQuestion: string;
  coreThesis: string;
  weeklyChange: string;
  crossMarketChain: WeeklyCrossMarketChainItem[];
  evidenceItems: StrategistEvidenceItem[];
  nextWeekCatalysts: string[];
  aiEarningsPowerSignal: string;
  fcnTranslation: string;
  iXuanWeeklyViewAngle: string;
};

const CONCRETE_ANCHOR =
  /FOMC|Powell|Fed|CPI|PCE|NFP|Treasury|yield|USD|DXY|SPY|QQQ|NVDA|NVIDIA|TSMC|2330|台積|台股|半導體|AI|capex|guidance|earnings|cloud|data center|BTC|ETH|ETF|FCN|KO|KI|Worst-of|worst-of|volatility|basket|利率|美元|殖利率|通膨|財報|法說|指引|資本支出|雲端|資料中心|供應鏈|外資|融資|波動|籃子|觀察日|標的/i;

function clean(value?: string) {
  return (value ?? "")
    .replace(/\*\*/g, "")
    .replace(/…/g, "")
    .replace(/Market Pulse\s*\/\s*Market Pulse/gi, "")
    .replace(/本週市場重點在事件下週催化/g, "")
    .replace(/這不是新聞數量，而是市場定價正在改變。?/g, "")
    .replace(/台股暴跌上千點免驚[！!]?/g, "台股急跌後，資金需要重新檢查風險承接。")
    .replace(/\s+/g, " ")
    .trim();
}

function hasConcreteAnchor(value?: string) {
  return Boolean(value && CONCRETE_ANCHOR.test(value));
}

function comparable(value?: string) {
  return clean(value)
    .toLowerCase()
    .replace(/[｜:：，。！？!?\s]/g, "")
    .trim();
}

function isSimilarSentence(a?: string, b?: string) {
  const left = comparable(a);
  const right = comparable(b);

  if (!left || !right) return false;
  if (left === right) return true;

  const shorter = left.length < right.length ? left : right;
  const longer = left.length < right.length ? right : left;

  return shorter.length >= 18 && longer.includes(shorter);
}

function anchored(value: string | undefined, fallback: string, maxLength = 92) {
  const candidate = clean(value);
  const output = hasConcreteAnchor(candidate) ? candidate : fallback;

  if (output.length <= maxLength) {
    return output;
  }

  const parts = output
    .split(/(?<=[。！？.!?；;])|\s[|]\s|，|,/)
    .map((part) => part.trim())
    .filter(Boolean);
  let result = "";

  for (const part of parts) {
    const next = result ? `${result}，${part}` : part;
    if (next.length > maxLength) break;
    result = next;
  }

  return result || fallback;
}

function uniqueItems(items: Array<string | undefined | null>, fallbacks: string[], count = 3) {
  const output: string[] = [];

  for (const item of [...items, ...fallbacks]) {
    const normalized = anchored(item ?? undefined, "", 96);
    if (!normalized || normalized.length < 8) continue;
    if (output.some((existing) => existing === normalized)) continue;
    output.push(normalized);
    if (output.length >= count) break;
  }

  return output;
}

function evidenceByPattern(evidence: EvidenceSource[], pattern: RegExp) {
  return (
    evidence.find((item) => pattern.test(`${item.category ?? ""} ${item.event} ${item.source ?? ""}`)) ??
    evidence.find((item) => pattern.test(`${item.category ?? ""} ${item.event} ${item.whyItMatters} ${item.source ?? ""}`))
  );
}

function dailySectionText(source: DailyBriefDraft | null | undefined, pattern: RegExp) {
  const section =
    source?.sections.find((item) => pattern.test(`${item.category} ${item.headline}`)) ??
    source?.sections.find((item) => pattern.test(`${item.category} ${item.headline} ${item.summary} ${item.ixaiView ?? ""}`));
  return section ? `${section.headline}：${section.summary}` : undefined;
}

function dailySubject(evidence?: EvidenceSource) {
  const value = evidence?.event ?? "";
  if (/TSMC|台積|2330|半導體/i.test(value)) return "台積電與半導體供應鏈";
  if (/NVIDIA|NVDA|AI|Meta|Oracle|cloud|capex|guidance/i.test(value)) return "AI earnings / guidance";
  if (/Fed|Powell|CPI|PCE|Treasury|yield|利率|美元/i.test(value)) return "Fed / USD 定價";
  if (/BTC|ETH|Crypto|加密/i.test(value)) return "BTC / ETH 風險承接";
  return "今日市場主線";
}

function strategistEvidence(
  label: string,
  source: string | undefined,
  whyFallback: string,
  mindFallback: string,
): StrategistEvidenceItem {
  const whatHappened = anchored(source, whyFallback);
  const whyItMattersCandidate = anchored(undefined, whyFallback);
  const whyItMatters = isSimilarSentence(whatHappened, whyItMattersCandidate)
    ? anchored(undefined, mindFallback)
    : whyItMattersCandidate;
  const whatChangesMyMind = isSimilarSentence(whyItMatters, mindFallback)
    ? anchored(undefined, "若關鍵事件、資金流與波動條件沒有同向驗證，市場主線需要重新檢查。")
    : anchored(undefined, mindFallback);

  return {
    label,
    whatHappened,
    whyItMatters,
    whatChangesMyMind,
  };
}

export function extractDailySocialIntelligence(source?: DailyBriefDraft | null): DailySocialIntelligenceExtraction {
  const core = source ? getDailyIntelligenceCoreFromBrief(source) : null;
  const insight = source?.intelligence?.insight;
  const questionDriven = insight?.questionDriven;
  const evidence = (questionDriven?.evidenceDetails ?? []) as EvidenceSource[];
  const macro = evidenceByPattern(evidence, /macro|rates|fed|yield|利率|美元|通膨|殖利率/i);
  const ai = evidenceByPattern(evidence, /ai|tech|semiconductor|NVDA|NVIDIA|TSMC|台積|半導體|雲端|capex|guidance|AI/i);
  const taiwanCrypto = evidenceByPattern(evidence, /taiwan|crypto|BTC|ETH|台股|台灣|加密/i);
  const subject = dailySubject(evidence[0]);
  const centralQuestion = anchored(
    questionDriven?.centralQuestion ?? source?.title,
    `${subject}，今天市場到底在交易什麼？`,
    42,
  );
  const coreThesis = anchored(
    questionDriven?.keyAnswer ?? insight?.socialFunnel.payoff ?? core?.conversionHook,
    "市場不是只看題材，而是在檢查 Fed / USD、AI guidance、台股半導體與 BTC / ETH 是否同向支持風險承接。",
    96,
  );
  const evidenceItems = [
    strategistEvidence(
      "Macro",
      macro?.event ?? source?.intelligence?.macroWatch?.whatHappened ?? source?.intelligence?.macroWatch?.marketMeaning ?? dailySectionText(source, /rates|macro|利率|美元|美股|總經/i),
      "Fed / USD 與利率變化會先改變 SPY、QQQ、BTC 與台股半導體的估值容錯率。",
      "若 Powell / CPI / PCE 讓美元與殖利率同步降溫，風險承接才會改善。",
    ),
    strategistEvidence(
      "AI-Tech",
      ai?.event ?? source?.intelligence?.aiTechWatch?.observations?.[0] ?? source?.intelligence?.aiTechObservation,
      "AI earnings、guidance、capex 與 cloud demand 是檢查 AI beta 能否延續的證據。",
      "若 NVDA / 台積電 / cloud capex 沒有同步上修，AI beta 可能只剩少數大型股撐盤。",
    ),
    strategistEvidence(
      "Taiwan-Crypto",
      taiwanCrypto?.event ?? dailySectionText(source, /taiwan|crypto|台股|BTC|ETH/i) ?? source?.intelligence?.cryptoObservation,
      "台股半導體與 BTC / ETH 同時反映全球風險偏好是否願意承接高 beta。",
      "若 2330 / 台股外資與 BTC / ETH 不再同向，市場主線需要重新驗證。",
    ),
  ];
  const riskState = source?.intelligence?.riskRegimeReasoning?.current ?? "Elevated";
  const riskTrigger = anchored(
    source?.intelligence?.riskRegimeReasoning?.reasons?.[0] ?? questionDriven?.counterEvidence?.[0],
    "Fed / USD 壓力若升高，AI beta、台股半導體、BTC / ETH 與 FCN worst-of 容錯率會同步下降。",
  );
  const fcnTranslation = anchored(
    `${source?.intelligence?.fcnAwareness?.topic ?? "KO / KI"}：${riskTrigger} ${source?.intelligence?.fcnAwareness?.reminder ?? ""}`,
    "把今日市場事件翻譯到 FCN：觀察 worst-of basket pressure、波動、KO 條件、KI risk awareness 與籃子集中敏感度。",
    110,
  );
  const watchNextItems = uniqueItems(
    [
      ...(questionDriven?.watchNext ?? []),
      ...(source?.intelligence?.investorWatchpoints ?? []),
      source?.intelligence?.macroWatch?.marketMeaning,
      source?.intelligence?.aiTechWatch?.observations?.[0],
      source?.intelligence?.cryptoWatch?.observations?.[0],
    ],
    [
      "24 小時內觀察 Fed / USD 是否繼續壓抑 QQQ、台股半導體與 BTC。",
      "48 小時內觀察 AI guidance、cloud capex 與台積電供應鏈是否同向。",
      "72 小時內觀察 BTC / ETH 與 FCN worst-of basket volatility 是否惡化。",
    ],
  );
  const iXuanViewAngle = anchored(
    questionDriven?.ixuanView ?? source?.intelligence?.ixuanView ?? source?.editorialNote,
    `一玄觀點：今天先看 ${subject} 是否能被 Fed / USD、AI guidance、台股半導體與 BTC / ETH 同步驗證，再把波動翻譯成 FCN worst-of、KO / KI 與籃子集中風險。`,
    150,
  );

  return {
    centralQuestion,
    coreThesis,
    keyAnswer: coreThesis,
    evidenceItems,
    counterEvidenceItems: uniqueItems(
      [questionDriven?.counterEvidence?.[0], insight?.narrativeTension],
      ["若美元與殖利率同步走高，AI beta、台股半導體與 BTC / ETH 的容錯率會下降。"],
      2,
    ),
    watchNextItems,
    riskRegime: {
      state: riskState,
      trigger: riskTrigger,
    },
    fcnTranslation,
    iXuanViewAngle,
  };
}

function weeklyEvent(source: WeeklyIntelligenceDraft | null | undefined, pattern: RegExp) {
  const events = source?.sections.majorEvents ?? [];

  return (
    events.find((event) => pattern.test(`${event.label} ${event.title}`)) ??
    events.find((event) => pattern.test(`${event.label} ${event.title} ${event.whyItMatters}`))
  );
}

function eventLine(event?: { label?: string; title?: string; whyItMatters?: string }) {
  return event ? `${event.label ?? "Event"}｜${event.title ?? ""}：${event.whyItMatters ?? ""}` : undefined;
}

function eventTitle(event?: { label?: string; title?: string }) {
  return event ? `${event.label ?? "Event"}｜${event.title ?? ""}` : undefined;
}

export function extractWeeklySocialIntelligence(source?: WeeklyIntelligenceDraft | null): WeeklySocialIntelligenceExtraction {
  const periodic = source?.sections.periodicNarrative;
  const insight = source?.sections.insight;
  const questionDriven = insight?.questionDriven;
  const narrative = source?.sections.narrative;
  const macroEvent = weeklyEvent(source, /FOMC|Powell|fed|rate|rates|利率|美元|總經|CPI|PCE/i);
  const aiEvent = weeklyEvent(source, /AI|tech|semiconductor|NVDA|NVIDIA|TSMC|台積|半導體|cloud|capex|guidance|財報|指引/i);
  const marketEvent = weeklyEvent(source, /market|taiwan|crypto|BTC|ETH|SPY|QQQ|台股|資金|風險|波動/i);
  const centralQuestion = anchored(
    periodic?.socialHook ?? questionDriven?.centralQuestion ?? source?.title,
    "本週市場核心衝突：Fed / USD 是否會壓抑 AI beta、台股半導體、BTC 與 FCN volatility？",
    54,
  );
  const weeklyChange = anchored(
    source?.sections.intelligenceSummary.whatChanged ?? periodic?.whatChanged ?? narrative?.crossMarketNarrative,
    "本週不是新聞加總，而是 Fed / USD、AI beta、台股半導體、BTC 與 FCN 波動被放進同一條定價鏈。",
    98,
  );
  const crossMarketChain: WeeklyCrossMarketChainItem[] = [
    {
      label: "Fed / Rates",
      narrative: anchored(eventLine(macroEvent) ?? source?.sections.fedRates?.summary, "FOMC / Powell 與利率路徑會先改變 SPY、QQQ、BTC 與台股半導體的折現率。"),
    },
    {
      label: "USD",
      narrative: "美元若與殖利率同步走高，高 beta 風險資產的容錯率會先被壓縮。",
    },
    {
      label: "AI Beta",
      narrative: anchored(eventLine(aiEvent) ?? narrative?.aiNarrative, "AI earnings / guidance / capex 是判斷 QQQ、NVDA 與 cloud demand 是否能延續的核心證據。"),
    },
    {
      label: "Taiwan Semis",
      narrative: anchored(source?.sections.taiwanAi?.summary, "台積電、2330 與台灣半導體供應鏈會把 AI beta 映射到台股外資與估值承接。"),
    },
    {
      label: "Crypto",
      narrative: anchored(eventLine(marketEvent), "BTC / ETH 若跟不上 QQQ 與 AI beta，代表流動性風險承接正在變弱。"),
    },
    {
      label: "FCN Volatility",
      narrative: "FCN 要把上述鏈條翻譯成 worst-of basket pressure、volatility context、KO 條件與 KI risk awareness。",
    },
  ];
  const nextWeekCatalysts = uniqueItems(
    [
      ...(source?.sections.upcomingWeek?.map((event) => `${event.date}｜${event.title}：${event.whyItMatters}`) ?? []),
      ...(source?.sections.nextWeekFocus ?? []),
      ...(questionDriven?.watchNext ?? []),
      source?.sections.fedRates?.summary,
      source?.sections.taiwanAi?.summary,
    ],
    [
      "FOMC / Powell｜觀察利率路徑是否改變 SPY、QQQ、BTC 與台股半導體風險定價。",
      "AI earnings / guidance｜觀察 NVDA、台積電、2330、cloud capex 是否支撐 AI beta。",
      "FCN volatility｜觀察 worst-of basket pressure、KO / KI 距離與籃子集中敏感度。",
    ],
  );
  const aiEarningsPowerSignal = anchored(
    eventLine(aiEvent) ?? narrative?.aiNarrative ?? source?.sections.taiwanAi?.summary,
    "AI earnings / guidance / capex 是本週最重要證據；若台積電、2330、NVDA 與 cloud demand 沒有同步，AI beta 會變窄。",
    104,
  );
  const fcnTranslation = anchored(
    `${source?.sections.fcnMarketObservation?.worstOf ?? ""} ${source?.sections.fcnMarketObservation?.volatility ?? ""}`,
    "FCN translation：把 Fed / USD、AI beta、台股半導體與 BTC 波動轉成 worst-of basket pressure、KO probability context、KI risk awareness 與籃子集中敏感度。",
    126,
  );
  const iXuanWeeklyViewAngle = anchored(
    periodic?.ixuanView ?? narrative?.intelligenceTakeaway ?? source?.sections.intelligenceSummary.pricing,
    "一玄週觀點：本週看 Fed / USD 是否限制 AI beta；下週看 FOMC / Powell、AI guidance、台積電 / 2330、BTC 與 FCN worst-of volatility 是否同向驗證。",
    150,
  );

  return {
    centralQuestion,
    coreThesis: weeklyChange,
    weeklyChange,
    crossMarketChain,
    evidenceItems: [
      strategistEvidenceFromWeekly("What Happened", eventTitle(aiEvent) ?? aiEarningsPowerSignal),
      strategistEvidenceFromWeekly("Why It Matters", eventLine(macroEvent) ?? narrative?.crossMarketNarrative),
      strategistEvidenceFromWeekly("What Changes My Mind", nextWeekCatalysts[0]),
    ],
    nextWeekCatalysts,
    aiEarningsPowerSignal,
    fcnTranslation,
    iXuanWeeklyViewAngle,
  };
}

function strategistEvidenceFromWeekly(label: string, value: string | undefined): StrategistEvidenceItem {
  const text = anchored(value, "FOMC / Powell、AI guidance、台積電 / 2330、BTC 與 FCN volatility 是下週驗證鏈條。");
  const whyByLabel =
    label === "What Happened"
      ? "AI earnings、guidance、capex 與台積電 / 2330 供應鏈會決定 AI beta 能否擴散。"
      : label === "Why It Matters"
      ? "Fed / USD 定價會影響 QQQ、台股半導體、BTC 與 FCN worst-of basket 的容錯率。"
      : "若 FOMC / Powell、AI guidance 與 FCN volatility 沒有同向驗證，市場主線需要重新檢查。";
  const whyItMatters = isSimilarSentence(text, whyByLabel)
    ? "這會改變資金是否願意承接 AI beta、台股半導體、Crypto 與 FCN 籃子波動。"
    : whyByLabel;

  return {
    label,
    whatHappened: text,
    whyItMatters,
    whatChangesMyMind: "若下週催化未能支持風險承接，應重新檢查 Fed / USD、AI guidance 與 FCN volatility 鏈條。",
  };
}
