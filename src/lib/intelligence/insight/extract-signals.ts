import type { IXAIKeyEvent, IXAIMarketSignal } from "@/src/lib/intelligence/insight/types";

function eventByCategory(events: IXAIKeyEvent[], pattern: RegExp) {
  return events.find((event) => pattern.test(`${event.category} ${event.title} ${event.whyItMatters}`));
}

function cleanTitle(value: string) {
  return value
    .replace(/[。！？!?]$/g, "")
    .replace(/^Macro[:：]\s*/i, "")
    .replace(/^AI[:：]\s*/i, "")
    .trim();
}

export function extractMarketSignals(events: IXAIKeyEvent[]): IXAIMarketSignal[] {
  const macro = eventByCategory(events, /macro/);
  const ai = eventByCategory(events, /ai-tech|taiwan/);
  const crypto = eventByCategory(events, /crypto/);
  const risk = eventByCategory(events, /risk|fcn/);
  const signals: IXAIMarketSignal[] = [];

  if (macro) {
    signals.push({
      evidence: cleanTitle(macro.title),
      implication: "如果利率或美元壓力延續，高估值科技與高 beta 資產的容錯率會下降。",
      signal: "利率與美元仍是風險資產的第一層定價訊號。",
    });
  }

  if (ai) {
    signals.push({
      evidence: cleanTitle(ai.title),
      implication: "若 AI 訊號從單一晶片股擴散到軟體、雲端與台灣供應鏈，主線才更有延續性。",
      signal: "AI 主線正在接受基本面與資金廣度驗證。",
    });
  }

  if (crypto) {
    signals.push({
      evidence: cleanTitle(crypto.title),
      implication: "Crypto 變化可作為市場對流動性、槓桿與風險偏好的即時觀察。",
      signal: "Crypto 仍是流動性敏感資產的風險溫度計。",
    });
  }

  if (risk) {
    signals.push({
      evidence: cleanTitle(risk.title),
      implication: "風險訊號若與利率、美元或市場廣度同向，波動可能比 headline 更早反映壓力。",
      signal: "風險環境正在測試市場廣度與高 beta 承受度。",
    });
  }

  if (signals.length >= 3) {
    return signals.slice(0, 4);
  }

  return [
    ...signals,
    {
      evidence: events[0] ? cleanTitle(events[0].title) : "公開來源覆蓋有限",
      implication: "在事件訊號分散時，應先觀察主線是否延續，而不是放大單一 headline。",
      signal: "市場仍需要更多確認訊號才能形成更清楚方向。",
    },
  ].slice(0, 4);
}
