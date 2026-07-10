import { buildIntelligenceConfidence } from "@/src/lib/intelligence/platform/platform-confidence";
import type {
  IntelligenceDomain,
  IntelligencePlatformDiagnostics,
  IntelligencePlatformSnapshot,
} from "@/src/lib/intelligence/platform/platform-types";

export function buildIntelligencePlatformDiagnostics(
  snapshot: Omit<IntelligencePlatformSnapshot, "diagnostics">,
  sourceErrors: IntelligencePlatformDiagnostics["sourceErrors"],
): IntelligencePlatformDiagnostics {
  const domainSnapshots = [
    snapshot.portfolio,
    snapshot.market,
    snapshot.risk,
    snapshot.fcn,
  ];
  const degradedDomains = domainSnapshots
    .filter((domain) =>
      domain.health === "critical" ||
      domain.health === "watch" ||
      domain.health === "unknown" ||
      domain.sourceState === "fallback" ||
      domain.sourceState === "limited" ||
      domain.sourceState === "unavailable",
    )
    .map((domain) => domain.domain);
  const itemCount = domainSnapshots.reduce((total, domain) => total + domain.items.length, 0);
  const blockingIssues = sourceErrors.length >= domainSnapshots.length
    ? ["Multiple core intelligence sources failed. Snapshot is limited."]
    : [];
  const warningIssues = [
    ...sourceErrors.map((error) => `${error.source}: ${error.message}`),
    ...domainSnapshots.flatMap((domain) => domain.limitations),
  ].slice(0, 8);
  const readiness = blockingIssues.length > 0
    ? "red"
    : degradedDomains.length > 0 || sourceErrors.length > 0
      ? "yellow"
      : "green";

  return {
    blockingIssues,
    confidenceCoverage: buildIntelligenceConfidence({
      freshness: "unknown",
      limitations: warningIssues,
      reasons: ["Platform diagnostics are derived from normalized V20A domain snapshots."],
      score: domainSnapshots.reduce((total, domain) => total + (domain.confidence.score ?? 0), 0) / Math.max(1, domainSnapshots.length),
      sourceCoverage: domainSnapshots.map((domain) => domain.sourceState),
    }),
    degradedDomains: Array.from(new Set(degradedDomains)) as IntelligenceDomain[],
    domainCount: domainSnapshots.length,
    generatedAt: snapshot.generatedAt,
    itemCount,
    rawProviderPayloadExposed: false,
    readiness,
    requestScopedContext: true,
    singleModuleFailureSafe: true,
    sourceErrors,
    warningIssues,
  };
}
