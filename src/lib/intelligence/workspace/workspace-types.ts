import type { EditorialProviderDiagnostics } from "@/src/lib/editorial/providers";
import type {
  AssetDiagnostics,
  AssetIntelligence,
  AssetIntelligenceInput,
  AssetReadinessLevel,
  AssetSummary,
} from "@/src/lib/intelligence/assets";
import type {
  MonitoringDiagnostics,
  MonitoringEvent,
  TodayFocusItem,
} from "@/src/lib/intelligence/monitoring";
import type {
  NotificationDeliveryPreview,
  NotificationDiagnostics,
  NotificationEvent,
  NotificationServiceInput,
} from "@/src/lib/intelligence/notifications";

export type WorkspaceIntelligenceHealth = "degraded" | "healthy" | "offline" | "unknown";

export type WorkspaceReadiness = {
  blockingIssues: string[];
  level: AssetReadinessLevel;
  nextActions: string[];
  warningIssues: string[];
};

export type WorkspaceSummaryBucket = {
  label: string;
  score: number;
  status: WorkspaceIntelligenceHealth;
  summary: string;
};

export type WorkspaceProviderSummary = {
  fallbackLevel: string;
  providerCount: number;
  qualityScore: number;
  readiness: string;
  sourceStatus: string;
};

export type WorkspaceEditorialSummary = {
  coverageScore: number;
  qualityScore: number;
  summary: string;
};

export type WorkspaceNotificationSummary = {
  pending: number;
  suppressed: number;
  urgent: number;
  high: number;
  normal: number;
  low: number;
};

export type WorkspaceMonitoringSummary = {
  critical: number;
  events: number;
  info: number;
  readiness: AssetReadinessLevel;
  warning: number;
};

export type WorkspaceRiskSummary = {
  affectedAssets: string[];
  affectedFcns: string[];
  critical: number;
  healthy: number;
  topRisks: MonitoringEvent[];
  warning: number;
};

export type WorkspaceDiagnostics = {
  assetDiagnostics: AssetDiagnostics;
  editorialDiagnostics: WorkspaceEditorialSummary;
  monitoringDiagnostics: MonitoringDiagnostics;
  notificationDiagnostics: NotificationDiagnostics;
  providerDiagnostics: WorkspaceProviderSummary;
  workspaceReadiness: WorkspaceReadiness;
};

export type WorkspaceSummary = {
  assetSummary: AssetSummary;
  coverage: number;
  editorialSummary: WorkspaceEditorialSummary;
  lastUpdated: string;
  monitoringSummary: WorkspaceMonitoringSummary;
  notificationSummary: WorkspaceNotificationSummary;
  overallHealth: WorkspaceIntelligenceHealth;
  overallReadiness: WorkspaceReadiness;
  providerSummary: WorkspaceProviderSummary;
  quality: number;
};

export type WorkspaceNotificationPreview = {
  diagnostics: NotificationDiagnostics;
  notifications: NotificationEvent[];
  pending: number;
  suppressed: number;
  urgent: number;
  high: number;
  normal: number;
  low: number;
};

export type WorkspaceFocusItem = TodayFocusItem & {
  presentationRank: number;
};

export type WorkspaceIntelligenceInput = AssetIntelligenceInput & {
  assets?: AssetIntelligence[];
  existingNotifications?: NotificationEvent[];
  generatedAt?: string;
  monitoringEvents?: MonitoringEvent[];
  notificationPolicy?: NotificationServiceInput["policy"];
  providerDiagnostics?: EditorialProviderDiagnostics | null;
};

export type WorkspaceIntelligenceResult = {
  diagnostics: WorkspaceDiagnostics;
  notificationPreview: WorkspaceNotificationPreview;
  riskSummary: WorkspaceRiskSummary;
  summary: WorkspaceSummary;
  todayFocus: WorkspaceFocusItem[];
};

export type WorkspaceFoundationBundle = {
  assets: AssetIntelligence[];
  generatedAt: string;
  monitoringEvents: MonitoringEvent[];
  notificationPreview: NotificationDeliveryPreview;
  providerDiagnostics: EditorialProviderDiagnostics | null;
};
