import { readFileSync } from "node:fs";
import Module from "node:module";
import { join } from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const require = createRequire(import.meta.url);

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

function installTypeScriptRuntime() {
  const ts = require("typescript");
  const originalResolve = Module._resolveFilename;

  if (!require.extensions[".ts"] || !require.extensions[".ts"].__ixaiV20bInstalled) {
    require.extensions[".ts"] = function compileTypeScript(module, filename) {
      const source = readFileSync(filename, "utf8");
      const output = ts.transpileModule(source, {
        compilerOptions: {
          esModuleInterop: true,
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.CommonJS,
          moduleResolution: ts.ModuleResolutionKind.Node10,
          target: ts.ScriptTarget.ES2022,
        },
        fileName: filename,
      }).outputText;

      module._compile(output, filename);
    };
    require.extensions[".ts"].__ixaiV20bInstalled = true;
  }

  if (!Module._resolveFilename.__ixaiV20bInstalled) {
    Module._resolveFilename = function resolveWithIxaiAlias(request, parent, isMain, options) {
      if (request.startsWith("@/")) {
        return originalResolve.call(this, join(root, request.slice(2)), parent, isMain, options);
      }

      return originalResolve.call(this, request, parent, isMain, options);
    };
    Module._resolveFilename.__ixaiV20bInstalled = true;
  }
}

function baseConfidence(score = 0.8) {
  return {
    fallbackActive: false,
    freshness: "fresh",
    level: "high",
    limitations: [],
    reasons: ["fixture"],
    score,
    sourceCoverage: ["database"],
  };
}

function fixtureItem(patch) {
  return {
    confidence: baseConfidence(patch.confidenceScore ?? 0.8),
    domain: patch.domain,
    freshness: "fresh",
    generatedAt: "2026-07-10T00:00:00.000Z",
    health: patch.health ?? "elevated",
    id: patch.id,
    limitations: [],
    priority: patch.priority ?? "high",
    relatedAssetIds: patch.relatedAssetIds ?? [],
    relatedFcnIds: patch.relatedFcnIds ?? [],
    relatedSymbols: patch.relatedSymbols ?? [],
    sourceState: patch.sourceState ?? "database",
    summary: patch.summary,
    title: patch.title,
    whatToInspect: patch.whatToInspect ?? "Review this item.",
    whyItMatters: patch.whyItMatters ?? "This affects monitored investments.",
  };
}

function fixtureDomain(domain, items, patch = {}) {
  return {
    confidence: patch.confidence ?? baseConfidence(0.75),
    domain,
    generatedAt: "2026-07-10T00:00:00.000Z",
    health: patch.health ?? "elevated",
    items,
    limitations: patch.limitations ?? [],
    sourceState: patch.sourceState ?? "database",
    ...patch.extra,
  };
}

function buildFixturePlatformSnapshot() {
  const riskItem = fixtureItem({
    domain: "risk",
    id: "risk:tsla-concentration",
    relatedSymbols: ["TSLA"],
    summary: "TSLA concentration needs attention.",
    title: "TSLA concentration",
    whatToInspect: "Review portfolio concentration.",
    whyItMatters: "TSLA concentration can increase portfolio volatility.",
  });
  const fcnItem = fixtureItem({
    domain: "fcn",
    health: "critical",
    id: "fcn:ki-distance",
    priority: "urgent",
    relatedFcnIds: ["FCN1001"],
    relatedSymbols: ["TSLA"],
    summary: "FCN1001 is close to KI monitoring range.",
    title: "FCN1001 KI monitor",
    whatToInspect: "Review KI distance and next observation.",
    whyItMatters: "The worst-of underlying affects FCN risk awareness.",
  });
  const marketItem = fixtureItem({
    domain: "market",
    id: "market:semiconductor",
    priority: "normal",
    relatedSymbols: ["NVDA"],
    summary: "Semiconductor theme is active today.",
    title: "Semiconductor movement",
    whatToInspect: "Watch semiconductor exposure.",
    whyItMatters: "Semiconductor moves can affect watchlist assets.",
  });
  const portfolioItem = fixtureItem({
    domain: "portfolio",
    id: "portfolio:allocation",
    relatedAssetIds: ["asset:tsla"],
    relatedSymbols: ["TSLA"],
    summary: "TSLA is a large portfolio contributor.",
    title: "Largest exposure",
    whatToInspect: "Review position size.",
    whyItMatters: "Large positions can dominate daily movement.",
  });

  return {
    diagnostics: {
      blockingIssues: [],
      confidenceCoverage: baseConfidence(0.7),
      degradedDomains: ["market"],
      domainCount: 4,
      generatedAt: "2026-07-10T00:00:00.000Z",
      itemCount: 4,
      rawProviderPayloadExposed: false,
      readiness: "yellow",
      requestScopedContext: true,
      singleModuleFailureSafe: true,
      sourceErrors: [
        {
          message: "fixture provider fallback",
          source: "fixture-provider",
        },
      ],
      warningIssues: ["fixture provider fallback"],
    },
    fcn: fixtureDomain("fcn", [fcnItem], {
      extra: {
        fcnCount: 1,
        observationEventCount: 1,
        topRiskFcnIds: ["FCN1001"],
      },
      health: "critical",
    }),
    generatedAt: "2026-07-10T00:00:00.000Z",
    market: fixtureDomain("market", [marketItem], {
      extra: {
        affectedSymbols: ["NVDA"],
        coverageAreas: ["Semiconductor"],
        watchlistCount: 1,
      },
      sourceState: "limited",
    }),
    portfolio: fixtureDomain("portfolio", [portfolioItem], {
      extra: {
        estimatedValue: 100000,
        positionCount: 2,
        pricedPositionCount: 1,
        topSymbols: ["TSLA"],
      },
    }),
    risk: fixtureDomain("risk", [riskItem], {
      extra: {
        criticalCount: 0,
        elevatedCount: 1,
        topRiskSymbols: ["TSLA"],
      },
    }),
    todayFocus: {
      generatedAt: "2026-07-10T00:00:00.000Z",
      items: [
        {
          ...riskItem,
          focusRank: 1,
        },
      ],
      limitations: [],
    },
  };
}

const types = read("src/lib/intelligence/alerts/alert-types.ts");
const rules = read("src/lib/intelligence/alerts/alert-rules.ts");
const service = read("src/lib/intelligence/alerts/alert-service.ts");
const correlation = read("src/lib/intelligence/alerts/alert-correlation.ts");
const lifecycle = read("src/lib/intelligence/alerts/alert-lifecycle.ts");
const orchestrator = read("src/lib/intelligence/alerts/alert-notification-orchestrator.ts");
const diagnostics = read("src/lib/intelligence/alerts/alert-diagnostics.ts");
const preferences = read("src/lib/intelligence/alerts/alert-preferences.ts");
const ui = read("components/notifications/notifications-experience-workspace.tsx");
const alertSources = [
  types,
  rules,
  service,
  correlation,
  lifecycle,
  orchestrator,
  diagnostics,
  preferences,
].join("\n");

includesAll(
  types,
  [
    "IntelligenceAlert",
    "IntelligenceAlertCandidate",
    "IntelligenceAlertRuleFamily",
    "IntelligenceAlertNotificationPreview",
    "IntelligenceAlertLifecycleAction",
    "IntelligenceAlertPreferences",
    "IntelligenceAlertDiagnostics",
    '"open"',
    '"acknowledged"',
    '"snoozed"',
    '"resolved"',
    '"archived"',
  ],
  "V20B alert contracts",
);

includesAll(
  rules,
  [
    '"portfolio"',
    '"risk"',
    '"fcn"',
    '"market"',
    '"watchlist"',
    '"provider"',
    '"data-quality"',
    "DEFAULT_INTELLIGENCE_ALERT_RULES",
    "runAlertRules",
  ],
  "V20B rule families",
);

includesAll(
  correlation,
  [
    "buildAlertCorrelationKey",
    "buildAlertDedupeKey",
    "buildAlertCooldownKey",
    "correlateAlertCandidates",
    "notificationSuppressionKey",
  ],
  "V20B correlation and de-duplication",
);

includesAll(
  lifecycle,
  [
    "transitionAlertLifecycle",
    "acknowledge",
    "snooze",
    "resolve",
    "archive",
  ],
  "V20B lifecycle",
);

includesAll(
  orchestrator,
  [
    "buildDefaultNotificationDeliveryPolicy",
    "routeNotificationEvents",
    "buildAlertNotificationEvents",
    "getAlertNotificationPreview",
    '"preview-only"',
    '"dry-run"',
    "telegram",
    "in-app",
  ],
  "V20B notification orchestration",
);

includesAll(
  preferences,
  [
    "externalDeliveryEnabled: false",
    "telegram: false",
    "line: false",
    "email: false",
    '"browser-push": false',
    '"mobile-push": false',
  ],
  "V20B external delivery disabled",
);

includesAll(
  service,
  [
    "getIntelligenceAlertSnapshot",
    "getIntelligenceAlerts",
    "getIntelligenceAlertDiagnostics",
    "getIntelligenceAlertNotificationPreview",
    "getIntelligencePlatformSnapshot",
    "runAlertRules",
    "correlateAlertCandidates",
    "getAlertNotificationPreview",
  ],
  "V20B service API and V20A reuse",
);

includesAll(
  ui,
  [
    "getIntelligenceAlertSnapshot",
    "useTranslation(\"notifications\")",
    "WorkspaceDiagnosticsPanel",
    "NotificationCenterSummary autoLoad={false}",
    "previewOnlyDisclaimer",
  ],
  "V20B notification UI integration",
);

assert(!alertSources.includes("fetch("), "V20B alerts must not fetch external providers.");
assert(!alertSources.includes("OpenAI"), "V20B alerts must not add AI provider calls.");
assert(!alertSources.includes("createClient("), "V20B alerts must not create Supabase clients.");
assert(!/supabase\s*\.\s*from\s*\(/.test(alertSources), "V20B alerts must not query Supabase tables.");
assert(!alertSources.includes("localStorage"), "V20B alert platform must not depend on browser storage.");
assert(!alertSources.includes("setInterval("), "V20B alert platform must not create timers.");
assert(!/send(Telegram|Line|Email|Push)|deliver(Notification|Alert)|webhook|botToken|TELEGRAM_BOT|TELEGRAM_TOKEN|LINE_CHANNEL|EMAIL_PROVIDER|PUSH_SECRET/i.test(alertSources), "V20B must not implement real notification delivery.");
assert(
  !/\b(buy|sell|hold)\b|target price|price target|recommendation|建議買|買進|賣出|目標價/i.test(alertSources),
  "V20B alert platform must not emit advice or recommendation wording.",
);
assert(
  !service.includes("getIntelligencePlatformSnapshot") || !read("src/lib/intelligence/platform/platform-service.ts").includes("@/src/lib/intelligence/alerts"),
  "V20A platform must not import V20B alerts.",
);

installTypeScriptRuntime();

const {
  getIntelligenceAlertSnapshot,
} = require(join(root, "src/lib/intelligence/alerts/alert-service.ts"));
const {
  transitionAlertLifecycle,
} = require(join(root, "src/lib/intelligence/alerts/alert-lifecycle.ts"));

const fixtureSnapshot = buildFixturePlatformSnapshot();
const evaluated = await getIntelligenceAlertSnapshot({
  generatedAt: fixtureSnapshot.generatedAt,
  platformSnapshot: fixtureSnapshot,
});

assert(evaluated.alerts.length >= 4, "V20B fixture should generate multiple alerts.");
assert(evaluated.alerts.some((alert) => alert.ruleFamily === "fcn"), "V20B fixture should generate an FCN alert.");
assert(evaluated.alerts.some((alert) => alert.ruleFamily === "risk"), "V20B fixture should generate a risk alert.");
assert(evaluated.alerts.some((alert) => alert.ruleFamily === "provider"), "V20B fixture should generate a provider fallback alert.");
assert(evaluated.alerts.every((alert) => alert.dedupeKey && alert.cooldownKey && alert.notificationSuppressionKey), "V20B alerts must include deterministic dedupe, cooldown, and suppression keys.");
assert(evaluated.notificationPreview.notifications.every((notification) => notification.alertId), "V20B notification preview events must include alert id.");
assert(evaluated.notificationPreview.routed.every((route) => route.routedChannels.includes("in-app") || route.event.status !== "pending"), "V20B pending alerts should route to in-app preview.");
assert(evaluated.diagnostics.persistenceMode === "in-memory-preview", "V20B diagnostics must report in-memory-preview persistence.");
assert(evaluated.diagnostics.telegramReady === false, "V20B must not mark Telegram ready.");

const repeated = await getIntelligenceAlertSnapshot({
  existingNotifications: [evaluated.notificationPreview.notifications[0]],
  generatedAt: fixtureSnapshot.generatedAt,
  platformSnapshot: fixtureSnapshot,
});
assert(
  repeated.notificationPreview.notifications.some((notification) => notification.status === "suppressed"),
  "V20B fixture should exercise suppression / cooldown.",
);

const lifecycleResult = transitionAlertLifecycle(evaluated.alerts[0], "acknowledge");
assert(lifecycleResult.allowed && lifecycleResult.nextStatus === "acknowledged", "V20B lifecycle should allow acknowledge from open.");
const invalidLifecycle = transitionAlertLifecycle(lifecycleResult.alert, "acknowledge");
assert(!invalidLifecycle.allowed && invalidLifecycle.nextStatus === "acknowledged", "V20B lifecycle should reject invalid repeat acknowledge.");

console.log("V20B Alert & Notification Platform validation passed.");
console.log("- alert contracts present");
console.log("- rule families present");
console.log("- correlation, dedupe, cooldown, lifecycle present");
console.log("- notification preview uses V17 router");
console.log("- external delivery disabled");
console.log("- service fixture execution passed");
console.log("- no AI / Supabase / provider fetch / timer / localStorage dependency detected");
