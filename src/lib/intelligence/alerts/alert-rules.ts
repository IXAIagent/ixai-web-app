import type {
  AlertableIntelligenceItem,
  IntelligenceAlertCandidate,
  IntelligenceAlertRule,
  IntelligenceAlertRuleContext,
} from "@/src/lib/intelligence/alerts/alert-types";

function addHours(date: string, hours: number) {
  return new Date(new Date(date).getTime() + hours * 60 * 60 * 1000).toISOString();
}

function confidenceScore(item: AlertableIntelligenceItem) {
  return item.confidence.score ?? (item.confidence.level === "high" ? 0.8 : item.confidence.level === "medium" ? 0.6 : 0.4);
}

function candidateFromItem(input: {
  expiresInHours?: number;
  item: AlertableIntelligenceItem;
  ruleFamily: IntelligenceAlertCandidate["ruleFamily"];
  source: IntelligenceAlertCandidate["source"];
  titlePrefix?: string;
  type: IntelligenceAlertCandidate["type"];
}): IntelligenceAlertCandidate {
  return {
    affectedAssetIds: input.item.relatedAssetIds,
    affectedFcnIds: input.item.relatedFcnIds,
    affectedSymbols: input.item.relatedSymbols,
    confidence: confidenceScore(input.item),
    createdAt: input.item.generatedAt,
    expiresAt: addHours(input.item.generatedAt, input.expiresInHours ?? 24),
    health: input.item.health,
    id: `candidate:${input.item.id}`,
    itemIds: [input.item.id],
    priority: input.item.priority,
    ruleFamily: input.ruleFamily,
    source: input.source,
    sourceDomains: [input.item.domain],
    summary: input.item.summary,
    title: input.titlePrefix ? `${input.titlePrefix}: ${input.item.title}` : input.item.title,
    type: input.type,
    whatToMonitor: input.item.whatToInspect,
    whyItMatters: input.item.whyItMatters,
  };
}

function actionableItems(items: AlertableIntelligenceItem[]) {
  return items.filter(
    (item) =>
      item.priority === "urgent" ||
      item.priority === "high" ||
      item.health === "critical" ||
      item.health === "elevated" ||
      item.confidence.fallbackActive,
  );
}

const portfolioRule: IntelligenceAlertRule = {
  family: "portfolio",
  id: "portfolio-attention",
  run(context) {
    return actionableItems(context.platformSnapshot.portfolio.items)
      .slice(0, 6)
      .map((item) =>
        candidateFromItem({
          item,
          ruleFamily: "portfolio",
          source: "intelligence-platform",
          titlePrefix: "Portfolio",
          type: "portfolio",
        }),
      );
  },
};

const riskRule: IntelligenceAlertRule = {
  family: "risk",
  id: "risk-attention",
  run(context) {
    return actionableItems(context.platformSnapshot.risk.items)
      .slice(0, 8)
      .map((item) =>
        candidateFromItem({
          item,
          ruleFamily: "risk",
          source: "monitoring-engine",
          titlePrefix: "Risk",
          type: "risk",
        }),
      );
  },
};

const fcnRule: IntelligenceAlertRule = {
  family: "fcn",
  id: "fcn-attention",
  run(context) {
    return actionableItems(context.platformSnapshot.fcn.items)
      .slice(0, 8)
      .map((item) =>
        candidateFromItem({
          expiresInHours: 72,
          item,
          ruleFamily: "fcn",
          source: "monitoring-engine",
          titlePrefix: "FCN",
          type: item.title.toLowerCase().includes("observation") || item.summary.toLowerCase().includes("coupon")
            ? "fcn-event"
            : "fcn-risk",
        }),
      );
  },
};

const marketRule: IntelligenceAlertRule = {
  family: "market",
  id: "market-attention",
  run(context) {
    return actionableItems(context.platformSnapshot.market.items)
      .slice(0, 6)
      .map((item) =>
        candidateFromItem({
          item,
          ruleFamily: "market",
          source: "editorial-intelligence",
          titlePrefix: "Market",
          type: "market",
        }),
      );
  },
};

const watchlistRule: IntelligenceAlertRule = {
  family: "watchlist",
  id: "watchlist-attention",
  run(context) {
    return context.platformSnapshot.todayFocus.items
      .filter((item) => item.domain === "market" || item.relatedSymbols.length > 0)
      .slice(0, 5)
      .map((item) =>
        candidateFromItem({
          item,
          ruleFamily: "watchlist",
          source: "intelligence-platform",
          titlePrefix: "Watchlist",
          type: "watchlist",
        }),
      );
  },
};

const providerRule: IntelligenceAlertRule = {
  family: "provider",
  id: "provider-degradation",
  run(context) {
    return context.platformSnapshot.diagnostics.sourceErrors.slice(0, 5).map((error): IntelligenceAlertCandidate => ({
      affectedAssetIds: [],
      affectedFcnIds: [],
      affectedSymbols: [],
      confidence: 0.5,
      createdAt: context.generatedAt,
      expiresAt: addHours(context.generatedAt, 12),
      health: "watch",
      id: `candidate:provider:${error.source}`,
      itemIds: [],
      priority: "normal",
      ruleFamily: "provider",
      source: "provider-diagnostics",
      sourceDomains: ["data-quality"],
      summary: `${error.source} is unavailable, so IXAI is using limited or fallback intelligence where possible.`,
      title: "Data source degraded",
      type: "provider-fallback",
      whatToMonitor: "Review source freshness and confirm whether the main investment summary still has enough coverage.",
      whyItMatters: "Data-source degradation can reduce confidence in alerts, but it should not stop the product.",
    }));
  },
};

const dataQualityRule: IntelligenceAlertRule = {
  family: "data-quality",
  id: "data-quality-attention",
  run(context) {
    const domains = [
      context.platformSnapshot.portfolio,
      context.platformSnapshot.market,
      context.platformSnapshot.risk,
      context.platformSnapshot.fcn,
    ];

    return domains
      .filter((domain) => domain.sourceState === "fallback" || domain.sourceState === "limited" || domain.sourceState === "unavailable")
      .map((domain): IntelligenceAlertCandidate => ({
        affectedAssetIds: [],
        affectedFcnIds: domain.domain === "fcn" ? domain.topRiskFcnIds ?? [] : [],
        affectedSymbols: domain.domain === "portfolio" ? domain.topSymbols ?? [] : domain.domain === "risk" ? domain.topRiskSymbols ?? [] : [],
        confidence: domain.confidence.score ?? 0.4,
        createdAt: context.generatedAt,
        expiresAt: addHours(context.generatedAt, 24),
        health: domain.health,
        id: `candidate:data-quality:${domain.domain}`,
        itemIds: domain.items.map((item) => item.id),
        priority: domain.health === "critical" ? "high" : "normal",
        ruleFamily: "data-quality",
        source: "intelligence-platform",
        sourceDomains: [domain.domain],
        summary: `${domain.domain} intelligence is operating with ${domain.sourceState} coverage.`,
        title: `${domain.domain} coverage is limited`,
        type: "data-quality",
        whatToMonitor: "Use the summary as limited context and check again after data coverage improves.",
        whyItMatters: "Limited data coverage reduces confidence in the investment monitoring view.",
      }));
  },
};

export const DEFAULT_INTELLIGENCE_ALERT_RULES: IntelligenceAlertRule[] = [
  portfolioRule,
  riskRule,
  fcnRule,
  marketRule,
  watchlistRule,
  providerRule,
  dataQualityRule,
];

export function runAlertRules(context: IntelligenceAlertRuleContext) {
  return DEFAULT_INTELLIGENCE_ALERT_RULES.flatMap((rule) => rule.run(context));
}
