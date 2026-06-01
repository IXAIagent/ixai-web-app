import type { DailyBriefDraft, WeeklyIntelligenceDraft } from "@/src/types/editorial";
import { getDailyIntelligenceCoreFromBrief } from "@/src/lib/intelligence/core";
import { ensureDistinctNarratives } from "@/src/lib/intelligence/insight/repetition-detector";

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

const APP_URL = "app.ixuan.ai";
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

function compactText(value?: string, fallback = "IXAI 已整理今日市場脈絡與風險觀察。", maxLength = 74) {
  const normalized = normalizeSocialCopy(value, fallback)
    .replace(/([，。！？；])\s*[，。]+/g, "$1")
    .replace(/([。！？；])，/g, "$1");

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

  return output ? (/[。！？.!?；;]$/.test(output) ? output : `${output}。`) : fallback;
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

function socialPoint(label: string, value?: string, fallback = "維持市場脈絡與風險觀察。", maxLength = 38) {
  return `${label}｜${readableSnippet(value, fallback, maxLength)}`;
}

function evidenceSocialPoint(label: string, evidence?: { event: string; source: string; whyItMatters: string }) {
  if (!evidence) {
    return `${label}｜等待 editor 補充具體事件與來源。`;
  }

  return `${label}｜${readableSnippet(evidence.event, "具體事件待 editor 審閱。", 54)} ${readableSnippet(evidence.whyItMatters, "此事件用來驗證市場主線。", 54)}`;
}

function evidenceLabel(category?: string, fallback = "Evidence") {
  if (category === "macro") return "Macro";
  if (category === "ai-tech") return "AI / Tech";
  if (category === "taiwan") return "Taiwan";
  if (category === "crypto") return "Crypto";
  if (category === "risk") return "Risk";
  return fallback;
}

function firstItems<T>(items: T[] | undefined, count: number) {
  return Array.isArray(items) ? items.slice(0, count) : [];
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

function appHref(target?: string) {
  if (!target) {
    return "https://app.ixuan.ai/daily-brief";
  }

  if (/^https?:\/\//i.test(target)) {
    return target;
  }

  return `https://app.ixuan.ai${target.startsWith("/") ? target : `/${target}`}`;
}

function buildDailyCaption() {
  return [
    "【一玄每日 AI 投資日報】",
    "今日重點不是新聞數量，而是市場正在要求什麼證據：",
    "・今天最大事件",
    "・市場訊號與風險拉扯",
    "・AI / Tech 與 FCN awareness",
    "・一玄觀點",
    "想看完整市場訊號與下一步觀察，請進 IXAI App 讀 Daily Brief：",
    APP_URL,
    DISCLAIMER,
  ].join("\n");
}

function buildWeeklyCaption() {
  return [
    "【一玄每週 AI 投資週報】",
    "本週重點不是單日新聞加總，而是市場敘事的轉折：",
    "・本週最大市場轉折",
    "・三個市場訊號",
    "・AI / Tech 主線",
    "・Risk / FCN awareness",
    "想看完整市場訊號與下週觀察，請進 IXAI App 讀 Weekly Intelligence：",
    APP_URL,
    DISCLAIMER,
  ].join("\n");
}

export function generateDailySocialPack(source?: DailyBriefDraft | null): SocialIntelligencePack {
  const dateLabel = formatDateLabel(source?.publishedAt ?? source?.updatedAt);
  const core = source ? getDailyIntelligenceCoreFromBrief(source) : null;
  const insight = source?.intelligence?.insight;
  const questionDriven = insight?.questionDriven;
  const dailyEvidence = questionDriven?.evidenceDetails ?? [];
  const socialTitle = questionDriven?.centralQuestion ?? insight?.socialFunnel.hook ?? core?.headlineHook ?? source?.title ?? "今天市場真正要問什麼？";
  const rawShortAnswer = readableSnippet(
    questionDriven?.keyAnswer ?? insight?.socialFunnel.payoff ?? core?.conversionHook,
    "資金沒有離開主線，但開始要求更清楚的獲利證據。",
    54,
  );
  const shortAnswer = /市場脈絡|值得點進去看|整理/.test(rawShortAnswer)
    ? "市場焦點正從價格，轉向利率、AI 與風險承擔。"
    : rawShortAnswer;
  const marketSeeing = firstItems(
    dailyEvidence.length
      ? dailyEvidence.map((item) =>
          `${evidenceLabel(item.category, "Event")}｜${readableSnippet(item.event, "具體事件待 editor 審閱。", 32)}：${readableSnippet(item.whyItMatters, "這是市場驗證主線的證據。", 42)}`,
        )
      : [
          socialPoint("Macro", source?.intelligence?.macroWatch?.whatHappened, "利率與美元仍是估值錨點。", 34),
          socialPoint("AI", source?.intelligence?.aiTechWatch?.observations?.[0], "AI 需求需要訂單與現金流驗證。", 34),
          socialPoint("Taiwan", source?.sections[0]?.headline, "台灣供應鏈仍是 AI trade 映射。", 34),
        ],
    3,
  );
  const riskCopy = readableSnippet(
    questionDriven?.counterEvidence[0] ?? insight?.narrativeTension ?? core?.socialHooks.riskHook,
    "真正風險不是主線消失，而是利率讓估值容錯率下降。",
    70,
  );
  const riskSupport = source?.intelligence?.fcnAwareness
    ? `FCN｜${source.intelligence.fcnAwareness.topic}：${readableSnippet(source.intelligence.fcnAwareness.explanation, "理解 KO / KI / Worst Performer。", 44)}`
    : "FCN｜理解 KO / KI / Worst Performer，不做個人化判斷。";
  const watchItems = firstItems(
    [
      ...(questionDriven?.watchNext?.length
        ? questionDriven.watchNext
        : [
            core?.socialHooks.aiTechSignal.watchNext,
            ...(source?.intelligence?.investorWatchpoints ?? []),
            source?.intelligence?.cryptoWatch?.observations?.[0],
          ]),
      "AI 軟體需求能否接棒半導體。",
      "雲端資本支出是否同步上修。",
      "半導體訂單能否延續強度。",
    ].filter((item): item is string => Boolean(item)),
    3,
  )
    .filter((item): item is string => Boolean(item))
    .map((item, index) => `Watch ${index + 1}｜${readableSnippet(item, "觀察證據是否同步上修。", 36)}`);
  const dailyInsight = readableSnippet(questionDriven?.ixuanView ?? insight?.ixuanView ?? core?.socialHooks.ixuanHook ?? dailyIxuanView(source), "下一階段贏家不是最會講故事，而是最能把需求變成現金流的公司。", 110);
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
    caption: buildDailyCaption(),
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
          `Risk State｜${source?.intelligence?.riskRegimeReasoning?.current ?? "Elevated"}`,
          `Reason 1｜${dailySlideBullets[2]}`,
          riskSupport,
        ],
        eyebrow: "Risk Contrast",
        id: "fcn_risk_watch",
        title: "真正的風險",
      },
      {
        bullets: watchItems.length ? watchItems : ["AI software 是否接棒。", "Cloud spending 是否上修。", "Semiconductor orders 是否延續。"],
        eyebrow: "Watch Next",
        id: "market_review",
        title: "接下來看什麼？",
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
  const weeklyEvidence = questionDriven?.evidenceDetails ?? [];
  const weeklyView =
    questionDriven?.ixuanView ??
    insight?.ixuanView ??
    periodic?.ixuanView ??
    source?.sections.intelligenceSummary.pricing ??
    source?.aiSuggestion.intelligenceNarrative ??
    "本週核心不在單一新聞，而是利率、AI 科技與風險偏好如何共同改變市場定價。";
  const weeklyTarget = source?.slug ? `/weekly-brief/${source.slug}` : "/weekly-brief";
  const weeklyHref = appHref(weeklyTarget);
  const weeklyCta = insight?.socialFunnel.cta ?? periodic?.clearCTA ?? "想看本週證據、反證與下週觀察，請進 IXAI App 讀 Weekly Intelligence。";
  const weeklySignals = firstItems(
    weeklyEvidence.length
      ? weeklyEvidence.map((item) => evidenceSocialPoint(evidenceLabel(item.category, "Event"), item))
      : source?.sections.majorEvents?.length
      ? source.sections.majorEvents.map((event) => `${event.label}｜${event.title}：${event.whyItMatters}`)
      : [
          "Macro｜利率與美元仍牽動風險偏好。",
          "AI / Tech｜AI 科技主線需要財報與資本支出驗證。",
          "Risk｜Crypto 與高 beta 資產維持波動觀察。",
        ],
    3,
  );
  const weeklyRisk =
    periodic?.riskNarrative ??
    source?.sections.intelligenceSummary.riskTone ??
    "本週風險環境以波動、利率與美元節奏為核心。";
  const weeklyNextWeek = (
    questionDriven?.watchNext.length
      ? questionDriven.watchNext.slice(0, 3)
      : source?.sections.upcomingWeek?.length
      ? source.sections.upcomingWeek.slice(0, 3).map((event) => `${event.date}｜${event.title}：${event.whyItMatters}`)
      : source?.sections.nextWeekFocus?.slice(0, 3) ?? []
  );
  const weeklyCatalysts = firstItems(
    weeklyNextWeek.length
      ? weeklyNextWeek
      : [
          "利率資料｜觀察通膨與殖利率是否繼續壓縮估值容錯率。",
          "科技財報｜觀察 cloud capex 與 AI 訂單能否支持現金流敘事。",
          "台灣供應鏈｜觀察 AI server 與半導體訂單是否同步上修。",
        ],
    3,
  ).map((item, index) => (item.includes("｜") ? item : `Catalyst ${index + 1}｜${item}`));
  const weeklyQuestion = questionDriven?.centralQuestion ?? insight?.socialFunnel.hook ?? periodic?.socialHook ?? "本週市場最大轉折是什麼？";
  const weeklyAnswer = readableSnippet(
    questionDriven?.keyAnswer ?? insight?.socialFunnel.payoff ?? periodic?.mainNarrative,
    "市場正在從題材熱度，轉向能否交出現金流證據。",
    58,
  );
  const oneThing = readableSnippet(
    questionDriven?.whatChangesMyMind[0] ?? questionDriven?.keyAnswer ?? periodic?.mainNarrative,
    "真正重要的是企業 guidance、資本支出與訂單能否接上敘事。",
    78,
  );
  const riskLine = readableSnippet(
    questionDriven?.counterEvidence[0] ?? weeklyRisk,
    "若利率、美元或財報 guidance 不配合，估值容錯率會下降。",
    60,
  );
  const weeklySlideBullets = ensureDistinctNarratives(
    [
      weeklyAnswer,
      weeklySignals.join(" "),
      oneThing,
      weeklyNextWeek[0] ?? "",
      weeklyView,
    ],
    [
      "本週市場真正的變化，是資金開始把故事和證據分開定價。",
      "本週三個訊號分別來自總經、AI 科技與高 beta 風險資產。",
      "一件最重要的事：AI 故事要接受現金流與 guidance 驗證。",
      "下週觀察法說、通膨與利率是否支持科技估值。",
      "一玄週觀點：看誰能把 AI 變成財報，而不是誰最會講 AI。",
    ],
  );

  return {
    caption: buildWeeklyCaption(),
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
        title: "本週改變了什麼？",
      },
      {
        bullets: [
          weeklySlideBullets[2],
          riskLine,
        ],
        eyebrow: "AI / Tech Weekly",
        id: "ai_tech_watch",
        title: "最重要的一件事",
      },
      {
        bullets: weeklyCatalysts,
        eyebrow: "Next Week Catalysts",
        id: "top_news",
        title: "下週催化",
      },
      {
        bullets: [
          compactText(weeklySlideBullets[4], "本週核心觀點：理解市場正在 pricing 什麼，比追逐單點新聞更重要。", 132),
          weeklyCta,
        ],
        eyebrow: "I-Xuan Weekly View",
        footer: `${weeklyCta} · ${weeklyTarget} · app.ixuan.ai`,
        id: "weekly_view",
        title: "一玄週觀點",
      },
    ],
  };
}
