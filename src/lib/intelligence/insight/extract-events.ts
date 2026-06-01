import type { IXAIInsightCategory, IXAIKeyEvent } from "@/src/lib/intelligence/insight/types";
import type { NewsCategory, NormalizedNewsItem } from "@/src/types/news";

const CATEGORY_MAP: Record<NewsCategory, IXAIInsightCategory> = {
  ai_tech: "ai-tech",
  crypto: "crypto",
  equities: "ai-tech",
  geopolitics: "risk",
  macro: "macro",
  rates: "macro",
  risk: "risk",
  semiconductors: "ai-tech",
  taiwan: "taiwan",
};

const CATEGORY_PRIORITY: IXAIInsightCategory[] = ["macro", "ai-tech", "taiwan", "crypto", "risk", "fcn"];

function clean(value?: string) {
  return (value ?? "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .replace(/Short Insight|Observation\s*\d+/gi, "")
    .trim();
}

function clampSentence(value: string | undefined, fallback: string, maxLength = 92) {
  const normalized = clean(value) || fallback;

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

function isMostlyEnglish(value: string) {
  const letters = (value.match(/[A-Za-z]/g) ?? []).length;
  const cjk = (value.match(/[\u4e00-\u9fff]/g) ?? []).length;
  return letters > 18 && cjk < Math.max(6, letters * 0.2);
}

function eventWhyItMatters(item: NormalizedNewsItem, category: IXAIInsightCategory) {
  if (category === "macro") {
    return "利率、美元與通膨訊號會改變科技股估值、Crypto 流動性與整體風險偏好。";
  }

  if (category === "ai-tech") {
    return "AI / Tech 事件能判斷資金是否仍相信企業 AI 支出與半導體供應鏈延續。";
  }

  if (category === "taiwan") {
    return "台灣 AI 供應鏈是全球 AI 資本支出的實體延伸，會影響台股與科技風險溫度。";
  }

  if (category === "crypto") {
    return "Crypto 仍是流動性與高 beta 風險偏好的敏感溫度計。";
  }

  if (category === "risk") {
    return "風險事件會測試市場廣度、波動率與高估值資產的容錯率。";
  }

  return "FCN 相關內容用於理解結構與波動，不是個人化產品判斷。";
}

function inferInsightCategory(item: NormalizedNewsItem): IXAIInsightCategory {
  const text = `${item.category} ${item.title} ${item.summary ?? ""} ${item.sourceLabel} ${item.tags?.join(" ") ?? ""}`;

  if (/bitcoin|btc|ethereum|eth|crypto|stablecoin|coinbase|加密|比特幣|流動性/i.test(text)) {
    return "crypto";
  }

  if (/ai|nvidia|nvda|semiconductor|chip|cloud|software|bull|鴻海|半導體|晶片|雲端|企業軟體|供應鏈/i.test(text)) {
    return /taiwan|tsmc|台股|台積|鴻海|供應鏈/i.test(text) ? "taiwan" : "ai-tech";
  }

  if (/fed|powell|rate|yield|treasury|inflation|cpi|dollar|homebuilder|利率|殖利率|美元|通膨/i.test(text)) {
    return "macro";
  }

  if (/risk|volatility|vix|credit|geopolitic|波動|風險|地緣/i.test(text)) {
    return "risk";
  }

  return CATEGORY_MAP[item.category] ?? "risk";
}

function eventTitle(item: NormalizedNewsItem, category: IXAIInsightCategory) {
  if (!isMostlyEnglish(item.title)) {
    return clampSentence(item.title, "公開市場事件需要人工審閱。", 72);
  }

  const text = `${item.title} ${item.summary ?? ""}`;

  if (/nvidia|meta|schlumberger|adopting ai|ai-driven enterprise/i.test(text)) {
    return "大型企業 AI 採用進度成為本週檢查 AI 現金流的線索。";
  }

  if (/binance.*stocks|tokenized equities|stock and ETF trading/i.test(text)) {
    return "Binance 推出美股與 ETF 交易，Crypto 與傳統資產邊界再靠近。";
  }

  if (/crypto ETP outflows|outflows|redemption streak|CoinShares/i.test(text)) {
    return "Crypto ETP 連續流出，流動性風險沒有消失。";
  }

  if (/cpi|inflation|treasury|yield|fed|dollar/i.test(text)) {
    return "利率、通膨與美元仍在檢查高估值資產的容錯率。";
  }

  if (category === "macro") {
    return "利率、美元或總經訊號正在影響市場定價。";
  }

  if (category === "ai-tech") {
    return "AI / Tech 主線仍在接受資金與基本面驗證。";
  }

  if (category === "taiwan") {
    return "台灣 AI 供應鏈仍是市場觀察焦點。";
  }

  if (category === "crypto") {
    return "Crypto 流動性與監管主題仍在變動。";
  }

  return "風險偏好與波動環境需要重新檢視。";
}

export function extractInsightEvents(newsItems: NormalizedNewsItem[]): IXAIKeyEvent[] {
  const selected: IXAIKeyEvent[] = [];
  const seenCategories = new Set<IXAIInsightCategory>();
  const seenInputTitles = new Set<string>();
  const seenOutputTitles = new Set<string>();
  const items = [...newsItems].sort((a, b) => {
    const categoryA = inferInsightCategory(a);
    const categoryB = inferInsightCategory(b);
    return CATEGORY_PRIORITY.indexOf(categoryA) - CATEGORY_PRIORITY.indexOf(categoryB);
  });

  const addEvent = (item: NormalizedNewsItem, requireNewCategory: boolean) => {
    const category = inferInsightCategory(item);
    const normalizedInputTitle = clean(item.title).toLowerCase();
    const title = eventTitle(item, category);
    const normalizedOutputTitle = clean(title).toLowerCase();

    if (seenInputTitles.has(normalizedInputTitle) || seenOutputTitles.has(normalizedOutputTitle)) {
      return false;
    }

    if (requireNewCategory && seenCategories.has(category)) {
      return false;
    }

    selected.push({
      category,
      sourceContext: `${item.sourceLabel} · ${new Date(item.publishedAt).toLocaleDateString("zh-TW")}`,
      title,
      whyItMatters: clampSentence(eventWhyItMatters(item, category), "此事件有助於判斷市場主線與風險偏好。", 112),
    });
    seenCategories.add(category);
    seenInputTitles.add(normalizedInputTitle);
    seenOutputTitles.add(normalizedOutputTitle);
    return true;
  };

  for (const item of items) {
    addEvent(item, true);

    if (selected.length >= 5) {
      break;
    }
  }

  if (selected.length < 5) {
    for (const item of items) {
      addEvent(item, false);

      if (selected.length >= 5) {
        break;
      }
    }
  }

  if (selected.length > 0) {
    return selected;
  }

  return [
    {
      category: "macro",
      sourceContext: "Editorial fallback · public market context",
      title: "利率、AI 科技與風險偏好仍是主要觀察軸。",
      whyItMatters: "來源覆蓋有限時，IXAI 會降低推論強度，先建立風險優先的市場觀察框架。",
    },
    {
      category: "ai-tech",
      sourceContext: "Editorial fallback · public market context",
      title: "AI / Tech 主線需要更多事件驗證。",
      whyItMatters: "AI 敘事需要搭配資本支出、財報與供應鏈訊號一起判讀。",
    },
  ];
}
