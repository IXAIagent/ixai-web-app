import type { IXAIEvidenceItem, IXAIInsightCategory } from "@/src/lib/intelligence/insight/types";
import type { NormalizedNewsItem } from "@/src/types/news";

const GENERIC_EVIDENCE_PATTERNS = [
  /利率正在影響市場/,
  /美元正在影響市場/,
  /投資人持續觀察/,
  /市場情緒變化/,
  /AI 主線仍在接受驗證/,
  /風險偏好受到壓力/,
  /市場開始要求證據/,
  /市場訊號正在轉向/,
];

const NAMED_ENTITY_PATTERN =
  /NVIDIA|NVDA|Meta|META|Schlumberger|SLB|Binance|Bitcoin|BTC|Ethereum|ETH|MediaTek|2454|CPI|Treasury|Fed|Oracle|ORCL|CoinShares|TSMC|台積|聯準會|美元|美債|殖利率|通膨|法說|財報|外資|台股|ETF/i;

const CATALYST_PATTERN =
  /Computex|GTC|earnings|guidance|revenue|capex|CPI|inflation|Treasury|yield|ETF|outflow|inflow|法說|財報|營收|訂單|資本支出|殖利率|通膨|外流|流入|出貨/i;

function clean(value?: string) {
  return (value ?? "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isGeneric(value: string) {
  return GENERIC_EVIDENCE_PATTERNS.some((pattern) => pattern.test(value));
}

function isMostlyEnglish(value: string) {
  const letters = (value.match(/[A-Za-z]/g) ?? []).length;
  const cjk = (value.match(/[\u4e00-\u9fff]/g) ?? []).length;
  return letters > 18 && cjk < Math.max(6, letters * 0.2);
}

function evidenceCategory(item: NormalizedNewsItem): IXAIInsightCategory {
  const text = `${item.category} ${item.title} ${item.summary ?? ""} ${item.tags?.join(" ") ?? ""}`;

  if (/fed|cpi|inflation|treasury|yield|dollar|rate|利率|殖利率|美元|通膨/i.test(text)) {
    return "macro";
  }

  if (/bitcoin|btc|ethereum|eth|crypto|stablecoin|coinshares|binance|加密|比特幣/i.test(text)) {
    return "crypto";
  }

  if (/mediatek|2454|tsmc|台積|聯發科|AI.*供應鏈|供應鏈|矽光子|背板/i.test(text)) {
    return "taiwan";
  }

  if (/\bai\b|nvidia|nvda|meta|oracle|semiconductor|software|cloud|computex|晶片|半導體|雲端|企業軟體/i.test(text)) {
    return "ai-tech";
  }

  if (/risk|volatility|vix|credit|波動|風險/i.test(text)) {
    return "risk";
  }

  return "risk";
}

function eventFromItem(item: NormalizedNewsItem) {
  const text = `${item.title} ${item.summary ?? ""}`;
  const title = clean(item.title);

  if (/Nvidia, Meta and Schlumberger rank among top companies adopting AI/i.test(text)) {
    return "NVIDIA、Meta、Schlumberger 被列為 S&P 500 中 AI 採用度較高的企業。";
  }

  if (/Binance adds over 7,000 US stocks and ETFs/i.test(text)) {
    return "Binance 向非美國用戶新增超過 7,000 檔美股與 ETF 交易。";
  }

  if (/crypto ETP outflows|redemption streak|CoinShares|Bitcoin ETF Losses/i.test(text)) {
    return "CoinShares 指出全球 crypto ETP 上週流出約 16.7 億美元，贖回潮延續三週。";
  }

  if (/MediaTek|2454|聯發科/i.test(text)) {
    return "MediaTek 法說與出貨數據窗口將成為台灣 AI 供應鏈驗證點。";
  }

  if (/CPI|inflation|通膨/i.test(text)) {
    return "美國 CPI 將重新校準市場對利率與科技股估值的假設。";
  }

  if (/Treasury yields|yield/i.test(text)) {
    return "美債殖利率因地緣風險與政策預期重新定價而走高。";
  }

  if (/矽光子|台積電|AI爆炸性成長/i.test(text)) {
    return "台積電表示矽光子逐漸成熟並將走向量產，以承接 AI 成長需求。";
  }

  if (/AI背板|高通|25家台廠供應鏈/i.test(text)) {
    return "高通點名台積電領軍的 AI 背板與台廠供應鏈。";
  }

  if (!isMostlyEnglish(title)) {
    return title.endsWith("。") ? title : `${title}。`;
  }

  return title.endsWith(".") || title.endsWith("。") ? title : `${title}.`;
}

function whyItMattersFromItem(item: NormalizedNewsItem, category: IXAIInsightCategory) {
  const text = `${item.title} ${item.summary ?? ""}`;

  if (/Nvidia|Meta|Schlumberger|adopting AI/i.test(text)) {
    return "這把 AI 交易從晶片供給推向企業採用與營運效率，市場會開始要求 AI 變成可驗證的收入或成本改善。";
  }

  if (/Binance adds over 7,000 US stocks|tokenized equities/i.test(text)) {
    return "這顯示 crypto 平台正在把傳統資產納入交易入口，會影響風險偏好、監管想像與流動性邊界。";
  }

  if (/crypto ETP outflows|CoinShares/i.test(text)) {
    return "資金連續流出代表 crypto 反彈需要更多流動性證據，不能只看價格波動。";
  }

  if (/Bitcoin ETF Losses/i.test(text)) {
    return "ETF 資金轉負代表市場需要看到新增買盤，而不只是價格反彈。";
  }

  if (/MediaTek|2454|聯發科/i.test(text)) {
    return "聯發科與台灣供應鏈能否確認出貨與訂單，會影響 AI 從美股敘事延伸到台股基本面的可信度。";
  }

  if (/CPI|inflation|通膨/i.test(text)) {
    return "CPI 會影響利率路徑，進而改變高估值科技股與高 beta 資產的容錯率。";
  }

  if (/Treasury yields|yield/i.test(text)) {
    return "美債殖利率走高會直接提高高估值科技股的折現壓力。";
  }

  if (/矽光子|台積電|AI爆炸性成長/i.test(text)) {
    return "矽光子量產進度能驗證 AI 基礎設施是否正在從算力需求走向供應鏈投資。";
  }

  if (/AI背板|高通|25家台廠供應鏈/i.test(text)) {
    return "供應鏈名單能檢查 AI 訂單是否擴散到更多台廠，而不是停留在少數權值股。";
  }

  if (category === "macro") {
    return "這是利率與美元定價的直接催化，會影響科技股估值與風險資產折現率。";
  }

  if (category === "ai-tech") {
    return "這是 AI 是否從題材走向企業支出與收入證據的觀察點。";
  }

  if (category === "taiwan") {
    return "台灣供應鏈是全球 AI 資本支出的實體映射，會影響台股與美股科技敘事的連動。";
  }

  if (category === "crypto") {
    return "Crypto 資金流與平台動作是流動性與槓桿意願的高 beta 溫度計。";
  }

  return "這會測試市場廣度、波動率與高估值資產的風險容忍度。";
}

export function scoreEvidence(item: NormalizedNewsItem, latestTime?: number) {
  const text = `${item.title} ${item.summary ?? ""} ${item.sourceLabel ?? ""} ${item.tags?.join(" ") ?? ""}`;
  let score = 0;

  if (NAMED_ENTITY_PATTERN.test(text)) score += 30;
  if (CATALYST_PATTERN.test(text)) score += 25;
  if (/\bAI\b|NVIDIA|NVDA|Meta|TSMC|台積|MediaTek|2454|矽光子|背板|供應鏈|法說/i.test(text)) score += 18;
  if (item.summary && item.summary.length > 80) score += 12;
  if (item.sourceLabel) score += 8;
  if (["ai_tech", "semiconductors", "macro", "rates", "crypto", "taiwan"].includes(item.category)) score += 15;

  const publishedAt = new Date(item.publishedAt).getTime();
  if (Number.isFinite(publishedAt) && latestTime) {
    const ageHours = Math.max(0, (latestTime - publishedAt) / (60 * 60 * 1000));
    score += Math.max(0, 20 - Math.round(ageHours / 6));
  }

  if (isGeneric(text)) score -= 40;
  if (/雞排|珍奶|太陽餅|狄驤|慶祝/.test(text)) score -= 55;

  return score;
}

export function buildEvidenceItems(newsItems: NormalizedNewsItem[], maxItems = 5): IXAIEvidenceItem[] {
  const latestTime = Math.max(
    ...newsItems
      .map((item) => new Date(item.publishedAt).getTime())
      .filter((time) => Number.isFinite(time)),
    0,
  );
  const seen = new Set<string>();

  return newsItems
    .map((item) => {
      const category = evidenceCategory(item);
      const event = eventFromItem(item);
      const sourceDate = Number.isFinite(new Date(item.publishedAt).getTime())
        ? new Date(item.publishedAt).toLocaleDateString("zh-TW")
        : "date unavailable";

      return {
        category,
        event,
        score: scoreEvidence(item, latestTime || undefined),
        source: `${item.sourceLabel ?? "Public source"} · ${sourceDate}`,
        whyItMatters: whyItMattersFromItem(item, category),
      };
    })
    .filter((item) => {
      const key = item.event.toLowerCase();
      if (seen.has(key) || isGeneric(item.event)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems);
}

export function evidenceLine(item: IXAIEvidenceItem) {
  return `${item.event} Why It Matters: ${item.whyItMatters}`;
}
