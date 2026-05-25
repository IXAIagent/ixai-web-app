import type { NormalizedNewsItem } from "@/src/types/news";

// v1.32 — Market regime inference for Public Intelligence Layer.
//
// Pure-data heuristics on selected headlines and a few quote signals.
// This does NOT consume the live /market provider state; instead the
// caller passes an optional set of regime hints derived from the existing
// Daily / Weekly intake (no new feeds, no new provider). The goal is to
// expose a calm, institutional regime label that anchors the narrative
// cards — not to gate any trading decision.

export type MarketRegime = "risk_on" | "neutral" | "risk_off";
export type AiMomentum = "strong" | "neutral" | "weak";
export type MacroPressure = "high" | "medium" | "low";
export type VolatilityState = "compressed" | "normal" | "stressed";

export type MarketRegimeSnapshot = {
  regime: MarketRegime;
  aiMomentum: AiMomentum;
  macroPressure: MacroPressure;
  volatilityState: VolatilityState;
  signals: {
    riskOn: string[];
    riskOff: string[];
    aiStrength: string[];
    aiWeakness: string[];
    macro: string[];
    volatility: string[];
  };
};

const RISK_OFF_PATTERN =
  /\b(selloff|plunge|crash|spike|surge in vol|risk-off|risk off|fear|panic|crisis|war|tariff)\b|崩跌|暴跌|恐慌|風險升溫|避險|地緣風險|關稅戰/i;
const RISK_ON_PATTERN =
  /\b(rally|surge|outperform|all[- ]time high|breakout|risk-on|risk on|melt[- ]up|inflows)\b|歷史新高|多頭|資金流入|風險偏好回升|強勢/i;
const AI_STRENGTH_PATTERN =
  /\b(ai capex|hyperscaler|capex up|guides? up|raises? guidance|record (?:revenue|orders))\b|資本支出上修|訂單能見度|擴大資本支出|上修展望|產能滿載|AI 需求/i;
const AI_WEAKNESS_PATTERN =
  /\b(guides? down|cuts? guidance|cancell?ation|inventory correction|ai bubble|overinvest|pause)\b|下修展望|庫存修正|遞延|放緩|過熱|疑慮/i;
const MACRO_PRESSURE_HIGH =
  /\b(higher for longer|hawkish|sticky inflation|reaccelerat|yields? (?:above|higher)|dxy (?:strength|rises)|stronger dollar)\b|鷹派|通膨黏性|殖利率上行|美元走強|更久更高/i;
const MACRO_PRESSURE_LOW =
  /\b(dovish|rate cut|cuts? expected|disinflation|cooling|yields? fall|dxy (?:weak|falls)|softer dollar)\b|鴿派|降息|通膨降溫|殖利率下行|美元走弱/i;
const VOLATILITY_STRESS =
  /\b(vix (?:surge|spike|above|elevated)|volatility (?:spike|surge|stressed)|liquidation|forced selling)\b|VIX 飆升|波動率升高|流動性緊張|斷頭/i;
const VOLATILITY_COMPRESSED =
  /\b(vix (?:falls|low|compress|below 13)|volatility compressed|calm|complacen)\b|VIX 偏低|波動率壓縮|市場過於樂觀/i;

function findSignals(items: NormalizedNewsItem[], pattern: RegExp, limit = 3): string[] {
  const hits: string[] = [];

  for (const item of items) {
    if (hits.length >= limit) {
      break;
    }

    const haystack = `${item.title} ${item.summary ?? ""}`;
    if (pattern.test(haystack)) {
      hits.push(item.title);
    }
  }

  return hits;
}

export function inferMarketRegime(items: NormalizedNewsItem[]): MarketRegimeSnapshot {
  const riskOn = findSignals(items, RISK_ON_PATTERN);
  const riskOff = findSignals(items, RISK_OFF_PATTERN);
  const aiStrength = findSignals(items, AI_STRENGTH_PATTERN);
  const aiWeakness = findSignals(items, AI_WEAKNESS_PATTERN);
  const macroHigh = findSignals(items, MACRO_PRESSURE_HIGH);
  const macroLow = findSignals(items, MACRO_PRESSURE_LOW);
  const volStress = findSignals(items, VOLATILITY_STRESS);
  const volCompress = findSignals(items, VOLATILITY_COMPRESSED);

  let regime: MarketRegime = "neutral";
  if (riskOff.length >= 2 && riskOff.length > riskOn.length) {
    regime = "risk_off";
  } else if (riskOn.length >= 2 && riskOn.length > riskOff.length) {
    regime = "risk_on";
  }

  let aiMomentum: AiMomentum = "neutral";
  if (aiStrength.length >= 2 && aiStrength.length > aiWeakness.length) {
    aiMomentum = "strong";
  } else if (aiWeakness.length >= 1 && aiWeakness.length >= aiStrength.length) {
    aiMomentum = "weak";
  }

  let macroPressure: MacroPressure = "medium";
  if (macroHigh.length >= 2 && macroHigh.length > macroLow.length) {
    macroPressure = "high";
  } else if (macroLow.length >= 2 && macroLow.length > macroHigh.length) {
    macroPressure = "low";
  }

  let volatilityState: VolatilityState = "normal";
  if (volStress.length >= 1) {
    volatilityState = "stressed";
  } else if (volCompress.length >= 1) {
    volatilityState = "compressed";
  }

  return {
    regime,
    aiMomentum,
    macroPressure,
    volatilityState,
    signals: {
      riskOn,
      riskOff,
      aiStrength,
      aiWeakness,
      macro: [...macroHigh, ...macroLow],
      volatility: [...volStress, ...volCompress],
    },
  };
}

export const MARKET_REGIME_LABELS: Record<MarketRegime, string> = {
  risk_on: "Risk-On",
  neutral: "Neutral",
  risk_off: "Risk-Off",
};

export const AI_MOMENTUM_LABELS: Record<AiMomentum, string> = {
  strong: "Strong",
  neutral: "Neutral",
  weak: "Weak",
};

export const MACRO_PRESSURE_LABELS: Record<MacroPressure, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const VOLATILITY_STATE_LABELS: Record<VolatilityState, string> = {
  compressed: "Compressed",
  normal: "Normal",
  stressed: "Stressed",
};
