import type { DailyBriefDraft, WeeklyIntelligenceDraft } from "@/src/types/editorial";
import { getDailyIntelligenceCoreFromBrief } from "@/src/lib/intelligence/core";
import { ensureDistinctNarratives, narrativeSimilarity } from "@/src/lib/intelligence/insight/repetition-detector";

export type SocialPackKind = "daily" | "weekly";
export type SocialExportFormat = "ig_feed_4_5" | "story_9_16";

export type SocialPackSlide =
  | "cover"
  | "top_news"
  | "ai_tech_watch"
  | "fcn_risk_watch"
  | "ixuan_view"
  | "market_review"
  | "weekly_view";

export type SocialIntelligenceSlide = {
  id: SocialPackSlide;
  eyebrow: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  footer?: string;
};

export type SocialIntelligencePack = {
  kind: SocialPackKind;
  title: string;
  subtitle: string;
  dateLabel: string;
  sourceBriefId?: string;
  slides: SocialIntelligenceSlide[];
  disclaimer: string;
  caption: string;
  cta: {
    label: string;
    href: string;
  };
};

const DISCLAIMER =
  "市場資訊與教育分享，非個人化投資建議。Market intelligence and education only. Not personalized investment advice.";
export const socialBrandTokens = {
  cream: "#F4F0E6",
  dark: "#071A16",
  forest: "#0F2E27",
  gold: "#B99A63",
};

export const socialExportFormats: Record<
  SocialExportFormat,
  {
    aspectRatio: "4 / 5" | "9 / 16";
    description: string;
    height: number;
    label: string;
    platform: string;
    width: number;
  }
> = {
  ig_feed_4_5: {
    aspectRatio: "4 / 5",
    description: "IG Feed / Carousel 主力格式，適合 Facebook / Threads 直式貼文。",
    height: 1350,
    label: "IG Feed / Carousel 4:5",
    platform: "Instagram Feed · Facebook · Threads",
    width: 1080,
  },
  story_9_16: {
    aspectRatio: "9 / 16",
    description: "Story / Reels / LINE 導流格式，適合大 hook 與完整日報 CTA。",
    height: 1920,
    label: "Story / Reels 9:16",
    platform: "IG Story · Reels · LINE",
    width: 1080,
  },
};

function formatDateLabel(value?: string) {
  if (!value) {
    return new Date().toLocaleDateString("zh-TW", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("zh-TW", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function normalizeSocialCopy(value?: string, fallback = "IXAI 已整理今日市場脈絡與風險觀察。") {
  return (value ?? fallback)
    .replace(/\*\*/g, "")
    .replace(/…/g, "")
    .replace(/相較前一份 Brief[，：:]?\s*/g, "")
    .replace(/相較最近\s*\d+\s*份 Daily Intelligence[，：:]?\s*/g, "")
    .replace(/點進 IXAI App 看完整 Daily Brief/g, "想看完整市場訊號與下一步觀察，請進 IXAI App 讀 Daily Brief")
    .replace(/完整內容請見 IXAI App/g, "想看完整市場訊號與下一步觀察，請進 IXAI App")
    .replace(/市場訊號正在轉向/g, "市場正在重新篩選可被證明的主線")
    .replace(/投資人持續觀察/g, "資金會檢查")
    .replace(/風險偏好受到壓力/g, "風險資產的容錯率下降")
    .replace(/值得關注|持續關注/g, "需要用可觀察資料驗證")
    .replace(/市場情緒變化/g, "資金定價條件改變")
    .replace(/事件背後的市場訊號/g, "市場正在要求的證據")
    .replace(/AI\s*敘事仍有吸引力/g, "資金仍願意買 AI")
    .replace(/([，。！？；])\s*[，。]+/g, "$1")
    .replace(/([。！？；])，/g, "$1")
    .replace(/Short Insight|Observation\s*\d+/gi, "")
    .replace(/今日市場焦點已整理為公開情報與風險觀察/g, "今日市場主線聚焦 AI 需求、利率壓力與風險偏好。")
    .replace(/^[\s\-\d.①②③④⑤、]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/buy now|must buy|sell now/gi, "monitor")
    .replace(/guaranteed return/gi, "risk-awareness context")
    .replace(/買進|買入|必買/g, "觀察")
    .replace(/賣出|必賣/g, "風險控管")
    .replace(/保證收益|保證報酬|穩賺|必漲/g, "風險情境");
}

function isMostlyEnglish(value: string) {
  const cjkCount = (value.match(/[\u4e00-\u9fff]/g) ?? []).length;
  return cjkCount < Math.max(6, value.length * 0.18);
}

function readableSnippet(value?: string, fallback = "維持風險意識與情境判讀。", maxLength = 52) {
  const normalized = normalizeSocialCopy(value, fallback);

  if (!normalized || isMostlyEnglish(normalized)) {
    return fallback;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const clauses = normalized
    .split(/(?<=[。！？.!?；;])|\s[|]\s|，|,/)
    .map((part) => part.trim())
    .filter(Boolean);
  let output = "";

  for (const clause of clauses) {
    const separator = /[。！？.!?；;]$/.test(output) ? "" : "，";
    const next = output ? `${output}${separator}${clause}` : clause;
    if (next.length > maxLength) {
      break;
    }
    output = next;
  }

  if (output) {
    return /[。！？.!?；;]$/.test(output) ? output : `${output}。`;
  }

  return fallback;
}

function socialSubjectFromEvidence(evidence?: { event: string; source: string; whyItMatters: string }) {
  const value = evidence?.event ?? "";

  if (/MediaTek|聯發科|2454/i.test(value)) return "聯發科法說";
  if (/TSMC|台積|矽光子/i.test(value)) return "台積電矽光子";
  if (/NVIDIA|Nvidia|Meta|Schlumberger/i.test(value)) return "企業 AI 採用";
  if (/Oracle|ORCL/i.test(value)) return "雲端財報";
  if (/Binance/i.test(value)) return "美股代幣化";
  if (/CoinShares|ETP|ETF/i.test(value)) return "Crypto 資金流";
  if (/CPI|通膨/i.test(value)) return "通膨數據";
  if (/Treasury|yield|殖利率|美債/i.test(value)) return "美債殖利率";

  return readableSnippet(value, "今日關鍵事件", 16).replace(/[。！？!?]$/g, "");
}

function buildDailySocialTitle(
  source: DailyBriefDraft | null | undefined,
  question: string | undefined,
  evidence: { event: string; source: string; whyItMatters: string }[],
) {
  const subject = socialSubjectFromEvidence(evidence[0]);
  const candidates = [
    `${subject}，今天市場要看哪個證據？`,
    `${subject}背後，風險正在往哪裡移？`,
    `${subject}會讓資金重新挑選主線嗎？`,
    source?.intelligence?.headlineHook,
    source?.intelligence?.socialHooks?.primaryHook,
  ].filter((item): item is string => Boolean(item));

  return candidates.find((candidate) => !question || narrativeSimilarity(candidate, question) < 0.72)
    ?? candidates[0]
    ?? "今天市場要看哪個證據？";
}

function weeklyQuestionFromSource(source?: WeeklyIntelligenceDraft | null, fallback = "本週市場真正改變了什麼？") {
  const majorEvent = source?.sections.majorEvents?.[0];
  const upcoming = source?.sections.upcomingWeek?.[0];

  if (majorEvent?.title) {
    return `${readableSnippet(majorEvent.title, "本週核心事件", 22)}改變了什麼？`;
  }

  if (upcoming?.title) {
    return `下週${readableSnippet(upcoming.title, "關鍵事件", 20)}會驗證什麼？`;
  }

  return fallback;
}

function dailyIxuanView(source?: DailyBriefDraft | null) {
  const candidate =
    source?.intelligence?.ixuanView ??
    source?.editorialNote ??
    source?.intelligence?.marketInterpretation ??
    source?.intelligence?.marketRegimeNote ??
    source?.marketSummary;
  const normalized = normalizeSocialCopy(candidate, "");

  if (normalized && !isMostlyEnglish(normalized)) {
    const view = readableSnippet(normalized, "", 150);
    if (view.length >= 54 && /[。！？]/.test(view)) {
      return view;
    }
  }

  return "本輪 AI 行情已不只是晶片股行情，而是逐步擴散到雲端、資料庫與企業軟體。短期仍需留意利率與估值壓力，但只要企業 AI 資本支出沒有反轉，市場主線仍可能圍繞 AI 基礎設施與軟體效率展開。";
}

function sourceTextFromDailySection(source: DailyBriefDraft | null | undefined, pattern: RegExp) {
  const section = source?.sections.find((item) => pattern.test(`${item.category} ${item.headline} ${item.summary} ${item.ixaiView ?? ""}`));

  if (!section) {
    return undefined;
  }

  return `${section.headline}：${section.summary}`;
}

function evidenceByCategory(
  evidence: { category?: string; event: string; source: string; whyItMatters: string }[],
  pattern: RegExp,
) {
  return evidence.find((item) => pattern.test(`${item.category ?? ""} ${item.event} ${item.whyItMatters} ${item.source}`));
}

function socialAxisLine(label: string, value: string | undefined, fallback: string, maxLength = 52) {
  return `${label}｜${readableSnippet(value, fallback, maxLength)}`;
}

function buildDailyMarketAxes(
  source: DailyBriefDraft | null | undefined,
  evidence: { category?: string; event: string; source: string; whyItMatters: string }[],
) {
  const macroEvidence = evidenceByCategory(evidence, /macro|rates|fed|yield|利率|美元|通膨|殖利率/i);
  const aiEvidence = evidenceByCategory(evidence, /ai|tech|semiconductor|chip|NVDA|NVIDIA|TSMC|台積|半導體|雲端|AI/i);
  const taiwanCryptoEvidence = evidenceByCategory(evidence, /taiwan|crypto|BTC|ETH|台股|台灣|加密/i);
  const macroSource =
    macroEvidence
      ? `${macroEvidence.event}：${macroEvidence.whyItMatters}`
      : source?.intelligence?.macroWatch
      ? `${source.intelligence.macroWatch.whatHappened} ${source.intelligence.macroWatch.marketMeaning}`
      : sourceTextFromDailySection(source, /rates|macro|us_market|利率|美元|美股|總經/i);
  const aiSource =
    aiEvidence
      ? `${aiEvidence.event}：${aiEvidence.whyItMatters}`
      : source?.intelligence?.aiTechWatch?.observations?.[0] ??
        source?.intelligence?.aiTechObservation ??
        sourceTextFromDailySection(source, /ai|tech|ai_market|半導體|科技|台積|雲端/i);
  const taiwanCryptoSource =
    taiwanCryptoEvidence
      ? `${taiwanCryptoEvidence.event}：${taiwanCryptoEvidence.whyItMatters}`
      : sourceTextFromDailySection(source, /taiwan|crypto|taiwan_market|台股|台灣|加密|BTC|ETH/i) ??
        source?.intelligence?.cryptoWatch?.observations?.[0] ??
        source?.intelligence?.cryptoObservation;

  return [
    socialAxisLine("Macro", macroSource, "利率、美元與通膨仍是今日風險資產的定價錨點。"),
    socialAxisLine("AI-Tech", aiSource, "AI 主線要從題材回到訂單、資本支出與現金流證據。"),
    socialAxisLine("Taiwan-Crypto", taiwanCryptoSource, "台股供應鏈與 BTC / ETH 共同反映風險偏好的承接力。"),
  ];
}

function uniqueConcreteItems(items: Array<string | undefined | null>, fallbackItems: string[], count = 3) {
  const normalized = items
    .map((item) => normalizeSocialCopy(item ?? "", ""))
    .filter((item) => item.length >= 8 && !isMostlyEnglish(item));
  const output: string[] = [];

  for (const item of [...normalized, ...fallbackItems]) {
    const snippet = readableSnippet(item, "", 62);
    if (!snippet) continue;
    if (output.some((existing) => narrativeSimilarity(existing, snippet) >= 0.78)) continue;
    output.push(snippet);
    if (output.length >= count) break;
  }

  return output;
}

function buildDailyWatchItems(source: DailyBriefDraft | null | undefined, watchNext: string[] | undefined) {
  return uniqueConcreteItems(
    [
      ...(watchNext ?? []),
      ...(source?.intelligence?.investorWatchpoints ?? []),
      source?.intelligence?.macroWatch?.marketMeaning,
      source?.intelligence?.aiTechWatch?.observations?.[0],
      source?.intelligence?.cryptoWatch?.observations?.[0],
    ],
    [
      "24 小時內觀察利率與美元是否同步壓抑科技股估值。",
      "48 小時內觀察 AI 軟體、雲端與半導體是否同步上修。",
      "72 小時內觀察台股 AI 供應鏈與 BTC / ETH 是否承接風險偏好。",
    ],
  ).map((item, index) => {
    const labels = ["證據同步", "利率與美元", "科技廣度"];
    return `${labels[index] ?? "下步觀察"}｜${item}`;
  });
}

function buildDailyRiskBullets(source: DailyBriefDraft | null | undefined, riskCopy: string) {
  const riskState = source?.intelligence?.riskRegimeReasoning?.current ?? "Elevated";
  const riskReason =
    source?.intelligence?.riskRegimeReasoning?.reasons?.[0] ??
    riskCopy ??
    "利率與估值壓力會降低風險資產容錯率。";
  const fcn = source?.intelligence?.fcnAwareness;
  const fcnCopy = fcn
    ? `${fcn.topic}｜${readableSnippet(`${fcn.explanation} ${fcn.reminder}`, "KO / KI / Worst-of 與波動會影響 FCN 風險觀察。", 70)}`
    : "FCN Awareness｜同步觀察 KO / KI / Worst-of、波動與籃子標的集中度。";

  return [
    `Risk State｜${riskState}`,
    `Why It Matters｜${readableSnippet(riskReason, "風險資產容錯率正在被利率與估值重新檢查。", 70)}`,
    fcnCopy,
  ];
}

function buildDailyContractView(
  source: DailyBriefDraft | null | undefined,
  questionView: string | undefined,
  evidence: { event: string; source: string; whyItMatters: string }[],
  fallback: string,
) {
  const subjects = [socialSubjectFromEvidence(evidence[0]), socialSubjectFromEvidence(evidence[1])]
    .filter((item) => item && item !== "今日關鍵事件");
  const uniqueSubjects = Array.from(new Set(subjects));
  const primary = uniqueSubjects[0] ?? "今日主線";
  const secondary = uniqueSubjects[1] ?? "利率、美元與風險資產容錯率";
  const sourceView = normalizeSocialCopy(questionView ?? source?.intelligence?.ixuanView ?? fallback, "");

  if (sourceView.length >= 80 && sourceView.length <= 180 && narrativeSimilarity(sourceView, primary) < 0.28) {
    return readableSnippet(sourceView, fallback, 150);
  }

  return readableSnippet(
    `一玄觀點：今天不是判斷題材退潮，而是看 ${primary} 能否拿出收入、訂單或資金流證據；同時檢查 ${secondary} 是否正在降低風險資產容錯率。證據若同步，主線才有延續力。`,
    fallback,
    150,
  );
}

function buildDailyCaptionFromSource(marketAxes: string[], riskBullets: string[], target: string) {
  const axisLabels = marketAxes.map((axis) => axis.split("｜")[0]).join(" / ");
  const riskLabel = riskBullets[0]?.replace("Risk State｜", "") ?? "Elevated";

  return [
    "【一玄每日 AI 投資日報】",
    `今日三軸：${axisLabels}`,
    `風險狀態：${riskLabel}，請同步看 FCN KO / KI / Worst-of awareness。`,
    "想看今天的證據、反證與下一步觀察，請進 IXAI App 讀 Daily Brief：",
    appHref(target),
    DISCLAIMER,
  ].join("\n");
}

function eventText(event: { label?: string; title?: string; whyItMatters?: string }) {
  return `${event.label ?? "Event"}｜${event.title ?? ""}：${event.whyItMatters ?? ""}`;
}

function findWeeklyMajorEvent(
  source: WeeklyIntelligenceDraft | null | undefined,
  pattern: RegExp,
) {
  return source?.sections.majorEvents?.find((event) => pattern.test(`${event.label} ${event.title} ${event.whyItMatters}`));
}

function buildWeeklyChangedBullets(source: WeeklyIntelligenceDraft | null | undefined) {
  const narrative = source?.sections.narrative;
  const macroEvent = findWeeklyMajorEvent(source, /fed|rate|rates|macro|FOMC|Powell|利率|美元|殖利率|總經/i);
  const aiEvent = findWeeklyMajorEvent(source, /AI|tech|semiconductor|NVDA|NVIDIA|TSMC|台積|半導體|cloud|capex|guidance|財報|指引/i);
  const marketEvent = findWeeklyMajorEvent(source, /market|taiwan|crypto|BTC|ETH|SPY|QQQ|台股|資金|風險|波動/i);
  const macroSource =
    macroEvent ? eventText(macroEvent) : source?.sections.fedRates
      ? `${source.sections.fedRates.headline}：${source.sections.fedRates.summary}`
      : narrative?.pricingWhat?.find((item) => /rates|macro|利率|美元|FOMC|Powell/i.test(item));
  const aiSource =
    aiEvent ? eventText(aiEvent) : source?.sections.taiwanAi
      ? `${source.sections.taiwanAi.headline}：${source.sections.taiwanAi.summary}`
      : narrative?.aiNarrative;
  const firstHighlight = source?.sections.marketHighlights?.[0];
  const marketSource =
    marketEvent
      ? eventText(marketEvent)
      : narrative?.crossMarketNarrative ??
        source?.sections.intelligenceSummary.whatChanged ??
        (firstHighlight ? `${firstHighlight.headline}：${firstHighlight.summary}` : undefined);

  return [
    socialAxisLine("Macro", macroSource, "FOMC、Powell、利率與美元仍是下週風險資產的共同定價錨。", 62),
    socialAxisLine("AI", aiSource, "AI 主線要接受 earnings、guidance、capex 與雲端需求驗證。", 62),
    socialAxisLine("Market", marketSource, "資金會檢查美股 AI beta、台股供應鏈、BTC 與 FCN 波動是否同向。", 62),
  ];
}

function buildWeeklyCatalystBullets(source: WeeklyIntelligenceDraft | null | undefined, watchNext: string[] | undefined) {
  const upcoming = source?.sections.upcomingWeek?.map((event) => `${event.date}｜${event.title}：${event.whyItMatters}`);

  return uniqueConcreteItems(
    [
      ...(upcoming ?? []),
      ...(source?.sections.nextWeekFocus ?? []),
      ...(watchNext ?? []),
      source?.sections.fedRates?.summary,
      source?.sections.taiwanAi?.summary,
    ],
    [
      "FOMC / Powell｜觀察利率路徑是否改變 SPY、QQQ 與 BTC 的風險定價。",
      "AI earnings / guidance｜觀察台積電、NVDA 與雲端 capex 是否支持 AI 估值。",
      "FCN volatility｜觀察 KO / KI、worst-of 與籃子波動是否因科技股震盪惡化。",
    ],
  );
}

function buildWeeklyOneThing(source: WeeklyIntelligenceDraft | null | undefined) {
  const narrative = source?.sections.narrative;
  const candidate =
    narrative?.aiNarrative ??
    source?.sections.periodicNarrative?.mainNarrative ??
    source?.sections.intelligenceSummary.pricing ??
    source?.sections.taiwanAi?.summary;

  return readableSnippet(
    candidate,
    "本週唯一最重要的主軸，是 AI earnings、guidance 與 capex 能否把題材變成可驗證的財報證據。",
    92,
  );
}

function buildWeeklyRiskView(source: WeeklyIntelligenceDraft | null | undefined, catalysts: string[]) {
  const narrative = source?.sections.narrative;
  const marketView =
    source?.sections.periodicNarrative?.ixuanView ??
    narrative?.intelligenceTakeaway ??
    source?.sections.intelligenceSummary.pricing;
  const riskView =
    narrative?.riskFocus ??
    source?.sections.periodicNarrative?.riskNarrative ??
    source?.sections.intelligenceSummary.riskTone;
  const fcn = source?.sections.fcnMarketObservation;
  const fcnView = fcn
    ? `FCN 風險要看 ${fcn.worstOf} ${fcn.volatility}`
    : "FCN 風險要同步看 KO / KI、worst-of、波動與籃子標的集中度。";

  return [
    `市場觀點｜${readableSnippet(marketView, "市場正在把 AI 故事重新交給財報、利率與資金流驗證。", 70)}`,
    `風險觀點｜${readableSnippet(riskView, "若利率與美元壓力升高，科技估值與高 beta 資產容錯率會下降。", 70)}`,
    `下週觀察｜${readableSnippet(`${catalysts[0] ?? "FOMC / Powell"}；${fcnView}`, "下週觀察 FOMC / Powell、AI guidance 與 FCN worst-of 波動。", 90)}`,
  ];
}

function buildWeeklyCaptionFromSource(changedBullets: string[], catalysts: string[], target: string) {
  const changedLabels = changedBullets.map((item) => item.split("｜")[0]).join(" / ");
  const catalystLabels = catalysts
    .map((item) => item.split("｜")[0])
    .slice(0, 3)
    .join(" / ");

  return [
    "【一玄每週 AI 投資週報】",
    `本週變化：${changedLabels}`,
    `下週催化：${catalystLabels}`,
    "本週重點是把 rates、AI guidance、台股供應鏈、BTC 與 FCN risk 放進同一條市場鏈條。",
    "想看完整市場鏈條、風險觀點與下週觀察，請進 IXAI App 讀 Weekly Intelligence：",
    appHref(target),
    DISCLAIMER,
  ].join("\n");
}

function appHref(target?: string) {
  if (!target) {
    return "https://app.ixuan.ai/daily-brief";
  }

  if (/^https?:\/\//i.test(target)) {
    return target;
  }

  return `https://app.ixuan.ai${target.startsWith("/") ? target : `/${target}`}`;
}

export function generateDailySocialPack(source?: DailyBriefDraft | null): SocialIntelligencePack {
  const dateLabel = formatDateLabel(source?.publishedAt ?? source?.updatedAt);
  const core = source ? getDailyIntelligenceCoreFromBrief(source) : null;
  const insight = source?.intelligence?.insight;
  const questionDriven = insight?.questionDriven;
  const dailyEvidence = questionDriven?.evidenceDetails ?? [];
  const socialTitle = buildDailySocialTitle(source, questionDriven?.centralQuestion, dailyEvidence);
  const rawShortAnswer = readableSnippet(
    questionDriven?.keyAnswer ?? insight?.socialFunnel.payoff ?? core?.conversionHook,
    "資金沒有離開主線，但開始要求更清楚的獲利證據。",
    54,
  );
  const shortAnswer = /市場脈絡|值得點進去看|整理/.test(rawShortAnswer)
    ? "市場焦點正從價格，轉向利率、AI 與風險承擔。"
    : rawShortAnswer;
  const marketSeeing = buildDailyMarketAxes(source, dailyEvidence);
  const riskCopy = readableSnippet(
    questionDriven?.counterEvidence[0] ?? insight?.narrativeTension ?? core?.socialHooks.riskHook,
    "真正風險不是主線消失，而是利率讓估值容錯率下降。",
    70,
  );
  const riskBullets = buildDailyRiskBullets(source, riskCopy);
  const watchItems = buildDailyWatchItems(source, questionDriven?.watchNext);
  const dailyInsight = buildDailyContractView(
    source,
    questionDriven?.ixuanView,
    dailyEvidence,
    core?.socialHooks.ixuanHook ?? dailyIxuanView(source),
  );
  const dailyTarget = core?.contentFunnelTarget ?? (source?.slug ? `/daily-brief/${source.slug}` : "/daily-brief");
  const dailyCta = insight?.socialFunnel.cta ?? core?.socialCTA ?? "想看今天的證據、反證與下一步觀察，請進 IXAI App 讀 Daily Brief。";
  const dailySlideBullets = ensureDistinctNarratives(
    [
      shortAnswer,
      marketSeeing.join(" "),
      riskCopy,
      watchItems.join(" "),
      dailyInsight,
    ],
    [
      "資金沒有離開主線，但開始要求可驗證的獲利證據。",
      "市場看到的是事件、訂單、利率與供應鏈是否同向。",
      "真正風險是利率壓縮估值容錯率，而不是單一題材消失。",
      "接下來看軟體、雲端支出與半導體訂單是否同步上修。",
      "下一階段贏家不是最會講故事，而是最能把需求變成現金流的公司。",
    ],
  );

  return {
    caption: buildDailyCaptionFromSource(marketSeeing, riskBullets, dailyTarget),
    cta: {
      href: appHref(dailyTarget),
      label: "閱讀完整 Daily Brief",
    },
    dateLabel,
    disclaimer: DISCLAIMER,
    kind: "daily",
    sourceBriefId: source?.id,
    subtitle: "Daily Intelligence",
    title: socialTitle,
    slides: [
      {
        bullets: [dailySlideBullets[0]],
        eyebrow: "Daily Intelligence",
        footer: "Social Pack → Daily Brief",
        id: "cover",
        subtitle: "市場正在從故事轉向證據。",
        title: socialTitle,
      },
      {
        bullets: marketSeeing,
        eyebrow: "What The Market Sees",
        footer: "人工審閱後供手動發布",
        id: "top_news",
        title: "市場看到了什麼？",
      },
      {
        bullets: [
          ...riskBullets,
        ],
        eyebrow: "Risk Contrast",
        id: "fcn_risk_watch",
        title: "Risk Regime",
      },
      {
        bullets: watchItems,
        eyebrow: "Watch Next",
        id: "market_review",
        title: "24–72 小時觀察",
      },
      {
        bullets: [dailySlideBullets[4], dailyCta],
        eyebrow: "I-Xuan View",
        footer: `${dailyCta} · app.ixuan.ai`,
        id: "ixuan_view",
        title: "I-Xuan View / 一玄觀點",
      },
    ],
  };
}

export function generateWeeklySocialPack(source?: WeeklyIntelligenceDraft | null): SocialIntelligencePack {
  const dateLabel =
    source?.weekStart && source.weekEnd
      ? `${formatDateLabel(source.weekStart)} - ${formatDateLabel(source.weekEnd)}`
      : formatDateLabel(source?.publishedAt ?? source?.updatedAt);
  const periodic = source?.sections.periodicNarrative;
  const insight = source?.sections.insight;
  const questionDriven = insight?.questionDriven;
  const weeklyTarget = source?.slug ? `/weekly-brief/${source.slug}` : "/weekly-brief";
  const weeklyHref = appHref(weeklyTarget);
  const weeklyCta = periodic?.clearCTA ?? "想看本週轉折、三個事件與下週催化，請進 IXAI App 讀 Weekly Intelligence。";
  const weeklySignals = buildWeeklyChangedBullets(source);
  const weeklyCatalysts = buildWeeklyCatalystBullets(source, questionDriven?.watchNext);
  const weeklyQuestion = weeklyQuestionFromSource(source, periodic?.socialHook ?? "本週市場最大轉折是什麼？");
  const weeklyAnswer = readableSnippet(
    source?.sections.intelligenceSummary.whatChanged ?? periodic?.whatChanged ?? periodic?.mainNarrative,
    "本週重點不是 Daily 訊號加總，而是週內事件如何改變下週驗證順序。",
    58,
  );
  const oneThing = buildWeeklyOneThing(source);
  const weeklyViewBullets = buildWeeklyRiskView(source, weeklyCatalysts);
  const weeklySlideBullets = ensureDistinctNarratives(
    [
      weeklyAnswer,
      weeklySignals.join(" "),
      oneThing,
      weeklyCatalysts.join(" "),
      weeklyViewBullets.join(" "),
    ],
    [
      "本週市場真正的變化，是資金開始要求 AI、利率與風險資產同時提出證據。",
      "本週三個訊號來自 Macro、AI earnings 與跨市場資金排序。",
      "本週唯一最重要的事，是 AI guidance 與 capex 能否支撐科技估值。",
      "下週觀察 FOMC / Powell、AI guidance 與 FCN worst-of 波動。",
      "一玄週觀點：用利率、AI 財報與 FCN 風險鏈條驗證下週資金方向。",
    ],
  );

  return {
    caption: buildWeeklyCaptionFromSource(weeklySignals, weeklyCatalysts, weeklyTarget),
    cta: {
      href: weeklyHref,
      label: weeklyCta,
    },
    dateLabel,
    disclaimer: DISCLAIMER,
    kind: "weekly",
    sourceBriefId: source?.id,
    subtitle: "Weekly Intelligence",
    title: weeklyQuestion,
    slides: [
      {
        bullets: [
          weeklySlideBullets[0],
        ],
        eyebrow: "Weekly Intelligence",
        footer: "Institutional Research · Weekly Intelligence",
        id: "cover",
        subtitle: "本週不是新聞加總，而是市場轉折。",
        title: weeklyQuestion,
      },
      {
        bullets: weeklySignals,
        eyebrow: "Market Review",
        id: "market_review",
        title: "What Changed This Week",
      },
      {
        bullets: [
          weeklySlideBullets[2],
          "AI 驗證｜觀察 earnings、guidance、capex、cloud 與 data center 需求是否同步支持估值。",
        ],
        eyebrow: "AI / Tech Weekly",
        id: "ai_tech_watch",
        title: "The One Thing That Matters",
      },
      {
        bullets: weeklyCatalysts,
        eyebrow: "Next Week Catalysts",
        id: "top_news",
        title: "下週催化",
      },
      {
        bullets: [
          ...weeklyViewBullets,
        ],
        eyebrow: "I-Xuan Weekly View",
        footer: `${weeklyCta} · ${weeklyTarget} · app.ixuan.ai`,
        id: "weekly_view",
        title: "一玄週觀點",
      },
    ],
  };
}
