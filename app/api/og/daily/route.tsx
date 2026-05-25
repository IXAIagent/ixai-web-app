import { ImageResponse } from "next/og";
import {
  getPublishedBriefBySlugAsync,
} from "@/src/lib/editorial/repository";
import { getDailyBriefBySlug } from "@/src/lib/dailyBriefs";

// Node runtime so existing editorial helpers (Supabase fetch, content
// imports) work without edge-runtime polyfills.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// v1.33 — Dynamic Daily Brief OG image. Mirrors the Weekly card shape so
// social previews look unified across IXAI editorial. Pulls regime + AI
// momentum from the draft's narrative bundle when available; falls back
// to neutral copy when the brief predates v1.32.

const FOREST = "#09291f";
const CREAM = "#f5f0e6";
const GOLD = "#b08d57";

const REGIME_LABEL: Record<string, string> = {
  risk_on: "RISK-ON",
  neutral: "NEUTRAL",
  risk_off: "RISK-OFF",
};

const AI_LABEL: Record<string, string> = {
  strong: "STRONG",
  neutral: "NEUTRAL",
  weak: "WEAK",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") ?? "";

  const persisted = slug ? await getPublishedBriefBySlugAsync(slug) : null;
  const localBrief = slug ? getDailyBriefBySlug(slug) : null;

  const narrative = persisted?.intelligence?.narrative;
  const regime = narrative?.regime.regime ?? "neutral";
  const aiMomentum = narrative?.regime.aiMomentum ?? "neutral";

  const title =
    persisted?.title ?? localBrief?.title ?? "IXAI Daily Brief";
  const summary =
    persisted?.marketSummary ??
    localBrief?.marketSummary ??
    "AI-assisted daily market intelligence by IXAI.";
  const publishedAt =
    persisted?.publishedAt ?? localBrief?.publishedAt ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: FOREST,
          color: CREAM,
          padding: "64px 72px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ color: GOLD, fontSize: 22, letterSpacing: "0.32em" }}>IXAI</span>
            <span style={{ color: "rgba(245,240,230,0.66)", fontSize: 20 }}>
              Daily Brief{publishedAt ? ` · ${publishedAt}` : ""}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                border: `1px solid ${GOLD}`,
                color: GOLD,
                fontSize: 22,
                letterSpacing: "0.16em",
              }}
            >
              {REGIME_LABEL[regime] ?? "NEUTRAL"}
            </span>
            <span
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                border: "1px solid rgba(245,240,230,0.20)",
                color: "rgba(245,240,230,0.88)",
                fontSize: 22,
                letterSpacing: "0.16em",
              }}
            >
              AI · {AI_LABEL[aiMomentum] ?? "NEUTRAL"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <h1
            style={{
              fontSize: 56,
              lineHeight: 1.18,
              fontWeight: 600,
              margin: 0,
              maxWidth: 900,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 26,
              lineHeight: 1.45,
              color: "rgba(245,240,230,0.74)",
              margin: 0,
              maxWidth: 980,
            }}
          >
            {summary}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "rgba(245,240,230,0.58)", fontSize: 18 }}>
            app.ixuan.ai · risk-first market intelligence
          </span>
          <span style={{ color: GOLD, fontSize: 18, letterSpacing: "0.22em" }}>
            I-XUAN · IXAI
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
