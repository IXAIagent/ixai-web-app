// v1.31 — curated upcoming-week calendar for the Weekly Intelligence
// generator. There is no real-time macro/earnings calendar API on this
// stack (and we explicitly do NOT want to touch the live news provider),
// so we maintain a small deterministic seed of known events keyed by ISO
// date. The generator filters this seed by the next-week window so the
// Weekly draft always carries real upcoming dates instead of the previous
// "下週" placeholder.
//
// Keep this list short and authoritative. Each entry must have a real
// known date — if a date is uncertain, omit the entry rather than mislead.

export type UpcomingEventCategory =
  | "fed_rates"
  | "macro_data"
  | "us_earnings"
  | "taiwan_event"
  | "crypto_event"
  | "geopolitics";

export type UpcomingEventSeed = {
  date: string; // ISO YYYY-MM-DD
  title: string;
  category: UpcomingEventCategory;
  whyItMatters: string;
  relatedAssets: string[];
};

// Deterministic curated calendar. Maintained editorially. Public APIs that
// produce week reports filter by date window — entries outside the next
// week are skipped automatically.
const CURATED_CALENDAR: UpcomingEventSeed[] = [
  // 2026 Q2 FOMC + macro dates (illustrative editorial seed)
  {
    date: "2026-06-04",
    title: "US May Nonfarm Payrolls (NFP)",
    category: "macro_data",
    whyItMatters: "勞動市場熱度直接影響 Fed 利率路徑與美元、美債定價。",
    relatedAssets: ["SPY", "QQQ", "DX-Y.NYB", "^TNX"],
  },
  {
    date: "2026-06-11",
    title: "US May CPI Inflation Print",
    category: "macro_data",
    whyItMatters: "通膨黏性會決定 Fed 是否維持鷹派、是否壓抑成長股估值。",
    relatedAssets: ["SPY", "QQQ", "^TNX", "GLD"],
  },
  {
    date: "2026-06-18",
    title: "FOMC Rate Decision + Powell Press Conference",
    category: "fed_rates",
    whyItMatters: "利率決議與點陣圖直接重新定價美股、美元、Crypto 與台股風險資產。",
    relatedAssets: ["SPY", "QQQ", "BTC", "2330.TW"],
  },
  {
    date: "2026-05-27",
    title: "NVIDIA (NVDA) FY26 Q1 Earnings",
    category: "us_earnings",
    whyItMatters: "AI capex 與資料中心需求最重要的單一數據點；牽動全球 AI 供應鏈。",
    relatedAssets: ["NVDA", "QQQ", "2330.TW", "AVGO"],
  },
  {
    date: "2026-05-29",
    title: "Marvell (MRVL) Q1 Earnings",
    category: "us_earnings",
    whyItMatters: "AI 客製化晶片與資料中心訂單能見度；驗證 NVDA 之外的 AI capex 韌性。",
    relatedAssets: ["MRVL", "NVDA"],
  },
  {
    date: "2026-06-03",
    title: "CrowdStrike + HP Enterprise Earnings",
    category: "us_earnings",
    whyItMatters: "企業 IT 支出與 AI server 出貨節奏；對 SMCI、AVGO、台股 server 供應鏈有 read-across。",
    relatedAssets: ["CRWD", "HPE", "SMCI"],
  },
  {
    date: "2026-06-05",
    title: "Broadcom (AVGO) Q2 Earnings",
    category: "us_earnings",
    whyItMatters: "ASIC / custom AI silicon 出貨與下半年 guidance；影響台積電先進製程訂單能見度。",
    relatedAssets: ["AVGO", "2330.TW", "NVDA"],
  },
  {
    date: "2026-06-25",
    title: "Micron (MU) Q3 Earnings",
    category: "us_earnings",
    whyItMatters: "HBM 與記憶體循環的方向訊號，對 AI server BOM 成本與台股記憶體鏈相關。",
    relatedAssets: ["MU", "QQQ", "2330.TW"],
  },
  {
    date: "2026-05-28",
    title: "TSMC (2330.TW) AGM 股東會",
    category: "taiwan_event",
    whyItMatters: "台積電年度展望、CoWoS / 先進製程產能規劃；台股 AI 供應鏈最重要的單一事件。",
    relatedAssets: ["2330.TW", "TSM", "AVGO", "NVDA"],
  },
  {
    date: "2026-06-02",
    title: "COMPUTEX Taipei 2026 主題演講週",
    category: "taiwan_event",
    whyItMatters: "AI server、edge AI 與台廠供應鏈訂單動態；牽動廣達、緯創、技嘉、奇鋐評價。",
    relatedAssets: ["2382.TW", "3231.TW", "2376.TW", "3017.TW"],
  },
  {
    date: "2026-06-10",
    title: "MediaTek (2454.TW) 法說 / 出貨數據窗口",
    category: "taiwan_event",
    whyItMatters: "手機 AP、Wi-Fi、AI edge 出貨動向；台股 IC 設計族群定價參考。",
    relatedAssets: ["2454.TW"],
  },
];

function parseIsoDate(value: string): number {
  const normalized = normalizeIsoDate(value);
  const time = new Date(`${normalized}T00:00:00Z`).getTime();
  return Number.isFinite(time) ? time : Number.NaN;
}

// Accepts "2026-05-17", "2026.05.17", "2026/05/17" and similar legacy
// formats from static content; returns canonical ISO YYYY-MM-DD.
function normalizeIsoDate(value: string): string {
  return value.slice(0, 10).replace(/[./]/g, "-");
}

// Build a [weekEnd + 1 day, weekEnd + 7 days] window (inclusive) for the
// "next week" relative to the just-closed editorial week. Falls back to
// the input weekEnd for both ends when parsing fails, so downstream
// rendering never sees Invalid Date crashes from legacy dot-separated
// static briefs (e.g. "2026.05.17").
export function getNextWeekRange(weekEnd: string): {
  nextWeekStart: string;
  nextWeekEnd: string;
} {
  const normalized = normalizeIsoDate(weekEnd);
  const base = new Date(`${normalized}T00:00:00Z`);

  if (!Number.isFinite(base.getTime())) {
    return { nextWeekStart: normalized, nextWeekEnd: normalized };
  }

  const start = new Date(base);
  start.setUTCDate(base.getUTCDate() + 1);
  const end = new Date(base);
  end.setUTCDate(base.getUTCDate() + 7);

  return {
    nextWeekStart: start.toISOString().slice(0, 10),
    nextWeekEnd: end.toISOString().slice(0, 10),
  };
}

export type UpcomingEvent = UpcomingEventSeed & {
  marketImpact: string;
};

function deriveMarketImpact(seed: UpcomingEventSeed): string {
  switch (seed.category) {
    case "fed_rates":
      return "牽動全球風險資產、美元與台股 AI 供應鏈評價；對成長股估值最敏感。";
    case "macro_data":
      return "影響利率預期、美元強弱與風險資產折現率；台股 AI 供應鏈會跟著重新定價。";
    case "us_earnings":
      return "AI capex 與企業 IT 支出方向；read-across 至台股供應鏈與 QQQ。";
    case "taiwan_event":
      return "台股 AI 供應鏈與外資資金流的主要催化劑；同步觀察 NVDA / AVGO 連動。";
    case "crypto_event":
      return "Crypto 流動性與槓桿情緒，輔助觀察風險偏好。";
    case "geopolitics":
      return "避險需求與美元；可能影響台股風險溢價與半導體出口節奏。";
    default:
      return "可能影響利率、AI 科技、台股供應鏈與風險資產的同步定價。";
  }
}

export function selectUpcomingEvents({
  nextWeekStart,
  nextWeekEnd,
}: {
  nextWeekStart: string;
  nextWeekEnd: string;
}): UpcomingEvent[] {
  const startMs = parseIsoDate(nextWeekStart);
  const endMs = parseIsoDate(nextWeekEnd);

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return [];
  }

  return CURATED_CALENDAR.filter((seed) => {
    const ms = parseIsoDate(seed.date);
    return Number.isFinite(ms) && ms >= startMs && ms <= endMs;
  })
    .sort((a, b) => parseIsoDate(a.date) - parseIsoDate(b.date))
    .map((seed) => ({
      ...seed,
      marketImpact: deriveMarketImpact(seed),
    }));
}

// Returns earnings-focused events from the upcoming window, for the
// dedicated earnings section in the Weekly draft.
export function selectUpcomingEarnings(events: UpcomingEvent[]): UpcomingEvent[] {
  return events.filter((event) => event.category === "us_earnings");
}

export function selectUpcomingTaiwanEvents(events: UpcomingEvent[]): UpcomingEvent[] {
  return events.filter((event) => event.category === "taiwan_event");
}

export function selectUpcomingFedMacro(events: UpcomingEvent[]): UpcomingEvent[] {
  return events.filter(
    (event) => event.category === "fed_rates" || event.category === "macro_data",
  );
}
