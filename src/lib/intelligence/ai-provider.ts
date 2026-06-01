import "server-only";

import { log } from "@/src/lib/log";
import type {
  DailyIntelligenceFeedItem,
  DailyIntelligenceProviderErrorReason,
  MarketRegime,
} from "@/src/types/editorial";
import type { NewsIntakeMode, NormalizedNewsItem } from "@/src/types/news";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_NEWS_ITEMS = 16;
const MAX_TITLE_LENGTH = 180;
const MAX_SUMMARY_LENGTH = 320;

export type AIDailyIntelligenceResult = {
  headline: string;
  marketSummary: string;
  riskFocus: {
    title: string;
    summary: string;
  };
  intelligenceFeed: DailyIntelligenceFeedItem[];
  marketRegimeNote: string;
  marketRegime: MarketRegime;
  aiTechObservation: string;
  cryptoObservation: string;
  macroRatesObservation: string;
  whatToMonitor: string[];
  sourceMode: NewsIntakeMode;
  generatedAt: string;
};

export type DailyIntelligenceAIContext = {
  sourceMode?: NewsIntakeMode;
  generatedAt?: string;
  sessionLabel?: "Asia Session" | "US Futures" | "Pre-market";
};

export class AIProviderError extends Error {
  reason: DailyIntelligenceProviderErrorReason;

  constructor(message: string, reason: DailyIntelligenceProviderErrorReason = "unknown_error") {
    super(message);
    this.name = "AIProviderError";
    this.reason = reason;
  }
}

export function getOpenAIProviderConfig() {
  return {
    openAIKeyDetected: Boolean(process.env.OPENAI_API_KEY?.trim()),
    model: process.env.OPENAI_DAILY_INTELLIGENCE_MODEL ?? DEFAULT_MODEL,
  };
}

function errorReasonFromStatus(status: number): DailyIntelligenceProviderErrorReason {
  if (status === 401 || status === 403) {
    return "invalid_api_key";
  }

  if (status === 402 || status === 429) {
    return "insufficient_quota";
  }

  if (status === 400 || status === 404) {
    return "model_error";
  }

  return "unknown_error";
}

function truncateText(value: string | undefined, maxLength: number) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

function sanitizeNewsItems(newsItems: NormalizedNewsItem[]) {
  return newsItems.slice(0, MAX_NEWS_ITEMS).map((item) => ({
    title: truncateText(item.title, MAX_TITLE_LENGTH),
    summary: truncateText(item.summary, MAX_SUMMARY_LENGTH),
    category: item.category,
    sourceLabel: item.sourceLabel,
    publishedAt: item.publishedAt,
    tags: item.tags?.slice(0, 5) ?? [],
  }));
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 6);

  return normalized.length ? normalized : fallback;
}

function normalizeMarketRegime(value: unknown): MarketRegime {
  if (value === "risk-on" || value === "risk-off" || value === "mixed") {
    return value;
  }

  return "mixed";
}

function normalizeFeedItems(value: unknown): DailyIntelligenceFeedItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;

      return {
        category: asString(record.category, "risk"),
        title: asString(record.title, "市場訊號仍需人工審閱"),
        summary: asString(record.summary, "來源覆蓋不足，請由 editor 補充判讀。"),
        updatedLabel: asString(record.updatedLabel, `Updated ${8 + index * 4} mins ago`),
      };
    })
    .filter((item): item is DailyIntelligenceFeedItem => Boolean(item))
    .slice(0, 5);
}

function extractJson(content: string) {
  const trimmed = content.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  return match?.[0] ?? trimmed;
}

function normalizeAIResponse(
  parsed: Record<string, unknown>,
  context: DailyIntelligenceAIContext,
): AIDailyIntelligenceResult {
  const generatedAt = context.generatedAt ?? new Date().toISOString();
  const sourceMode = context.sourceMode ?? "fallback";
  const fallbackMonitor = [
    "美債殖利率與美元是否同步上行",
    "AI 科技股領漲廣度是否擴散",
    "BTC / ETH 是否反映風險偏好轉折",
  ];

  return {
    headline: asString(parsed.headline, "今日市場訊號偏混合，需以風險優先判讀"),
    marketSummary: asString(
      parsed.marketSummary,
      "IXAI 根據公開新聞標題與摘要整理今日市場脈絡；目前來源覆蓋有限，發布前需人工審閱。",
    ),
    riskFocus: {
      title: asString(
        (parsed.riskFocus as Record<string, unknown> | undefined)?.title,
        "今日風險焦點仍需人工確認",
      ),
      summary: asString(
        (parsed.riskFocus as Record<string, unknown> | undefined)?.summary,
        "若來源覆蓋不足，應避免過度推論單一市場敘事。",
      ),
    },
    intelligenceFeed: normalizeFeedItems(parsed.intelligenceFeed),
    marketRegimeNote: asString(
      parsed.marketRegimeNote,
      "市場 regime 尚未出現單一明確方向，需同步觀察利率、美元、VIX 與科技股廣度。",
    ),
    marketRegime: normalizeMarketRegime(parsed.marketRegime),
    aiTechObservation: asString(
      parsed.aiTechObservation,
      "AI / Tech 訊號不足，需等待更多來源確認。",
    ),
    cryptoObservation: asString(
      parsed.cryptoObservation,
      "Crypto 訊號不足，需觀察 BTC / ETH 對流動性變化的反應。",
    ),
    macroRatesObservation: asString(
      parsed.macroRatesObservation,
      "總經與利率來源覆蓋有限，需人工補充 Fed、殖利率與美元脈絡。",
    ),
    whatToMonitor: asStringArray(parsed.whatToMonitor, fallbackMonitor),
    sourceMode,
    generatedAt,
  };
}

function buildSystemPrompt() {
  return [
    "你是 IXAI 的 Daily Intelligence editor，負責把公開新聞標題、摘要與來源標籤整理成待人工審閱的金融情報草稿。",
    "輸出必須是繁體中文，語氣 professional、institutional、concise、risk-first。",
    "只能使用使用者提供的 headlines、summaries、source labels、categories 與 timestamps，不得發明新事實、數字、報價、事件或來源。",
    "不得提供買賣指令、投資建議、報酬承諾、喊單語氣或誇張 hype。",
    "如果來源覆蓋不足或偏向單一題材，必須明確說明 coverage weak / 來源覆蓋有限，並降低推論強度。",
    "Daily Brief 不是新聞列表；請先回答今天市場最重要的訊號，再把新聞轉成市場解讀。",
    "請用 Event Extraction → Signal Extraction → Tension / Change Detection → Insight Generation 的思路產出內容。",
    "每段都必須回答：發生什麼、透露什麼訊號、矛盾或變化在哪裡、下一步觀察什麼。",
    "I-Xuan View 風格應是 2 到 4 句完整繁體中文觀點，不得貼新聞標題、英文殘句或模板文字。",
    "只回傳 JSON object，不要 markdown，不要額外說明。",
  ].join("\n");
}

function buildUserPrompt(newsItems: ReturnType<typeof sanitizeNewsItems>, context: DailyIntelligenceAIContext) {
  return JSON.stringify(
    {
      task: "Generate an IXAI Daily Intelligence Draft for editorial review.",
      outputSchema: {
        headline: "string",
        marketSummary: "string",
        riskFocus: { title: "string", summary: "string" },
        intelligenceFeed: [
          {
            category: "macro | rates | equities | ai_tech | crypto | taiwan | semiconductors | risk | geopolitics",
            title: "string",
            summary: "string",
            updatedLabel: "string, e.g. Updated 12 mins ago",
          },
        ],
        marketRegimeNote: "string",
        marketRegime: "risk-on | risk-off | mixed",
        aiTechObservation: "string",
        cryptoObservation: "string",
        macroRatesObservation: "string",
        whatToMonitor: ["string"],
      },
      rules: [
        "Headline is the public Daily title and the source for social stop-scroll hook; keep it specific to the strongest daily theme.",
        "MarketSummary should start with today's most important market signal, then connect macro, AI/Tech, Crypto and risk regime.",
        "RiskFocus should explain the core risk awareness point, not a trading action.",
        "Keep each feed item summary to 1 concise sentence, but include why it matters and what to watch.",
        "Return 3 to 5 intelligenceFeed items.",
        "Return 3 to 5 whatToMonitor items.",
        "Use weak coverage language if newsItems are sparse or concentrated.",
        "Daily Intelligence should be interpretation-first: market signal, three important things, market interpretation, investor watchpoints, then source details.",
        "Do not summarize headlines directly; extract events, market signals, narrative tension, what changed, why it matters, and what to watch next.",
        "I-Xuan View must be an insight paragraph, not a news recap.",
        "Avoid generic filler such as 今日市場焦點已整理為公開情報與風險觀察.",
        "Avoid generic CTA wording such as 完整內容請見 IXAI App.",
        "Never output Short Insight, Observation 1, Observation 2, or Observation 3.",
        "Never use buy, sell, add exposure, reduce exposure, target price, guaranteed return, or trading signal language.",
      ],
      context,
      newsItems,
    },
    null,
    2,
  );
}

async function requestStructuredDraft(
  apiKey: string,
  newsItems: ReturnType<typeof sanitizeNewsItems>,
  context: DailyIntelligenceAIContext,
) {
  const { model } = getOpenAIProviderConfig();
  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(newsItems, context) },
      ],
    }),
  });

  if (!response.ok) {
    throw new AIProviderError(
      `OpenAI request failed with status ${response.status}`,
      errorReasonFromStatus(response.status),
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new AIProviderError("OpenAI response did not include content.", "model_error");
  }

  try {
    return JSON.parse(extractJson(content)) as Record<string, unknown>;
  } catch (error) {
    throw new AIProviderError(
      error instanceof Error ? `OpenAI JSON parse failed: ${error.message}` : "OpenAI JSON parse failed.",
      "json_parse_error",
    );
  }
}

export async function generateDailyIntelligenceWithAI(
  newsItems: NormalizedNewsItem[],
  context: DailyIntelligenceAIContext = {},
): Promise<AIDailyIntelligenceResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new AIProviderError("OPENAI_API_KEY is not configured.", "missing_key");
  }

  const generatedAt = context.generatedAt ?? new Date().toISOString();
  const normalizedContext: DailyIntelligenceAIContext = {
    ...context,
    generatedAt,
    sourceMode: context.sourceMode ?? "fallback",
  };
  const sanitized = sanitizeNewsItems(newsItems);

  try {
    return normalizeAIResponse(
      await requestStructuredDraft(apiKey, sanitized, normalizedContext),
      normalizedContext,
    );
  } catch (firstError) {
    log.warn("[IXAI] OpenAI Daily Intelligence generation retrying after parse/request error.", {
      message: firstError instanceof Error ? firstError.message : "Unknown OpenAI provider error",
    });

    return normalizeAIResponse(
      await requestStructuredDraft(apiKey, sanitized, normalizedContext),
      normalizedContext,
    );
  }
}
