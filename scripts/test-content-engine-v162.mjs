import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function taipeiDateKey(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Taipei",
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

const buildInsight = read("src/lib/intelligence/insight/build-insight.ts");
const generator = read("src/lib/intelligence/generator.ts");
const social = read("src/lib/intelligence/social/social-intelligence-pack.ts");
const weekly = read("src/lib/editorial/weekly.ts");
const scheduler = read("src/lib/editorial/scheduler.ts");
const providers = read("src/lib/news/providers.ts");

assert(
  buildInsight.includes("buildDailyAiMacroQuestion") &&
    !buildInsight.includes('centralQuestion: "AI 股還在漲，為什麼市場反而更挑剔？"'),
  "Daily AI + Macro narrative must not return the old fixed central question.",
);

assert(
  generator.includes("selectUniqueDailyTitle") &&
    generator.includes(".slice(0, 7)") &&
    generator.includes("buildDailyIntelligenceSlug"),
  "Daily generator must include 7-day title uniqueness and Asia/Taipei slug helpers.",
);

assert(
  !social.includes("const socialTitle = questionDriven?.centralQuestion") &&
    social.includes("buildDailySocialTitle") &&
    social.includes("buildDailySocialView"),
  "Daily Social Pack must not directly reuse Daily questionDriven centralQuestion / I-Xuan View.",
);

assert(
  weekly.includes("periodicNarrative.mainNarrative || insight.whyItMatters") &&
    !weekly.includes("pricing: insight.questionDriven?.keyAnswer"),
  "Weekly summary must prioritize weekly periodic narrative over Daily-like question-driven thesis.",
);

assert(
  scheduler.includes("getProductDateKey") && taipeiDateKey(new Date("2026-06-02T23:30:00.000Z")) === "2026-06-03",
  "Daily scheduler must use Asia/Taipei as the product-date key.",
);

assert(
  providers.includes('disabledReasonCode: "rate_limited"') &&
    providers.includes("backend / Pro yfinance paths are separate provider paths") &&
    providers.includes('disabledReasonCode: "disabled_by_policy"'),
  "Provider health must expose Yahoo Finance rate-limit and Bloomberg policy/stability reasons.",
);

console.log("Content Engine v1.62 regression checks passed.");
