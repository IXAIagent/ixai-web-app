import type {
  IXAIInsightPeriod,
  IXAISocialFunnel,
  QuestionDrivenInsight,
} from "@/src/lib/intelligence/insight/types";

function questionFromSignal(signal: string, period: IXAIInsightPeriod, tension: string) {
  const label = period === "weekly" ? "本週" : "今天";

  if (/AI|科技|半導體|雲端|software|Tech/i.test(tension) && /利率|美元|估值|證明|證據/i.test(tension)) {
    return period === "weekly" ? "AI 沒轉弱，為什麼市場更挑剔？" : "AI 還在熱，為什麼市場更挑剔？";
  }

  if (/利率|美元|Treasury|Fed/i.test(signal)) {
    return `${label}市場真正卡在利率嗎？`;
  }

  if (/AI|科技|半導體|雲端|software|Tech/i.test(signal)) {
    return `${label}AI 主線是在擴散，還是在降溫？`;
  }

  if (/Crypto|BTC|ETH|流動性/i.test(signal)) {
    return `${label}Crypto 在提醒風險偏好變了嗎？`;
  }

  return period === "weekly" ? "本週市場最大轉折是什麼？" : "今天市場透露了什麼訊號？";
}

function socialConflictFromTension(tension: string, period: IXAIInsightPeriod) {
  if (/AI|證明|證據|利率|估值/.test(tension)) {
    return period === "weekly"
      ? "AI 沒轉弱，市場只是開始要證據。"
      : "AI 還在熱，但利率沒有配合降溫。";
  }

  if (/Crypto|美元|槓桿/.test(tension)) {
    return period === "weekly"
      ? "Crypto 不是獨立行情，槓桿仍被美元牽動。"
      : "Crypto 有波動，但美元仍在決定風險承受度。";
  }

  return period === "weekly"
    ? "本週不是缺新聞，而是缺少讓資金擴散的理由。"
    : "今天不是缺新聞，而是缺少讓資金一起擴散的理由。";
}

export function buildSocialFunnel({
  mainSignal,
  narrativeTension,
  period,
  questionDriven,
  whyNow,
  whatToWatchNext,
}: {
  mainSignal: string;
  narrativeTension: string;
  period: IXAIInsightPeriod;
  questionDriven?: QuestionDrivenInsight;
  whyNow: string;
  whatToWatchNext: string;
}): IXAISocialFunnel {
  const isWeekly = period === "weekly";

  if (questionDriven) {
    const watchNext = questionDriven.watchNext[0] ?? whatToWatchNext;

    return {
      conflict: questionDriven.keyAnswer,
      cta:
        isWeekly
          ? `想看本週證據、反證與下週觀察，請進 IXAI App 讀 Weekly Intelligence。`
          : `想看今天的證據、反證與下一步觀察，請進 IXAI App 讀 Daily Brief。`,
      hook: questionDriven.centralQuestion,
      payoff: `${questionDriven.evidence[0] ?? whyNow} 下一步看：${watchNext}`,
    };
  }

  return {
    conflict: socialConflictFromTension(narrativeTension, period),
    cta:
      isWeekly
        ? "想看完整市場訊號與下週觀察，請進 IXAI App 讀 Weekly Intelligence。"
        : "想看完整市場訊號與下一步觀察，請進 IXAI App 讀 Daily Brief。",
    hook: questionFromSignal(mainSignal, period, narrativeTension),
    payoff: `${whyNow} 下一步看：${whatToWatchNext}`,
  };
}
