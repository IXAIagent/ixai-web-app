import type {
  DailyBriefDraft,
  DailyIntelligenceDraft,
  DailySocialHooks,
  DailyWeeklySignals,
  WeeklyDailyCoreAggregation,
} from "@/src/types/editorial";

export type DailyIntelligenceCore = {
  headline: string;
  headlineHook: string;
  conversionHook: string;
  socialThesis: string;
  socialCuriosity: string;
  socialCTA: string;
  weeklyThesis: string;
  contentFunnelTarget: string;
  todaySignal: string;
  topThreeThings: NonNullable<DailyIntelligenceDraft["topThreeThings"]>;
  marketInterpretation: string;
  investorWatchpoints: string[];
  whatChanged: string;
  continuityTags: string[];
  ixuanView: string;
  socialHooks: DailySocialHooks;
  weeklySignals: DailyWeeklySignals;
};

const FALLBACK_TOP_THREE: DailyIntelligenceCore["topThreeThings"] = [
  {
    headline: "Macro：利率與美元仍牽動風險偏好",
    whatHappened: "市場仍把利率、美元與通膨資料視為風險資產的主要折現變數。",
    whyItMatters: "利率路徑會影響科技股估值、Crypto 流動性與高 beta 資產容錯率。",
    watchpoint: "觀察美債殖利率、美元與 VIX 是否同步轉強。",
  },
  {
    headline: "AI：資金仍圍繞 AI infrastructure",
    whatHappened: "AI infrastructure、semiconductors、cloud 與 enterprise software 仍是資金觀察主軸。",
    whyItMatters: "AI 主線若擴散到軟體與雲端，市場敘事會從晶片延伸到企業效率。",
    watchpoint: "觀察大型科技、企業軟體、資料中心與半導體供應鏈是否同向。",
  },
  {
    headline: "Risk：高估值環境下波動率容易放大",
    whatHappened: "市場風險偏好尚未全面擴散，高 beta 資產仍受利率與流動性牽動。",
    whyItMatters: "集中度越高，任何利率或美元壓力都更容易放大資產波動。",
    watchpoint: "觀察 VIX、BTC / ETH、信用壓力與市場廣度。",
  },
];

function clean(value?: string) {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .replace(/([，。！？；])\s*[，。]+/g, "$1")
    .replace(/([。！？；])，/g, "$1")
    .trim();
}

function dedupeAdjacentSentences(value?: string) {
  const normalized = clean(value);

  if (!normalized) {
    return normalized;
  }

  const parts = normalized
    .split(/(?<=[。！？!?；;])\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  const output: string[] = [];

  for (const part of parts) {
    if (clean(output[output.length - 1]) !== clean(part)) {
      output.push(part);
    }
  }

  return output.join(" ");
}

function clamp(value: string | undefined, fallback: string, maxLength = 96) {
  const normalized = clean(value) || fallback;

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const parts = normalized
    .split(/(?<=[。！？.!?；;])|，|,/)
    .map((part) => part.trim())
    .filter(Boolean);
  let output = "";

  for (const part of parts) {
    const next = output ? `${output}，${part}` : part;
    if (next.length > maxLength) break;
    output = next;
  }

  return output || `${normalized.slice(0, maxLength - 1)}…`;
}

function clampSentence(value: string | undefined, fallback: string, maxLength = 96) {
  const output = clamp(value, fallback, maxLength);
  return /[。！？?]$/.test(output) ? output : `${output}。`;
}

function unique(items: string[]) {
  return Array.from(new Set(items.map((item) => clean(item)).filter(Boolean)));
}

function normalizeTag(tag: string) {
  return tag
    .replace(/^#/, "")
    .replace(/_/g, " ")
    .trim();
}

function stripDailyPrefix(value: string) {
  return clean(value)
    .replace(/^今日一句話[:：]\s*/i, "")
    .replace(/^Daily Intelligence[:：]\s*/i, "")
    .replace(/^今日市場最重要的訊號是[:：]\s*/i, "")
    .trim();
}

function buildHeadlineHook(headline: string, todaySignal: string) {
  const normalized = stripDailyPrefix(headline || todaySignal);
  const firstClause = normalized
    .split(/(?<=[。！？!?；;])|，|,/)
    .map((part) => part.trim())
    .find(Boolean);
  const hookBase = firstClause || stripDailyPrefix(todaySignal);

  if (hookBase.length <= 34) {
    return /[？?]$/.test(hookBase) ? hookBase : `${hookBase}？`;
  }

  return `${hookBase.slice(0, 33)}？`;
}

function buildConversionHook(headline: string, topThreeThings: DailyIntelligenceCore["topThreeThings"]) {
  const headlineTheme = stripDailyPrefix(buildHeadlineHook(headline, topThreeThings[0]?.headline ?? headline))
    .replace(/[？?]$/, "");
  const firstWatchpoint = topThreeThings[0]?.watchpoint;
  const cleanTheme = headlineTheme.replace(/\s+的/g, "的");

  return clampSentence(
    firstWatchpoint
      ? `${cleanTheme}的市場脈絡，需要回到 Daily Brief 看事件、訊號與下一步觀察`
      : `${cleanTheme}不只是單一新聞，請回到 Daily Brief 看完整市場訊號`,
    "這不是單一新聞，而是今天市場主線的變化。",
    46,
  );
}

function briefTime(brief: DailyBriefDraft) {
  return new Date(brief.publishedAt ?? brief.updatedAt ?? brief.createdAt).getTime();
}

function inferTagsFromBrief(brief: DailyBriefDraft) {
  const raw = [
    ...brief.sections.map((section) => `${section.category} ${section.headline} ${section.summary}`),
    brief.marketSummary,
    brief.editorialNote ?? "",
    ...(brief.riskFocus ?? []),
  ].join(" ");
  const tags: string[] = [];

  if (/AI|semiconductor|chip|NVDA|NVIDIA|software|cloud|半導體|晶片|雲端|企業軟體|供應鏈/i.test(raw)) {
    tags.push("AI infrastructure");
  }
  if (/rate|yield|Fed|Treasury|dollar|inflation|利率|殖利率|聯準會|美元|通膨/i.test(raw)) {
    tags.push("rates pressure");
  }
  if (/crypto|BTC|ETH|Bitcoin|stablecoin|幣|加密|流動性/i.test(raw)) {
    tags.push("crypto liquidity");
  }
  if (/Taiwan|TSMC|台股|台積電|台灣/i.test(raw)) {
    tags.push("Taiwan AI supply chain");
  }
  if (/risk|VIX|volatility|FCN|KI|KO|波動|風險/i.test(raw)) {
    tags.push("risk regime");
  }

  return unique(tags.length ? tags : ["AI infrastructure", "rates pressure", "risk regime"]).slice(0, 5);
}

function legacySectionTopStories(brief: DailyBriefDraft): DailyIntelligenceCore["topThreeThings"] {
  const sections = brief.sections.slice(0, 3);

  if (!sections.length) {
    return FALLBACK_TOP_THREE;
  }

  return sections.map((section) => ({
    headline: clamp(section.headline, `${section.category}：市場焦點`, 42),
    whatHappened: clamp(section.summary, brief.marketSummary, 72),
    whyItMatters: clamp(
      section.ixaiView ?? section.summary,
      "這項訊號有助於判斷本週市場主線、風險偏好與資金焦點。",
      78,
    ),
    watchpoint: clamp(
      section.ixaiView ?? section.summary,
      "觀察此主題是否延續到下一份 Daily Intelligence。",
      62,
    ),
  }));
}

function buildLegacyIntelligenceFromBrief(brief: DailyBriefDraft): DailyIntelligenceDraft {
  const topThreeThings = legacySectionTopStories(brief);
  const continuityTags = inferTagsFromBrief(brief);
  const investorWatchpoints = unique([
    ...topThreeThings.map((item) => item.watchpoint),
    ...(brief.riskFocus ?? []),
    "觀察 Daily Intelligence Core 是否連續追蹤同一組市場主線。",
  ]).slice(0, 6);
  const firstSignal = topThreeThings[0]?.headline ?? brief.title;
  const marketInterpretation = clamp(
    brief.editorialNote ?? brief.marketSummary,
    "這份 Daily Intelligence 以舊版 editorial 結構建立市場記憶基準，供週報聚合使用。",
    220,
  );
  const ixuanView = clamp(
    brief.editorialNote ?? topThreeThings[0]?.whyItMatters ?? brief.marketSummary,
    "一玄觀點聚焦市場主線如何延續、升溫或降溫，而不是單一新聞事件。",
    220,
  );

  return {
    aiTechObservation:
      brief.sections.find((section) => /AI|Tech|科技|半導體|晶片/i.test(`${section.category} ${section.headline}`))?.summary ??
      "AI / Tech 觀察以舊版 Daily sections 轉換為 Daily Core。",
    continuityTags,
    cryptoObservation:
      brief.sections.find((section) => /crypto|BTC|ETH|幣/i.test(`${section.category} ${section.headline}`))?.summary ??
      "No major crypto catalyst today.",
    executiveSummary: topThreeThings.map((item) => item.headline),
    feedItems: brief.sections.slice(0, 5).map((section) => ({
      category: section.category,
      title: section.headline,
      summary: section.summary,
      updatedLabel: "Legacy Daily",
    })),
    generatedAt: brief.publishedAt ?? brief.updatedAt ?? brief.createdAt,
    investorWatchpoints,
    ixuanView,
    macroRatesObservation:
      brief.sections.find((section) => /Macro|Fed|利率|總經|美元/i.test(`${section.category} ${section.headline}`))?.summary ??
      "Macro Watch 以舊版 Daily sections 轉換為 Daily Core。",
    marketInterpretation,
    marketRegime: "mixed",
    marketRegimeNote: marketInterpretation,
    providerMode: "fallback",
    riskFocus: {
      label: "Legacy Daily Core",
      title: brief.riskFocus?.[0] ?? "Market continuity baseline",
      summary: brief.marketSummary,
      updatedLabel: "Legacy Daily",
    },
    sessionLabel: "Asia Session",
    sourceMode: "fallback",
    todayHeadline: brief.title,
    todaySignal: clamp(firstSignal, "今日最重要的訊號是：市場主線仍需透過 Daily Core 追蹤。", 120),
    topThreeThings,
    whatChangedSinceLastBrief: clamp(
      `這份舊版 Daily Brief 被轉換為 Daily Intelligence Core，用於追蹤 ${continuityTags.slice(0, 3).join("、")} 是否延續或轉向。`,
      "舊版 Daily Brief 已轉換為市場記憶基準。",
      260,
    ),
    whatToMonitor: investorWatchpoints,
  };
}

function buildFallbackTags(intelligence: DailyIntelligenceDraft) {
  return unique([
    ...(intelligence.continuityTags ?? []),
    ...(intelligence.marketMemory?.dominantThemes ?? []),
    ...(intelligence.marketMemory?.risingThemes ?? []),
    "AI infrastructure",
    "rates pressure",
    "risk regime",
  ])
    .map(normalizeTag)
    .slice(0, 5);
}

function buildSocialHooks(core: Omit<DailyIntelligenceCore, "socialHooks" | "weeklySignals">): DailySocialHooks {
  const firstTop = core.topThreeThings[0];
  const secondTop = core.topThreeThings[1];
  const thirdTop = core.topThreeThings[2];
  const aiWatchpoint =
    core.investorWatchpoints.find((item) => /AI|software|cloud|semiconductor|半導體|雲端|企業軟體/i.test(item)) ??
    secondTop?.watchpoint;
  const riskWatchpoint =
    core.investorWatchpoints.find((item) => /risk|VIX|rate|yield|volatility|風險|利率|波動/i.test(item)) ??
    thirdTop?.watchpoint;

  return {
    contentFunnelTarget: core.contentFunnelTarget,
    conversionHook: core.conversionHook,
    headlineHook: core.headlineHook,
    primaryHook: clamp(core.todaySignal.replace(/^今日最重要的訊號是[:：]\s*/, ""), "今日市場主線聚焦 AI、利率與風險偏好。", 52),
    socialCTA: core.socialCTA,
    socialCuriosity: core.socialCuriosity,
    socialThesis: core.socialThesis,
    marketPulse: [
      `Macro｜${clamp(firstTop?.watchpoint, "美元與利率仍牽動風險偏好。", 34)}`,
      `AI｜${clamp(aiWatchpoint, "資金從晶片延伸到企業軟體。", 34)}`,
      `Risk｜${clamp(riskWatchpoint, "高估值環境下波動率容易放大。", 34)}`,
    ],
    aiTechSignal: {
      keySignal: clamp(aiWatchpoint, "AI 需求可能從晶片擴散到雲端與企業軟體。", 50),
      whyItMatters: clamp(secondTop?.whyItMatters ?? core.marketInterpretation, "若擴散成立，AI 會從個股行情轉為產業效率敘事。", 52),
      watchNext: clamp(secondTop?.watchpoint ?? aiWatchpoint, "觀察雲端、企業軟體與半導體供應鏈是否同向。", 50),
    },
    riskHook: clamp(riskWatchpoint, "觀察波動率、美元、利率與市場廣度是否同向。", 52),
    ixuanHook: clamp(core.ixuanView, "一玄觀點聚焦市場正在 pricing 什麼，而不是單一新聞。", 120),
  };
}

function buildWeeklySignals(core: Omit<DailyIntelligenceCore, "socialHooks" | "weeklySignals">): DailyWeeklySignals {
  const tags = core.continuityTags.length ? core.continuityTags : ["AI infrastructure", "rates pressure", "risk regime"];
  const risingThemes = core.whatChanged.includes("升溫")
    ? tags.slice(0, 2)
    : core.continuityTags.slice(1, 3);

  return {
    fadingThemes: core.whatChanged.includes("降溫") ? tags.slice(-1) : [],
    primaryTheme: tags[0] ?? "AI infrastructure",
    repeatedThemes: tags.slice(0, 4),
    risingThemes: unique(risingThemes).slice(0, 3),
    watchNext: core.investorWatchpoints.slice(0, 5),
    weeklyNarrative: clamp(
      `${core.weeklyThesis} ${core.whatChanged}`,
      "本週市場主線需要觀察 AI、利率與風險偏好是否延續。",
      320,
    ),
  };
}

export function buildDailyIntelligenceCore(
  intelligence: DailyIntelligenceDraft,
  options: {
    contentFunnelTarget?: string;
    headline?: string;
  } = {},
): DailyIntelligenceCore {
  const topThreeThings = (intelligence.topThreeThings?.length ? intelligence.topThreeThings : FALLBACK_TOP_THREE).slice(0, 3);
  const insight = intelligence.insight;
  const headline = clamp(
    options.headline ?? intelligence.headline ?? intelligence.todayHeadline,
    intelligence.todaySignal ?? "今日市場主線聚焦 AI、利率與風險偏好。",
    86,
  );
  const todaySignal = clamp(
    insight?.marketSignals[0]?.signal ?? intelligence.todaySignal ?? headline,
    "今日最重要的訊號是：AI、利率與風險偏好仍是市場主線。",
    120,
  );
  const headlineHook = insight?.socialFunnel.hook ?? intelligence.headlineHook ?? buildHeadlineHook(headline, todaySignal);
  const hookTheme = stripDailyPrefix(headlineHook).replace(/[？?]$/, "").replace(/\s+的/g, "的");
  const marketInterpretation = clamp(intelligence.marketInterpretation ?? intelligence.marketRegimeNote, "今日市場解讀重點是 AI、利率與風險偏好的互動。", 220);
  const conversionHook = intelligence.conversionHook ?? insight?.socialFunnel.conflict ?? buildConversionHook(headline, topThreeThings);
  const socialThesis = clampSentence(
    dedupeAdjacentSentences(
      intelligence.socialThesis ??
        insight?.whyItMatters ??
        (clean(headline) === clean(todaySignal) || todaySignal.includes(headline)
        ? marketInterpretation
        : `${headline} ${todaySignal}`),
    ),
    "今日市場主線不是單一新聞，而是 AI、利率與風險偏好的重新定價。",
    116,
  );
  const socialCuriosity = clampSentence(
    intelligence.socialCuriosity ?? insight?.socialFunnel.conflict ?? `為什麼 ${hookTheme} 值得點進去看？關鍵在於 ${topThreeThings[0]?.whyItMatters ?? "市場正在 pricing 的主線與風險約束"}`,
    "為什麼這件事值得點進去看？關鍵在市場主線是否延續或轉向。",
    94,
  );
  const contentFunnelTarget =
    options.contentFunnelTarget ??
    intelligence.contentFunnelTarget ??
    "/daily-brief";
  const socialCTA = clampSentence(
    intelligence.socialCTA ?? insight?.socialFunnel.cta ?? `想看 ${hookTheme} 背後的事件、訊號與下一步觀察，請進 IXAI App 讀 Daily Brief`,
    "想看完整市場訊號與下一步觀察，請進 IXAI App 讀 Daily Brief。",
    70,
  );
  const weeklyThesis = clampSentence(
    intelligence.weeklyThesis ?? `${headline} 是本週需要追蹤是否延續的 Daily Core 訊號`,
    "本週需要追蹤 Daily Core 訊號是否延續、升溫或降溫。",
    110,
  );
  const coreBase = {
    contentFunnelTarget,
    continuityTags: buildFallbackTags(intelligence),
    conversionHook,
    headline,
    headlineHook,
    investorWatchpoints: (intelligence.investorWatchpoints?.length ? intelligence.investorWatchpoints : intelligence.whatToMonitor).slice(0, 6),
    ixuanView: clamp(insight?.ixuanView ?? intelligence.ixuanView ?? intelligence.marketRegimeNote, "一玄觀點聚焦市場正在 pricing 什麼，而不是單一新聞。", 220),
    marketInterpretation,
    socialCTA,
    socialCuriosity,
    socialThesis,
    todaySignal,
    topThreeThings,
    weeklyThesis,
    whatChanged: clamp(insight?.whatChanged ?? intelligence.whatChangedSinceLastBrief, "IXAI 正在建立 Daily Intelligence 的市場記憶層，追蹤主線延續、升溫與降溫。", 360),
  };
  const socialHooks = buildSocialHooks(coreBase);
  const weeklySignals = buildWeeklySignals(coreBase);

  return {
    ...coreBase,
    socialHooks,
    weeklySignals,
  };
}

export function attachDailyIntelligenceCore(
  intelligence: DailyIntelligenceDraft,
  options: {
    contentFunnelTarget?: string;
    headline?: string;
  } = {},
): DailyIntelligenceDraft {
  const core = buildDailyIntelligenceCore(intelligence, options);

  return {
    ...intelligence,
    contentFunnelTarget: core.contentFunnelTarget,
    continuityTags: core.continuityTags,
    conversionHook: core.conversionHook,
    headline: core.headline,
    headlineHook: core.headlineHook,
    investorWatchpoints: core.investorWatchpoints,
    marketInterpretation: core.marketInterpretation,
    socialCTA: core.socialCTA,
    socialCuriosity: core.socialCuriosity,
    socialHooks: core.socialHooks,
    socialThesis: core.socialThesis,
    todayHeadline: core.headline,
    todaySignal: core.todaySignal,
    topThreeThings: core.topThreeThings,
    weeklyThesis: core.weeklyThesis,
    weeklySignals: core.weeklySignals,
    whatChangedSinceLastBrief: core.whatChanged,
    ixuanView: core.ixuanView,
  };
}

export function getDailyIntelligenceCoreFromBrief(brief: DailyBriefDraft): DailyIntelligenceCore | null {
  if (brief.intelligence) {
    return buildDailyIntelligenceCore(brief.intelligence, {
      contentFunnelTarget: `/daily-brief/${brief.slug}`,
      headline: brief.title,
    });
  }

  if (brief.sections.length || brief.marketSummary || brief.editorialNote) {
    return buildDailyIntelligenceCore(buildLegacyIntelligenceFromBrief(brief), {
      contentFunnelTarget: `/daily-brief/${brief.slug}`,
      headline: brief.title,
    });
  }

  return null;
}

function sortBriefsByRecency(briefs: DailyBriefDraft[]) {
  return [...briefs].sort((a, b) => briefTime(b) - briefTime(a));
}

function tagFrequency(cores: DailyIntelligenceCore[]) {
  const counts = new Map<string, number>();

  for (const core of cores) {
    for (const tag of core.continuityTags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
}

export function buildWeeklyAggregationFromDailyCores(
  briefs: DailyBriefDraft[],
): WeeklyDailyCoreAggregation {
  const coreBriefs = sortBriefsByRecency(briefs)
    .map((brief) => ({ brief, core: getDailyIntelligenceCoreFromBrief(brief) }))
    .filter((item): item is { brief: DailyBriefDraft; core: DailyIntelligenceCore } => Boolean(item.core));
  const latestTime = coreBriefs[0] ? briefTime(coreBriefs[0].brief) : 0;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const sevenDayWindow = latestTime
    ? coreBriefs.filter((item) => latestTime - briefTime(item.brief) <= sevenDaysMs)
    : [];
  const selectedCoreBriefs =
    sevenDayWindow.length >= 5
      ? sevenDayWindow.slice(0, 7)
      : coreBriefs.slice(0, Math.min(5, coreBriefs.length));
  const cores = selectedCoreBriefs.map((item) => item.core);
  const repeatedThemes = tagFrequency(cores).slice(0, 5);
  const latest = cores[0];
  const prior = cores[1];
  const latestRising = unique(cores.flatMap((core) => core.weeklySignals.risingThemes)).slice(0, 4);
  const fadingThemes = unique(cores.flatMap((core) => core.weeklySignals.fadingThemes)).slice(0, 3);
  const recentSignals = cores.map((core) => core.todaySignal).slice(0, 5);
  const sourceBriefSlugs = selectedCoreBriefs.map((item) => item.brief.slug);
  const sourceBriefCount = sourceBriefSlugs.length;
  const limitedHistory = sourceBriefCount < 7;
  const aggregationWindow = sevenDayWindow.length >= 5 ? "7d" : "limited-history";
  const fallbackThemes = ["AI infrastructure", "rates pressure", "risk regime"];
  const resolvedRepeated = repeatedThemes.length ? repeatedThemes : fallbackThemes;
  const primary = resolvedRepeated[0] ?? "AI infrastructure";
  const secondary = resolvedRepeated[1] ?? "rates pressure";
  const limitedPrefix = limitedHistory ? "Based on limited Daily Intelligence history，" : "";
  const whatChanged = latest
    ? prior
      ? `${limitedPrefix}Daily continuity context 顯示，本週主線仍以 ${primary} 為核心，但最新變化在於 ${latest.weeklySignals.risingThemes[0] ?? latest.continuityTags[1] ?? secondary} 是否接棒升溫。`
      : `${limitedPrefix}本週 Weekly Intelligence 先以 ${primary}、${secondary} 與 ${resolvedRepeated[2] ?? "risk regime"} 建立聚合基準。`
    : "Based on limited Daily Intelligence history，本週 Daily Core 資料不足，使用 editorial-safe weekly fallback 建立市場敘事基準。";

  return {
    aggregationWindow,
    fadingThemes,
    ixuanViewSummary: clamp(
      latest?.ixuanView,
      "一玄觀點聚焦本週市場正在 pricing 的主線與風險約束。",
      180,
    ),
    limitedHistory,
    nextWeekWatchpoints: unique(cores.flatMap((core) => core.weeklySignals.watchNext)).slice(0, 6),
    recentSignals,
    repeatedThemes: resolvedRepeated,
    risingThemes: latestRising.length ? latestRising : resolvedRepeated.slice(1, 3),
    sourceBriefCount,
    sourceBriefSlugs,
    weeklyNarrative: latest
      ? clamp(
          `${whatChanged} ${latest.marketInterpretation}`,
          "本週市場主線需要觀察 AI、利率與風險偏好是否延續。",
          360,
        )
      : "本週 Daily Core 資料不足；週報先使用公開新聞與 editorial-safe fallback 建立市場脈絡。",
    whatChanged,
  };
}
