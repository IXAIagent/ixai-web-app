"use client";

import { useTranslation } from "@/src/lib/i18n/use-locale";

type WarningLike = {
  id?: string;
  message?: string;
  sourceName?: string;
};

const SOURCE_NAME_KEYS: Record<string, string> = {
  "api:fcn": "apiFcn",
  "database-live-readback": "databaseLiveReadback",
  "database-read-priority": "databaseReadPriority",
  "fcn-draft-store": "fcnDraftStore",
  "input-truth-bridge": "inputTruthBridge",
  "local-pending-input": "localPendingInput",
  "portfolio-persistence-service": "portfolioPersistenceService",
};

const STATUS_KEYS: Record<string, string> = {
  "database ready": "databaseReady",
  "fallback active": "fallbackActive",
  "local draft": "localDraft",
  "source status": "sourceStatus",
};

function normalizeKey(value: string | null | undefined) {
  if (!value) {
    return "unknown";
  }

  const lowerValue = value.trim().toLowerCase();
  if (STATUS_KEYS[lowerValue]) {
    return STATUS_KEYS[lowerValue];
  }

  return lowerValue.replace(/[:_\-\s]+([a-z0-9])/g, (_, character: string) =>
    character.toUpperCase(),
  );
}

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (nextTemplate, [key, value]) => nextTemplate.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function warningKey(warning: WarningLike) {
  if (warning.id === "v10-read-priority" || warning.sourceName === "database-read-priority") {
    return "databaseReadPriority";
  }

  if (warning.sourceName === "api:fcn") {
    return "apiFcn";
  }

  if (warning.sourceName === "portfolio-persistence-service") {
    return "portfolioPersistenceUnavailable";
  }

  return "unknown";
}

export function useWorkspaceDisplayLabels() {
  const { t: tAssetType } = useTranslation("assetTypes");
  const { t: tDiagnostics } = useTranslation("diagnostics");
  const { t: tSourceStatus } = useTranslation("sourceStatus");
  const { t: tWarnings } = useTranslation("warnings");

  return {
    assetTypeLabel(value: string | null | undefined) {
      return tAssetType(normalizeKey(value), value ?? tAssetType("unknown"));
    },
    interpolate,
    sourceNameLabel(value: string | null | undefined) {
      const key = value ? SOURCE_NAME_KEYS[value] ?? normalizeKey(value) : "unknownSource";
      return tDiagnostics(key, value ?? tDiagnostics("unknownSource"));
    },
    sourceStatusLabel(value: string | null | undefined) {
      return tSourceStatus(normalizeKey(value), value ?? tSourceStatus("unknown"));
    },
    warningMessageLabel(warning: WarningLike) {
      return tWarnings(warningKey(warning), warning.message ?? tWarnings("unknown"));
    },
  };
}
