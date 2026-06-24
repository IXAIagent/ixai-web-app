import { getV11DatabaseActivationReport } from "@/src/lib/workspace/database-activation";
import { evaluateWorkspaceAccess } from "@/src/lib/workspace/platform";
import {
  getV11ControlledWriteGuard,
} from "@/src/lib/workspace/database-cutover/controlled-write-guard";
import type {
  V11ControlledWriteOperation,
  V11ControlledWriteResult,
  V11ControlledWriteStatus,
  V11DatabaseCutoverModule,
  V11ModuleWriteReadiness,
} from "@/src/lib/workspace/database-cutover/database-cutover-types";

const MODULE_TO_ACTIVATION_NAME: Record<V11DatabaseCutoverModule, string> = {
  alerts: "Alert History",
  fcn: "FCN",
  portfolio: "Portfolio",
  watchlist: "Watchlist",
};

function operationId(module: V11DatabaseCutoverModule) {
  return `v11.20-${module}-controlled-write-preview`;
}

function skippedWrite(input: {
  blockingReason: string;
  guardEnabled: boolean;
  module: V11DatabaseCutoverModule;
  operation?: V11ControlledWriteOperation;
  target?: V11ControlledWriteResult["target"];
}): V11ControlledWriteResult {
  return {
    blockingReason: input.blockingReason,
    databaseAttempted: false,
    fallbackUsed: true,
    guardEnabled: input.guardEnabled,
    module: input.module,
    operation: input.operation ?? "skipped",
    operationId: operationId(input.module),
    success: false,
    target: input.target ?? "skipped",
    writtenAt: new Date().toISOString(),
  };
}

async function evaluateModuleWrite(
  module: V11DatabaseCutoverModule,
): Promise<V11ModuleWriteReadiness> {
  const guard = getV11ControlledWriteGuard();
  const moduleGuard = guard.modules[module];

  if (!moduleGuard.enabled) {
    const result = skippedWrite({
      blockingReason: moduleGuard.reason,
      guardEnabled: false,
      module,
      target: module === "fcn" ? "draft" : "local",
    });

    return {
      blockingReason: result.blockingReason,
      databaseAttempted: false,
      fallbackActive: true,
      guardEnabled: false,
      module,
      readiness: "guarded",
      recommendedNextAction:
        "Keep fallback active. Enable database writes only in staging after migration, RLS, ownership, and rollback checks pass.",
      result,
    };
  }

  const activation = await getV11DatabaseActivationReport();
  const access = evaluateWorkspaceAccess();
  const writeReadiness = activation.writeReadiness.find(
    (item) => item.module === MODULE_TO_ACTIVATION_NAME[module],
  );
  const missingRequirements = writeReadiness?.missingRequirements ?? [];

  if (missingRequirements.length > 0 || !writeReadiness?.canWrite) {
    const result = skippedWrite({
      blockingReason:
        missingRequirements[0] ??
        "Database write readiness is not approved for this module.",
      guardEnabled: true,
      module,
      target: module === "fcn" ? "draft" : "local",
    });

    return {
      blockingReason: result.blockingReason,
      databaseAttempted: false,
      fallbackActive: true,
      guardEnabled: true,
      module,
      readiness: "blocked",
      recommendedNextAction:
        writeReadiness?.recommendedNextStep ??
        "Validate tables, RLS, ownership, workspace context, and fallback before enabling writes.",
      result,
    };
  }

  if (!access.canWrite) {
    const result = skippedWrite({
      blockingReason: access.reason,
      guardEnabled: true,
      module,
      target: module === "fcn" ? "draft" : "local",
    });

    return {
      blockingReason: result.blockingReason,
      databaseAttempted: false,
      fallbackActive: true,
      guardEnabled: true,
      module,
      readiness: "blocked",
      recommendedNextAction:
        "Provide a verified workspace owner/member context before allowing controlled writes.",
      result,
    };
  }

  const result = skippedWrite({
    blockingReason:
      "Diagnostics do not execute writes. Use an explicit write call with a validated payload after staging approval.",
    guardEnabled: true,
    module,
  });

  return {
    blockingReason: result.blockingReason,
    databaseAttempted: false,
    fallbackActive: true,
    guardEnabled: true,
    module,
    readiness: "ready",
    recommendedNextAction:
      "Run explicit staging write tests with validated payloads; do not write during render diagnostics.",
    result,
  };
}

export async function getV11ControlledWriteStatus(): Promise<V11ControlledWriteStatus> {
  const guard = getV11ControlledWriteGuard();
  const modules = await Promise.all([
    evaluateModuleWrite("portfolio"),
    evaluateModuleWrite("fcn"),
    evaluateModuleWrite("watchlist"),
    evaluateModuleWrite("alerts"),
  ]);

  return {
    checkedAt: new Date().toISOString(),
    guard,
    modules,
    remoteMigrationExecuted: false,
    summary:
      "V11.20 controlled write activation is guard-first and disabled by default. Diagnostics never execute database writes and all local/draft fallbacks remain active.",
  };
}
