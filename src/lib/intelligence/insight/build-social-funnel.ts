import type { IXAIInsightPeriod, IXAISocialFunnel } from "@/src/lib/intelligence/insight/types";

function questionFromSignal(signal: string, period: IXAIInsightPeriod) {
  const label = period === "weekly" ? "本週" : "今天";

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

export function buildSocialFunnel({
  mainSignal,
  narrativeTension,
  period,
  whatToWatchNext,
}: {
  mainSignal: string;
  narrativeTension: string;
  period: IXAIInsightPeriod;
  whatToWatchNext: string;
}): IXAISocialFunnel {
  const briefLabel = period === "weekly" ? "Weekly Intelligence" : "Daily Brief";
  const periodLabel = period === "weekly" ? "本週" : "今天";

  return {
    conflict: narrativeTension,
    cta:
      period === "weekly"
        ? "想看完整市場訊號與下週觀察，請進 IXAI App 讀 Weekly Intelligence。"
        : "想看完整市場訊號與下一步觀察，請進 IXAI App 讀 Daily Brief。",
    hook: questionFromSignal(mainSignal, period),
    payoff: `${briefLabel} 會把${periodLabel}新聞拆成事件、訊號、風險與一玄觀點；下一步先看：${whatToWatchNext}`,
  };
}
