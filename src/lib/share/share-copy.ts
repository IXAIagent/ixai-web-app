import type { WeeklyNarrativeBundle } from "@/src/types/editorial";

// v1.33 — Dynamic share copy.
//
// Centralizes the language used when readers share an IXAI intelligence
// page to X / LinkedIn / Telegram / LINE / clipboard. Risk-first tone;
// never produces buy/sell language, target prices or guaranteed returns.

const REGIME_LABEL: Record<WeeklyNarrativeBundle["regime"]["regime"], string> = {
  risk_on: "Risk-On",
  neutral: "Neutral",
  risk_off: "Risk-Off",
};

const AI_LABEL: Record<WeeklyNarrativeBundle["regime"]["aiMomentum"], string> = {
  strong: "Strong",
  neutral: "Neutral",
  weak: "Weak",
};

const MACRO_LABEL: Record<WeeklyNarrativeBundle["regime"]["macroPressure"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export type ShareCopyKind = "home" | "weekly" | "daily" | "fcn";

export type WeeklyShareCopyInput = {
  coverage?: string;
  narrative?: WeeklyNarrativeBundle | null;
  url: string;
};

export type DailyShareCopyInput = {
  publishedAt?: string;
  narrative?: WeeklyNarrativeBundle | null;
  url: string;
};

export type ShareCopy = {
  title: string;
  body: string;
  hashtags: string[];
  url: string;
};

function defaultHashtags(): string[] {
  return ["IXAI", "MarketIntelligence", "RiskFirst"];
}

export function buildHomeShareCopy(url: string): ShareCopy {
  return {
    title: "IXAI — AI Wealth Intelligence OS",
    body: "Daily and weekly market intelligence covering AI, macro, Taiwan semis, crypto and volatility regime. Risk-first.",
    hashtags: defaultHashtags(),
    url,
  };
}

export function buildWeeklyShareCopy({
  coverage,
  narrative,
  url,
}: WeeklyShareCopyInput): ShareCopy {
  if (!narrative) {
    return {
      title: `IXAI Weekly Intelligence${coverage ? ` — ${coverage}` : ""}`,
      body: "本週市場 strategist note — Fed × AI capex × Taiwan semis × Crypto risk appetite。",
      hashtags: defaultHashtags(),
      url,
    };
  }

  const pricingFirst = narrative.pricingWhat[0];

  return {
    title: `IXAI Weekly Intelligence${coverage ? ` — ${coverage}` : ""}`,
    body: `本週市場正在 pricing：${pricingFirst ?? "Fed × AI capex × Taiwan semis × Crypto risk appetite"}. Regime ${REGIME_LABEL[narrative.regime.regime]} · AI ${AI_LABEL[narrative.regime.aiMomentum]} · Macro ${MACRO_LABEL[narrative.regime.macroPressure]}.`,
    hashtags: [...defaultHashtags(), "WeeklyIntelligence"],
    url,
  };
}

export function buildDailyShareCopy({
  publishedAt,
  narrative,
  url,
}: DailyShareCopyInput): ShareCopy {
  if (!narrative) {
    return {
      title: `IXAI Daily Brief${publishedAt ? ` — ${publishedAt}` : ""}`,
      body: "今日市場 narrative — Fed × AI × Taiwan × Crypto。Risk-first read by IXAI.",
      hashtags: defaultHashtags(),
      url,
    };
  }

  return {
    title: `IXAI Daily Brief${publishedAt ? ` — ${publishedAt}` : ""}`,
    body: `今日市場 regime：${REGIME_LABEL[narrative.regime.regime]} / AI Momentum ${AI_LABEL[narrative.regime.aiMomentum]} / Macro Pressure ${MACRO_LABEL[narrative.regime.macroPressure]}.`,
    hashtags: [...defaultHashtags(), "DailyBrief"],
    url,
  };
}

export function buildFcnShareCopy(url: string): ShareCopy {
  return {
    title: "FCN Intelligence & Risk Education — IXAI",
    body: "Worst-of, KI / KO, volatility regime — the FCN concepts most investors learn after they need them.",
    hashtags: [...defaultHashtags(), "FCN", "StructuredNotes"],
    url,
  };
}

export function buildXShareUrl(copy: ShareCopy): string {
  const hashtags = copy.hashtags.join(",");
  const text = `${copy.title}\n\n${copy.body}`;
  const params = new URLSearchParams({
    text,
    url: copy.url,
    hashtags,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function buildLinkedInShareUrl(copy: ShareCopy): string {
  const params = new URLSearchParams({ url: copy.url });
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

export function buildTelegramShareUrl(copy: ShareCopy): string {
  const params = new URLSearchParams({
    url: copy.url,
    text: `${copy.title} — ${copy.body}`,
  });
  return `https://t.me/share/url?${params.toString()}`;
}

export function buildLineShareUrl(copy: ShareCopy): string {
  const params = new URLSearchParams({ url: copy.url });
  return `https://social-plugins.line.me/lineit/share?${params.toString()}`;
}
