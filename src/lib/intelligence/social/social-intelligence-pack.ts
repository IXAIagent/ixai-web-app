import type { DailyBriefDraft, WeeklyIntelligenceDraft } from "@/src/types/editorial";
import { ensureDistinctNarratives } from "@/src/lib/intelligence/insight/repetition-detector";
import {
  extractDailySocialIntelligence,
  extractWeeklySocialIntelligence,
} from "./brief-intelligence-extractor";

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

function compactNarrative(value?: string) {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .replace(/^[^｜]{1,36}｜/, "")
    .trim();
}

function comparableNarrative(value?: string) {
  return compactNarrative(value)
    .toLowerCase()
    .replace(/[｜:：，。！？!?\s/·、；;（）()]/g, "")
    .trim();
}

function isNearDuplicateNarrative(a?: string, b?: string) {
  const left = comparableNarrative(a);
  const right = comparableNarrative(b);

  if (!left || !right) return false;
  if (left === right) return true;

  const shorter = left.length < right.length ? left : right;
  const longer = left.length < right.length ? right : left;

  return shorter.length >= 18 && longer.includes(shorter);
}

function uniqueNarrativeBodies(items: Array<string | undefined | null>, fallbacks: string[], count: number) {
  const output: string[] = [];

  for (const item of [...items, ...fallbacks]) {
    const normalized = compactNarrative(item ?? undefined);
    if (normalized.length < 10) continue;
    if (output.some((existing) => isNearDuplicateNarrative(existing, normalized))) continue;
    output.push(normalized);
    if (output.length >= count) break;
  }

  return output;
}

function labeledNarrative(label: string, body?: string) {
  return `${label}｜${compactNarrative(body)}`;
}

function chooseNarrativeByPattern(items: string[], pattern: RegExp, fallback: string, used: string[] = []) {
  const candidates = [
    ...items.filter((item) => pattern.test(item)),
    fallback,
  ];

  return (
    uniqueNarrativeBodies(
      candidates.filter((item) => !used.some((existing) => isNearDuplicateNarrative(existing, item))),
      [fallback],
      1,
    )[0] ?? fallback
  );
}

export function generateDailySocialPack(source?: DailyBriefDraft | null): SocialIntelligencePack {
  const dateLabel = formatDateLabel(source?.publishedAt ?? source?.updatedAt);
  const extraction = extractDailySocialIntelligence(source);
  const insight = source?.intelligence?.insight;
  const socialTitle = extraction.centralQuestion;
  const marketSeeing = extraction.evidenceItems.map((item) => `${item.label}｜${item.whatHappened}`).slice(0, 3);
  const strategistBullets = extraction.evidenceItems.map((item) => `${item.label}｜${item.whatHappened} ${item.whyItMatters}`).slice(0, 3);
  const riskBullets = [
    `Risk State｜${extraction.riskRegime.state}`,
    `Why It Matters｜${extraction.riskRegime.trigger}`,
    `FCN Translation｜${extraction.fcnTranslation}`,
  ];
  const watchItems = extraction.watchNextItems.map((item, index) => {
    const labels = ["24h", "48h", "72h"];
    return `${labels[index] ?? "下步觀察"}｜${item}`;
  });
  const dailyTarget = source?.slug ? `/daily-brief/${source.slug}` : "/daily-brief";
  const dailyCta = insight?.socialFunnel.cta ?? source?.intelligence?.socialCTA ?? "想看今天的證據、反證與下一步觀察，請進 IXAI App 讀 Daily Brief。";
  const dailySlideBullets = ensureDistinctNarratives(
    [
      extraction.keyAnswer,
      marketSeeing.join(" "),
      extraction.riskRegime.trigger,
      watchItems.join(" "),
      extraction.iXuanViewAngle,
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
        bullets: strategistBullets,
        eyebrow: "What The Market Sees",
        footer: "人工審閱後供手動發布",
        id: "top_news",
        title: "市場看到了什麼？",
      },
      {
        bullets: [
          riskBullets[0],
          riskBullets[1],
          riskBullets[2],
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
  const extraction = extractWeeklySocialIntelligence(source);
  const weeklyTarget = source?.slug ? `/weekly-brief/${source.slug}` : "/weekly-brief";
  const weeklyHref = appHref(weeklyTarget);
  const weeklyCta = periodic?.clearCTA ?? "想看本週轉折、三個事件與下週催化，請進 IXAI App 讀 Weekly Intelligence。";
  const weeklySignals = extraction.evidenceItems
    .map((item) => labeledNarrative(item.label, item.whatHappened))
    .slice(0, 3);
  const weeklyChainBodies = uniqueNarrativeBodies(
    [
      `${extraction.crossMarketChain[0]?.narrative ?? ""} ${extraction.crossMarketChain[1]?.narrative ?? ""}`,
      `${extraction.crossMarketChain[2]?.narrative ?? ""} ${extraction.crossMarketChain[3]?.narrative ?? ""}`,
      `${extraction.crossMarketChain[4]?.narrative ?? ""} ${extraction.crossMarketChain[5]?.narrative ?? ""}`,
    ],
    [
      "FOMC / Powell 與利率預期會先改變美元、SPY / QQQ、BTC 與台股半導體的資金成本。",
      "AI guidance、earnings、capex 與台積電 / 2330 供應鏈決定 AI beta 能否擴散。",
      "BTC / ETH 波動會把風險傳導到 FCN worst-of basket、KO / KI 與籃子集中度。",
    ],
    3,
  );
  const weeklyChain = [
    labeledNarrative("Fed / Rates → USD", weeklyChainBodies[0]),
    labeledNarrative("AI Beta → Taiwan Semis", weeklyChainBodies[1]),
    labeledNarrative("Crypto → FCN Volatility", weeklyChainBodies[2]),
  ];
  const catalystBodies = uniqueNarrativeBodies(
    extraction.nextWeekCatalysts,
    [
      "FOMC / Powell｜觀察利率路徑是否改變美元、SPY / QQQ、BTC 與台股半導體風險定價。",
      "AI guidance / earnings｜觀察 NVDA、台積電 / 2330、cloud capex 是否支撐 AI beta。",
      "FCN volatility｜觀察 worst-of basket pressure、KO / KI 距離與籃子集中敏感度。",
    ],
    3,
  );
  const weeklyCatalysts = [
    labeledNarrative("FOMC / Powell", chooseNarrativeByPattern(catalystBodies, /FOMC|Powell|Fed|利率|美元|CPI|PCE/i, "觀察 FOMC / Powell 是否改變美元、SPY / QQQ、BTC 與台股半導體風險定價。")),
    labeledNarrative("AI guidance / earnings", chooseNarrativeByPattern(catalystBodies, /AI|NVDA|台積|2330|TSMC|guidance|指引|capex|cloud|data center|財報|半導體/i, "觀察 AI guidance、earnings、capex 與台積電 / 2330 供應鏈是否支撐 AI beta。")),
    labeledNarrative("FCN volatility", chooseNarrativeByPattern(catalystBodies, /FCN|KO|KI|worst|volatility|波動|籃子|BTC|ETH/i, "觀察 BTC / ETH、QQQ 與 FCN worst-of basket pressure、KO / KI 距離是否惡化。")),
  ];
  const aiTechCandidates = [
    extraction.aiEarningsPowerSignal,
    ...extraction.evidenceItems.map((item) => `${item.whatHappened} ${item.whyItMatters}`),
    weeklyCatalysts[1],
  ];
  const aiWhatHappened = chooseNarrativeByPattern(
    aiTechCandidates,
    /AI|semiconductor|半導體|NVDA|NVIDIA|TSMC|台積|2330|guidance|指引|capex|cloud|data center|財報|AI server/i,
    "AI earnings、guidance、capex 與台積電 / 2330 供應鏈是本週檢驗 AI beta 的主要證據。",
  );
  const aiWhyItMatters = chooseNarrativeByPattern(
    [
      "如果 guidance 與 capex 不能支撐估值，高 beta 科技股會重新檢驗獲利容錯率。",
      extraction.crossMarketChain[2]?.narrative,
      extraction.crossMarketChain[3]?.narrative,
    ],
    /valuation|估值|earnings|獲利|AI beta|guidance|capex|台積|2330|semiconductor|半導體/i,
    "如果 guidance 與 capex 不能支撐估值，高 beta 科技股會重新檢驗獲利容錯率。",
    [aiWhatHappened],
  );
  const aiWatchNext = chooseNarrativeByPattern(
    weeklyCatalysts,
    /AI|NVDA|台積|2330|TSMC|guidance|指引|capex|cloud|data center|財報|半導體/i,
    "下週觀察 AI guidance、台積電 / 2330 與半導體供應鏈是否同步上修。",
    [aiWhatHappened, aiWhyItMatters],
  );
  const weeklyStrategist = [
    labeledNarrative("What Happened", aiWhatHappened),
    labeledNarrative("Why It Matters", aiWhyItMatters),
    labeledNarrative("Watch Next", aiWatchNext),
  ];
  const weeklyQuestion = extraction.centralQuestion;
  const weeklyViewBodies = uniqueNarrativeBodies(
    [
      extraction.iXuanWeeklyViewAngle,
      extraction.weeklyChange,
      extraction.fcnTranslation,
      weeklyCatalysts.join(" "),
    ],
    [
      "市場觀點：本週先看 Fed / USD 是否限制 AI beta，並用台積電 / 2330 與 QQQ 驗證資金承接。",
      "風險觀點：若 BTC / ETH 與高 beta 科技股波動同步升高，FCN worst-of basket 與 KO / KI 距離要提高警覺。",
      "下週觀察：FOMC / Powell、AI guidance / capex、台積電 / 2330 與 FCN volatility 是否同向驗證。",
    ],
    3,
  );
  const weeklyViewBullets = [
    labeledNarrative("市場觀點", weeklyViewBodies[0]),
    labeledNarrative("風險觀點", weeklyViewBodies[1]),
    labeledNarrative("下週觀察", weeklyViewBodies[2]),
  ];
  const weeklySlideBullets = ensureDistinctNarratives(
    [
      extraction.coreThesis,
      weeklySignals.join(" "),
      extraction.aiEarningsPowerSignal,
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
        bullets: weeklyChain,
        eyebrow: "Market Review",
        id: "market_review",
        title: "What Changed This Week",
      },
      {
        bullets: weeklyStrategist,
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
