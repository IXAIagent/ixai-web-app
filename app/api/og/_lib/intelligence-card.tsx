import type { WeeklyNarrativeBundle, WeeklyUpcomingEvent } from "@/src/types/editorial";

// v1.33.1 — Shared institutional intelligence OG card. Pure JSX consumed
// by next/og ImageResponse. No Tailwind, no className — only inline
// styles (next/og does not run a CSS engine).

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const SAFE_PADDING_X = 72;
const SAFE_PADDING_Y = 64;

export const COLOR_FOREST = "#09291f";
export const COLOR_CREAM = "#f5f0e6";
export const COLOR_GOLD = "#b08d57";
const COLOR_MUTED = "rgba(245,240,230,0.66)";
const COLOR_SUBTLE = "rgba(245,240,230,0.42)";

const REGIME_LABEL: Record<WeeklyNarrativeBundle["regime"]["regime"], string> = {
  risk_on: "RISK-ON",
  neutral: "NEUTRAL",
  risk_off: "RISK-OFF",
};

const AI_LABEL: Record<WeeklyNarrativeBundle["regime"]["aiMomentum"], string> = {
  strong: "STRONG",
  neutral: "NEUTRAL",
  weak: "WEAK",
};

const MACRO_LABEL: Record<WeeklyNarrativeBundle["regime"]["macroPressure"], string> = {
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
};

const VOL_LABEL: Record<WeeklyNarrativeBundle["regime"]["volatilityState"], string> = {
  compressed: "COMPRESSED",
  normal: "NORMAL",
  stressed: "STRESSED",
};

// Default editorial fallbacks. Match the deterministic ones used by the
// home Intelligence Hero so visual + share copy stay consistent when
// narrative is unavailable.
const FALLBACK_PRICING_LINES = [
  "AI capex sustainability — supply-chain order visibility into H2.",
  "Fed path uncertainty — yields and dollar still set the discount rate.",
];

const FALLBACK_RISK_FOCUS =
  "Risk regime remains mixed; the next Fed / earnings event is the repricing trigger.";

// Map upcoming-week event titles to short institutional chip labels so
// the bottom row reads like a calendar marker, not a wrapping sentence.
function shortTagForEvent(title: string): string {
  const patterns: Array<[RegExp, string]> = [
    [/FOMC/i, "FOMC"],
    [/Nonfarm|NFP/i, "NFP"],
    [/CPI/i, "CPI"],
    [/PCE/i, "PCE"],
    [/GDP/i, "GDP"],
    [/PMI/i, "PMI"],
    [/Powell/i, "POWELL"],
    [/NVIDIA|NVDA/i, "NVDA"],
    [/AVGO|Broadcom/i, "AVGO"],
    [/Micron|\bMU\b/i, "MU"],
    [/\bAMD\b/i, "AMD"],
    [/Marvell|MRVL/i, "MRVL"],
    [/TSMC|台積電/i, "TSMC"],
    [/MediaTek|聯發科/i, "MediaTek"],
    [/COMPUTEX/i, "COMPUTEX"],
  ];

  for (const [pattern, tag] of patterns) {
    if (pattern.test(title)) {
      return tag;
    }
  }

  const firstSegment = title.split(/[\s:·—|]/)[0] ?? "Event";
  return firstSegment.slice(0, 12).toUpperCase();
}

export type IntelligenceCardEvent = {
  date: string;
  title: string;
  category?: WeeklyUpcomingEvent["category"];
};

export function pickEventChips(events: IntelligenceCardEvent[]): string[] {
  const tags: string[] = [];

  for (const event of events) {
    const tag = shortTagForEvent(event.title);
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
    }
    if (tags.length >= 4) {
      break;
    }
  }

  if (tags.length < 3) {
    for (const fallback of ["FOMC", "CPI", "NVDA"]) {
      if (!tags.includes(fallback)) {
        tags.push(fallback);
      }
      if (tags.length >= 3) {
        break;
      }
    }
  }

  return tags.slice(0, 4);
}

function trimLine(value: string, max = 92): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  if (collapsed.length <= max) {
    return collapsed;
  }
  return `${collapsed.slice(0, max - 1).trim()}…`;
}

function GridOverlay() {
  // Subtle gold grid that reads as institutional graph paper, not neon.
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.12,
        background:
          "repeating-linear-gradient(0deg, rgba(176,141,87,0.16) 0px, rgba(176,141,87,0.16) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(90deg, rgba(176,141,87,0.16) 0px, rgba(176,141,87,0.16) 1px, transparent 1px, transparent 80px)",
      }}
    />
  );
}

function RegimeGlow() {
  // Soft radial gold glow in the top-right corner; signals the regime
  // badge cluster without resorting to neon / hype lighting.
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: -120,
        right: -120,
        width: 520,
        height: 520,
        background:
          "radial-gradient(circle, rgba(176,141,87,0.34), rgba(176,141,87,0.0) 70%)",
      }}
    />
  );
}

function Divider() {
  return (
    <div
      style={{
        display: "flex",
        height: 1,
        width: "100%",
        background:
          "linear-gradient(90deg, rgba(176,141,87,0.0), rgba(176,141,87,0.55), rgba(176,141,87,0.0))",
      }}
    />
  );
}

function Badge({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "10px 16px",
        borderRadius: 12,
        border: emphasis ? `1px solid ${COLOR_GOLD}` : "1px solid rgba(245,240,230,0.18)",
        background: emphasis ? "rgba(176,141,87,0.14)" : "rgba(245,240,230,0.045)",
        minWidth: 124,
      }}
    >
      <div
        style={{
          display: "flex",
          color: emphasis ? COLOR_GOLD : COLOR_SUBTLE,
          fontSize: 12,
          letterSpacing: "0.22em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          color: emphasis ? COLOR_GOLD : COLOR_CREAM,
          fontSize: 20,
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function PricingLine({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          display: "flex",
          marginTop: 10,
          width: 8,
          height: 8,
          borderRadius: 999,
          background: COLOR_GOLD,
          flexShrink: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          color: COLOR_CREAM,
          fontSize: 22,
          lineHeight: 1.4,
          maxWidth: 940,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function EventChip({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        borderRadius: 999,
        border: `1px solid ${COLOR_GOLD}`,
        background: "rgba(176,141,87,0.10)",
        color: COLOR_GOLD,
        fontSize: 16,
        letterSpacing: "0.18em",
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
}

export type IntelligenceCardProps = {
  surfaceLabel: string;
  contextLine: string;
  title: string;
  narrative: WeeklyNarrativeBundle | null;
  events: IntelligenceCardEvent[];
};

// Builds the JSX tree handed to ImageResponse. Returned as a single
// element so route handlers stay terse.
export function renderIntelligenceCard({
  surfaceLabel,
  contextLine,
  title,
  narrative,
  events,
}: IntelligenceCardProps) {
  const regime = narrative?.regime.regime ?? "neutral";
  const aiMomentum = narrative?.regime.aiMomentum ?? "neutral";
  const macroPressure = narrative?.regime.macroPressure ?? "medium";
  const volatilityState = narrative?.regime.volatilityState ?? "normal";

  const pricingLines =
    narrative?.pricingWhat && narrative.pricingWhat.length > 0
      ? narrative.pricingWhat.slice(0, 2)
      : FALLBACK_PRICING_LINES;

  const riskFocus = narrative?.riskFocus
    ? trimLine(narrative.riskFocus.split(/[。.]/)[0] ?? narrative.riskFocus, 140)
    : FALLBACK_RISK_FOCUS;

  const chips = pickEventChips(events);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: COLOR_FOREST,
        color: COLOR_CREAM,
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      <GridOverlay />
      <RegimeGlow />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: `${SAFE_PADDING_Y}px ${SAFE_PADDING_X}px`,
          gap: 28,
        }}
      >
        {/* TOP */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                display: "flex",
                color: COLOR_GOLD,
                fontSize: 18,
                letterSpacing: "0.34em",
              }}
            >
              IXAI
            </div>
            <div style={{ display: "flex", color: COLOR_CREAM, fontSize: 22, fontWeight: 600 }}>
              {surfaceLabel}
            </div>
            <div style={{ display: "flex", color: COLOR_MUTED, fontSize: 18 }}>{contextLine}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Badge label="REGIME" value={REGIME_LABEL[regime]} emphasis />
            <Badge label="AI" value={AI_LABEL[aiMomentum]} />
            <Badge label="MACRO" value={MACRO_LABEL[macroPressure]} />
            <Badge label="VOL" value={VOL_LABEL[volatilityState]} />
          </div>
        </div>

        <Divider />

        {/* CENTER — headline */}
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 600,
            lineHeight: 1.22,
            maxWidth: 960,
            color: COLOR_CREAM,
          }}
        >
          {trimLine(title, 120)}
        </div>

        {/* MID — Market正在 pricing 什麼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              color: COLOR_GOLD,
              fontSize: 14,
              letterSpacing: "0.28em",
            }}
          >
            MARKET IS PRICING
          </div>
          {pricingLines.map((line) => (
            <PricingLine key={line} text={trimLine(line, 110)} />
          ))}
        </div>

        {/* LOWER — risk focus */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "16px 20px",
            borderRadius: 14,
            border: "1px solid rgba(245,240,230,0.14)",
            background: "rgba(245,240,230,0.045)",
          }}
        >
          <div
            style={{
              display: "flex",
              color: COLOR_GOLD,
              fontSize: 13,
              letterSpacing: "0.26em",
            }}
          >
            RISK FOCUS
          </div>
          <div style={{ display: "flex", color: COLOR_CREAM, fontSize: 20, lineHeight: 1.4 }}>
            {riskFocus}
          </div>
        </div>

        {/* BOTTOM — event chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              color: COLOR_GOLD,
              fontSize: 13,
              letterSpacing: "0.26em",
              marginRight: 4,
            }}
          >
            NEXT
          </div>
          {chips.map((label) => (
            <EventChip key={label} label={label} />
          ))}
        </div>

        {/* footer */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", color: COLOR_MUTED, fontSize: 18 }}>
            app.ixuan.ai · risk-first market intelligence
          </div>
          <div
            style={{
              display: "flex",
              color: COLOR_GOLD,
              fontSize: 16,
              letterSpacing: "0.32em",
              fontWeight: 600,
            }}
          >
            I-XUAN · IXAI
          </div>
        </div>
      </div>
    </div>
  );
}
