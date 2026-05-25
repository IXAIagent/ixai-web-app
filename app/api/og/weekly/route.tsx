import { ImageResponse } from "next/og";
import { getPublishedWeeklyDraftBySlugAsync } from "@/src/lib/editorial/weekly";

// Node runtime so the existing editorial repository (with its Supabase
// fetch helpers) keeps the same call path it has on the public weekly
// page. next/og ImageResponse works in node too.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// v1.33 — Dynamic Weekly Intelligence OG image. next/og renders a server
// edge image so social platforms (Twitter / LinkedIn / Telegram / LINE
// previews) see a real IXAI card instead of the generic /og fallback.
//
// IXAI brand: deep forest #09291f, cream #f5f0e6, gold #b08d57.

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

  const brief = slug ? await getPublishedWeeklyDraftBySlugAsync(slug) : null;

  const regime = brief?.sections.narrative?.regime.regime ?? "neutral";
  const aiMomentum = brief?.sections.narrative?.regime.aiMomentum ?? "neutral";
  const pricingLine =
    brief?.sections.narrative?.pricingWhat?.[0] ??
    "Daily and weekly market intelligence for global investors.";
  const title = brief?.title ?? "IXAI Weekly Intelligence";
  const coverage = brief
    ? `${brief.weekStart} – ${brief.weekEnd}`
    : "AI · Macro · Taiwan · Crypto";

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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span style={{ color: GOLD, fontSize: 22, letterSpacing: "0.32em" }}>IXAI</span>
            <span style={{ color: "rgba(245,240,230,0.66)", fontSize: 20 }}>
              Weekly Intelligence · {coverage}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
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
            {pricingLine}
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
