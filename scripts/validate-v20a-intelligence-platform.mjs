import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function includesAll(source, values, label) {
  for (const value of values) {
    assert(source.includes(value), `${label} missing ${value}`);
  }
}

const types = read("src/lib/intelligence/platform/platform-types.ts");
const service = read("src/lib/intelligence/platform/platform-service.ts");
const focus = read("src/lib/intelligence/platform/platform-focus.ts");
const diagnostics = read("src/lib/intelligence/platform/platform-diagnostics.ts");
const platformSources = [
  types,
  service,
  focus,
  diagnostics,
  read("src/lib/intelligence/platform/platform-portfolio.ts"),
  read("src/lib/intelligence/platform/platform-market.ts"),
  read("src/lib/intelligence/platform/platform-risk.ts"),
  read("src/lib/intelligence/platform/platform-fcn.ts"),
].join("\n");
const userFacingBuilderSources = [
  focus,
  read("src/lib/intelligence/platform/platform-portfolio.ts"),
  read("src/lib/intelligence/platform/platform-market.ts"),
  read("src/lib/intelligence/platform/platform-risk.ts"),
  read("src/lib/intelligence/platform/platform-fcn.ts"),
].join("\n");

includesAll(
  types,
  [
    '"portfolio"',
    '"market"',
    '"risk"',
    '"fcn"',
    '"monitoring"',
    '"data-quality"',
    '"live"',
    '"database"',
    '"cache"',
    '"local"',
    '"fallback"',
    '"limited"',
    '"unavailable"',
  ],
  "V20A contracts",
);

includesAll(
  service,
  [
    "getIntelligencePlatformSnapshot",
    "getPortfolioIntelligenceSnapshot",
    "getMarketIntelligenceSnapshot",
    "getRiskIntelligenceSnapshot",
    "getFcnIntelligenceSnapshot",
    "getTodayFocusV2",
    "getIntelligencePlatformDiagnostics",
    "Promise.all",
    "settleSource",
    "safeSync",
  ],
  "V20A service API",
);

includesAll(
  service,
  [
    "getAssetIntelligence",
    "getMonitoringEvents",
    "getNotificationDeliveryPreview",
    "getEditorialProviderSourceResultAsync",
    "getWorkspacePortfolioValuation",
    "getWorkspaceFcnRiskSummary",
    "getWorkspaceWatchlistSummary",
  ],
  "V16/V17/V18 reuse",
);

includesAll(
  focus,
  [
    "focusKey",
    "deduped",
    "sortIntelligenceItems",
    "slice(0, 3)",
  ],
  "Today Focus v2",
);

includesAll(
  diagnostics,
  [
    "requestScopedContext: true",
    "singleModuleFailureSafe: true",
    "rawProviderPayloadExposed: false",
  ],
  "Diagnostics safety",
);

assert(!platformSources.includes("OpenAI"), "V20A platform must not add AI provider calls.");
assert(
  !/\b(buy|sell|hold)\b|target price|price target|recommendation|建議買|買進|賣出|目標價/i.test(userFacingBuilderSources),
  "V20A platform must not emit advice or recommendation wording.",
);
assert(!platformSources.includes("createClient("), "V20A platform must not create a Supabase client.");
assert(!/supabase\s*\.\s*from\s*\(/.test(platformSources), "V20A platform must not query Supabase tables directly.");
assert(!/createServerClient\s*\(/.test(platformSources), "V20A platform must not create server database clients.");
assert(!platformSources.includes("setInterval("), "V20A platform must not create timers.");
assert(!platformSources.includes("localStorage"), "V20A platform must not depend on browser storage.");

console.log("V20A Intelligence Platform validation passed.");
console.log("- contracts present");
console.log("- request-scoped fan-out present");
console.log("- Today Focus v2 dedupe present");
console.log("- diagnostics safety flags present");
console.log("- no AI / Supabase / timer / localStorage dependency detected");
