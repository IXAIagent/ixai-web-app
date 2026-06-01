import { buildSocialFunnel } from "@/src/lib/intelligence/insight/build-social-funnel";
import { buildEvidenceItems, evidenceLine } from "@/src/lib/intelligence/insight/evidence-quality";
import { extractInsightEvents } from "@/src/lib/intelligence/insight/extract-events";
import { extractMarketSignals } from "@/src/lib/intelligence/insight/extract-signals";
import type {
  InsightNarrative,
  IXAIInsightInput,
  IXAIInsightOutput,
  IXAIKeyEvent,
  IXAIMarketSignal,
  QuestionDrivenInsight,
} from "@/src/lib/intelligence/insight/types";

function sentence(value: string, fallback: string, maxLength = 180) {
  const normalized = (value || fallback)
    .replace(/\*\*/g, "")
    .replace(/Short Insight|Observation\s*\d+/gi, "")
    .replace(/相較前一份 Brief[，：:]?\s*/g, "")
    .replace(/相較最近\s*\d+\s*份 Daily Intelligence[，：:]?\s*/g, "")
    .replace(/市場訊號正在轉向/g, "市場正在重新篩選可被證明的主線")
    .replace(/投資人持續觀察/g, "資金會檢查")
    .replace(/風險偏好受到壓力/g, "風險資產的容錯率下降")
    .replace(/值得關注|持續關注/g, "需要用可觀察資料驗證")
    .replace(/市場情緒變化/g, "資金定價條件改變")
    .replace(/事件背後的市場訊號/g, "資金正在要求的證據")
    .replace(/AI\s*敘事仍有吸引力/g, "資金仍願意買 AI")
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

function hasTheme(themes: string[], pattern: RegExp) {
  return themes.some((theme) => pattern.test(theme));
}

function itemText(item: IXAIInsightInput["newsItems"][number]) {
  return `${item.category} ${item.title} ${item.summary ?? ""} ${item.tags?.join(" ") ?? ""}`;
}

function hasItem(items: IXAIInsightInput["newsItems"], pattern: RegExp) {
  return items.some((item) => pattern.test(itemText(item)));
}

function firstItem(items: IXAIInsightInput["newsItems"], pattern: RegExp) {
  return items.find((item) => pattern.test(itemText(item)));
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

  const enriched = [...scoped];
  const requiredPatterns = [
    /macro|rates|fed|rate|yield|treasury|dollar|inflation|利率|殖利率|美元|通膨/i,
    /ai|nvidia|semiconductor|software|cloud|半導體|晶片|企業軟體|雲端/i,
    /crypto|btc|eth|bitcoin|stablecoin|加密|流動性/i,
    /taiwan|台股|台積電|供應鏈/i,
  ];

  for (const pattern of requiredPatterns) {
    if (!hasItem(enriched, pattern)) {
      const match = firstItem(input.newsItems, pattern);
      if (match) {
        enriched.push(match);
      }
    }
  }

  if (input.period === "weekly") {
    return scoped.length >= 8 ? scoped : input.newsItems;
  }

  return enriched.length >= 5 ? enriched : input.newsItems;
}

function buildNarrativeTension(input: IXAIInsightInput, themes: string[]) {
  const isWeekly = input.period === "weekly";
  const hasMacro = hasTheme(themes, /利率|美元/);
  const hasAi = hasTheme(themes, /AI|Tech|台灣/);
  const hasCrypto = hasTheme(themes, /Crypto/);

  if (isWeekly && hasMacro && hasAi) {
    return "本週最大的變化不是 AI 轉弱，而是市場開始要求 AI 證明獲利能力。";
  }

  if (!isWeekly && hasMacro && hasAi) {
    return "AI 相關資產仍能吸引資金，但利率沒有配合降溫。";
  }

  if (hasAi) {
    return isWeekly
      ? "本週 AI 主線仍在前排，但資金開始區分能把 AI 變成收入的公司，和只停留在故事裡的公司。"
      : "AI 主線仍在前排，但今天市場更在意誰能把 AI 變成收入。";
  }

  if (hasCrypto && hasMacro) {
    return isWeekly
      ? "本週 Crypto 波動沒有脫離總經，美元與利率仍在決定槓桿願意留多久。"
      : "Crypto 有波動，但真正的拉扯仍是美元與利率能不能讓槓桿留下來。";
  }

  return isWeekly
    ? "本週市場不是缺新聞，而是缺少能讓資金擴散的共同理由。"
    : "今天市場不是缺新聞，而是缺少讓風險資產一起上漲的共同理由。";
}

function buildWhatChanged(input: IXAIInsightInput, themes: string[]) {
  const periodLabel = input.period === "weekly" ? "本週" : "今天";
  const priorThemes = input.continuityContext?.tags ?? [];
  const newTheme = themes.find((theme) => !priorThemes.includes(theme)) ?? themes[1] ?? themes[0] ?? "風險偏好";

  if (input.period === "weekly") {
    return `${periodLabel}變化不是 Daily 訊號的平均值，而是新聞與下週事件共同指向 ${newTheme} 是否正在改變資金定價順序。`;
  }

  return `${periodLabel}變化在於 ${newTheme} 的權重上升；若延續，市場主線會從單一 headline 轉向更完整的風險定價。`;
}

function buildWhyNow(input: IXAIInsightInput, themes: string[]) {
  const hasMacro = hasTheme(themes, /利率|美元/);
  const hasAi = hasTheme(themes, /AI|Tech|台灣/);
  const hasCrypto = hasTheme(themes, /Crypto/);

  if (input.period === "weekly") {
    if (hasMacro && hasAi) {
      return "本週新聞與下週事件把焦點從題材熱度拉回財報、法說與經濟數據；市場開始要證據，而不只要故事。";
    }

    if (hasCrypto) {
      return "本週 Crypto 訊號重要，是因為它先反映流動性與槓桿意願，常比大型股更早暴露風險偏好的變化。";
    }

    return "本週重要，是因為市場正在重新排列哪些主題能延續、哪些主題只是短線催化。";
  }

  if (hasMacro && hasAi) {
    return "過去幾個月市場願意先為 AI 故事付溢價；現在長端利率與美元把估值容錯率重新拉回檯面。";
  }

  if (hasAi) {
    return "現在重要，是因為 AI 交易正在從故事階段進入驗證階段；市場會開始看支出、收入與供應鏈能見度。";
  }

  return "現在重要，是因為風險資產需要新的共同理由，才有辦法從局部反彈變成更廣的資金擴散。";
}

function buildWatchNext(input: IXAIInsightInput, themes: string[]) {
  const upcoming = input.upcomingEvents?.[0];

  if (upcoming) {
    const prefix = upcoming.date ? `${upcoming.date} ` : "";
    return sentence(
      `${prefix}${upcoming.title}：${upcoming.whyItMatters ?? "看它是否改變利率、AI 與風險偏好的定價順序。"}`,
      "看下週事件是否改變利率、AI 與風險偏好的定價順序。",
      150,
    );
  }

  if (themes.some((theme) => theme.includes("AI"))) {
    return "看 AI 軟體、雲端資本支出與半導體供應鏈是否同時上修；若只有少數大型股撐住，市場廣度會比指數更重要。";
  }

  return "看十年債殖利率、美元、波動率與市場廣度是否同向走高；如果同步走高，風險資產會更難擴散。";
}

function buildIxuanView(input: IXAIInsightInput, narrative: Omit<InsightNarrative, "ixuanView">) {
  if (input.period === "weekly") {
    return sentence(
      `本週一玄觀點：資金不是離開 AI，而是開始只獎勵能交出證據的 AI。${narrative.tension}${narrative.whyNow}${narrative.watchNext}`,
      "本週一玄觀點：市場正在從題材熱度轉向證據篩選。",
      260,
    );
  }

  return sentence(
    `今天一玄觀點：資金仍願意買 AI，但開始只買最強的 AI。${narrative.tension}${narrative.whyNow}${narrative.watchNext}`,
    "今天一玄觀點：市場正在從題材熱度轉向證據篩選。",
    240,
  );
}

function uniqueSentences(items: string[], count: number) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const item of items) {
    if (!item?.trim()) continue;
    const normalized = sentence(item, "", 120);
    if (!normalized || normalized === "。" || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(normalized);
    if (output.length >= count) break;
  }

  return output;
}

function eventLine(event: IXAIKeyEvent | undefined, fallback: string) {
  if (!event) {
    return fallback;
  }

  return sentence(`${event.title}：${event.whyItMatters}`, fallback, 110);
}

function signalLine(signal: IXAIMarketSignal | undefined, fallback: string) {
  if (!signal) {
    return fallback;
  }

  return sentence(`${signal.signal}：${signal.implication}`, fallback, 110);
}

function buildQuestionDrivenInsight({
  input,
  keyEvents,
  marketSignals,
  evidenceItems,
  themes,
  watchNext,
}: {
  input: IXAIInsightInput;
  keyEvents: IXAIKeyEvent[];
  marketSignals: IXAIMarketSignal[];
  evidenceItems: ReturnType<typeof buildEvidenceItems>;
  themes: string[];
  watchNext: string;
}): QuestionDrivenInsight {
  const isWeekly = input.period === "weekly";
  const hasMacro = hasTheme(themes, /利率|美元/);
  const hasAi = hasTheme(themes, /AI|Tech|台灣/);
  const hasCrypto = hasTheme(themes, /Crypto/);
  const aiEvent = keyEvents.find((event) => event.category === "ai-tech" || event.category === "taiwan");
  const macroEvent = keyEvents.find((event) => event.category === "macro");
  const cryptoEvent = keyEvents.find((event) => event.category === "crypto");
  const riskEvent = keyEvents.find((event) => event.category === "risk" || event.category === "fcn");
  const primarySignal = marketSignals[0];
  const upcoming = input.upcomingEvents?.[0];

  if (hasAi && hasMacro) {
    const aiEvidence = evidenceItems.find((item) => item.category === "ai-tech" || item.category === "taiwan");
    const macroEvidence = evidenceItems.find((item) => item.category === "macro");
    const cryptoEvidence = evidenceItems.find((item) => item.category === "crypto");
    const riskEvidence = evidenceItems.find((item) => item.category === "risk");
    const daily: QuestionDrivenInsight = {
      centralQuestion: "AI 股還在漲，為什麼市場反而更挑剔？",
      counterEvidence: uniqueSentences(
        [
          "如果 AI 軟體、雲端與半導體沒有一起上修，這可能只是少數大型股行情。",
          "如果十年債殖利率與美元繼續走高，估值容錯率會下降。",
          eventLine(riskEvent, "若波動率升高，市場會更快淘汰沒有獲利證據的題材。"),
        ],
        3,
      ),
      evidence: uniqueSentences(
        [
          aiEvidence ? evidenceLine(aiEvidence) : eventLine(aiEvent, "AI 相關新聞仍在前排，但市場開始看訂單、收入與資本支出。"),
          macroEvidence ? evidenceLine(macroEvidence) : eventLine(macroEvent, "利率與美元仍在重新定價高估值科技股的容錯率。"),
          cryptoEvidence ? evidenceLine(cryptoEvidence) : signalLine(primarySignal, "資金還在 AI，但更偏好能交出財報證據的公司。"),
        ],
        3,
      ),
      evidenceDetails: evidenceItems.slice(0, 5),
      ixuanView:
        "一玄觀點：下一階段不是買 AI 故事，而是看誰能把 AI 變成現金流。資金沒有離開 AI，但它會更挑剔：有訂單、有毛利、有現金流證據的公司，才有機會繼續取得溢價。",
      keyAnswer: "資金沒有離開 AI，但開始只買能證明獲利、訂單與資本支出的 AI。",
      watchNext: uniqueSentences(
        [
          "觀察 AI 軟體、雲端資本支出與半導體供應鏈是否同時上修。",
          "觀察十年債殖利率與美元是否同向走高。",
          "觀察科技股上漲廣度是否擴大，而不是只靠少數大型股撐住。",
        ],
        3,
      ),
      whatChangesMyMind: uniqueSentences(
        [
          "企業軟體與雲端資本支出同步上修。",
          "科技股上漲廣度擴大，不只集中在少數大型股。",
          "長端利率降溫，讓高估值資產重新取得容錯率。",
        ],
        3,
      ),
    };
    const weekly: QuestionDrivenInsight = {
      centralQuestion: "AI 行情正在換手嗎？",
      counterEvidence: uniqueSentences(
        [
          "若下週通膨數據降溫且大型科技 guidance 維持上修，市場可能重新擴散。",
          "若台灣 AI 供應鏈法說無法支持訂單延續，這輪換手會變成估值壓縮。",
          eventLine(riskEvent, "若波動率與利率同步升高，市場會降低對高 beta 科技的容忍度。"),
        ],
        3,
      ),
      evidence: uniqueSentences(
        [
          aiEvidence ? evidenceLine(aiEvidence) : eventLine(aiEvent, "AI 相關事件仍是本週主線，但焦點開始從題材轉向財報與訂單證據。"),
          macroEvidence ? evidenceLine(macroEvidence) : eventLine(macroEvent, "利率與美元訊號讓高估值科技股需要更強基本面支持。"),
          upcoming
            ? `${upcoming.title}：下週事件會測試 AI、利率與風險偏好的定價順序。`
            : riskEvidence
              ? evidenceLine(riskEvidence)
              : signalLine(primarySignal, "本週市場開始把 AI 題材放回獲利能力檢查表。"),
        ],
        3,
      ),
      evidenceDetails: evidenceItems.slice(0, 5),
      ixuanView:
        "一玄週觀點：本週不是 AI 退潮，而是市場開始分辨 AI 故事和 AI 現金流。下一階段的關鍵，不是誰最會講 AI，而是誰能用財報、訂單與資本支出證明 AI 已經進入營運成果。",
      keyAnswer: "還不能說結束，但資金正在從故事型 AI，轉向能交出財報、訂單與法說證據的 AI。",
      watchNext: uniqueSentences(
        [
          upcoming
            ? `${upcoming.date ? `${upcoming.date} ` : ""}${upcoming.title}。`
            : "觀察下週通膨、利率與大型科技法說是否支持估值。",
          "觀察 AI 軟體、雲端與半導體是否同步上修。",
          "觀察台灣 AI 供應鏈法說是否確認訂單延續。",
        ],
        3,
      ),
      whatChangesMyMind: uniqueSentences(
        [
          "通膨與殖利率同時降溫，讓科技估值重新取得空間。",
          "AI 相關上漲從少數權值股擴散到軟體、雲端與供應鏈。",
          "企業 guidance 顯示 AI 支出不是短期拉貨，而是年度預算方向。",
        ],
        3,
      ),
    };

    return isWeekly ? weekly : daily;
  }

  if (hasCrypto) {
    return {
      centralQuestion: isWeekly ? "Crypto 是在反映新資金，還是槓桿退潮？" : "Crypto 波動是在提醒風險偏好改變嗎？",
      counterEvidence: uniqueSentences(
        [
          "如果美元與實質利率走高，Crypto 的高 beta 屬性會先承壓。",
          "如果 ETF flow 沒有延續，價格反彈容易變成短線槓桿行情。",
        ],
        2,
      ),
      evidence: uniqueSentences(
        [
          evidenceItems[0] ? evidenceLine(evidenceItems[0]) : "",
          eventLine(cryptoEvent, "BTC / ETH 仍是流動性與風險承受度的高 beta 觀察窗口。"),
          signalLine(primarySignal, "Crypto 訊號會先反映槓桿資金是否願意留下。"),
        ],
        2,
      ),
      evidenceDetails: evidenceItems.slice(0, 5),
      ixuanView:
        "一玄觀點：Crypto 對 IXAI 的意義不是預測價格，而是觀察流動性與槓桿意願。當美元、利率與 ETF flow 不能同時支持，Crypto 反彈就更需要風險控管。",
      keyAnswer: "重點不是價格單日波動，而是流動性、ETF flow 與槓桿資金是否同向。",
      watchNext: uniqueSentences(["觀察 BTC / ETH ETF flow、stablecoin liquidity 與美元走勢。", watchNext], 3),
      whatChangesMyMind: uniqueSentences(["ETF flow 連續轉強。", "美元與實質利率同步降溫。"], 2),
    };
  }

  return {
    centralQuestion: isWeekly ? "本週市場真正想驗證什麼？" : "今天市場真正想驗證什麼？",
    counterEvidence: uniqueSentences(
      [
        "如果利率、美元與市場廣度同時惡化，局部催化很難變成全面行情。",
        "如果新聞只集中在少數題材，資金擴散仍會受限。",
      ],
      2,
    ),
    evidence: uniqueSentences(
      [
        evidenceItems[0] ? evidenceLine(evidenceItems[0]) : "",
        evidenceItems[1] ? evidenceLine(evidenceItems[1]) : "",
        eventLine(keyEvents[0], "公開新聞提供了市場主線，但仍需要跨資產證據驗證。"),
        signalLine(primarySignal, "資金正在檢查哪一條敘事能延續到下一個交易週期。"),
      ],
      2,
    ),
    evidenceDetails: evidenceItems.slice(0, 5),
    ixuanView:
      "一玄觀點：市場不缺資訊，缺的是能被驗證的主線。IXAI 會先看事件是否能改變資金配置順序，再看它是否值得進入下一輪市場記憶。",
    keyAnswer: "市場需要的不是更多 headline，而是能被價格、資金與風險指標同時支持的主線。",
    watchNext: uniqueSentences([watchNext, "觀察市場廣度、美元、利率與波動率是否同向。"], 3),
    whatChangesMyMind: uniqueSentences(["風險指標與市場廣度同步改善。", "同一主題連續出現在不同資產與不同來源。"], 2),
  };
}

export function buildIXAIInsight(input: IXAIInsightInput): IXAIInsightOutput {
  const scopedInput = {
    ...input,
    newsItems: scopedNewsItems(input),
  };
  const keyEvents = extractInsightEvents(scopedInput.newsItems);
  const marketSignals = extractMarketSignals(keyEvents);
  const evidenceItems = buildEvidenceItems(scopedInput.newsItems, 6);
  const themes = themesFromInput(scopedInput);
  const periodLabel = input.period === "weekly" ? "本週" : "今天";
  const mainSignal = marketSignals[0]?.signal ?? `${periodLabel}市場仍在等待更明確訊號。`;
  const narrativeTension = buildNarrativeTension(input, themes);
  const whatChanged = buildWhatChanged(input, themes);
  const whyNow = buildWhyNow(input, themes);
  const whatToWatchNext = buildWatchNext(input, themes);
  const whyItMatters = sentence(
    `${whyNow} ${mainSignal}`,
    `${periodLabel}訊號會影響市場風險偏好與估值容錯率。`,
    170,
  );
  const insightNarrative = {
    ixuanView: "",
    tension: narrativeTension,
    watchNext: whatToWatchNext,
    whyNow,
  };
  const questionDriven = buildQuestionDrivenInsight({
    input,
    evidenceItems,
    keyEvents,
    marketSignals,
    themes,
    watchNext: whatToWatchNext,
  });
  const ixuanView = questionDriven.ixuanView || buildIxuanView(input, insightNarrative);
  const resolvedNarrative = {
    ...insightNarrative,
    ixuanView,
  };

  return {
    insightNarrative: resolvedNarrative,
    ixuanView,
    keyEvents,
    marketSignals,
    narrativeTension,
    questionDriven,
    socialFunnel: buildSocialFunnel({
      mainSignal,
      narrativeTension,
      period: input.period,
      questionDriven,
      whyNow,
      whatToWatchNext,
    }),
    whatChanged,
    whatToWatchNext,
    whyItMatters,
    whyNow,
  };
}
