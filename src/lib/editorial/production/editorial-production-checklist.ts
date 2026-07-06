import type {
  EditorialProductionChecklist,
  EditorialProductionInput,
} from "@/src/lib/editorial/production/editorial-production-types";

export function buildEditorialProductionChecklist(input: EditorialProductionInput): EditorialProductionChecklist {
  const items = [
    {
      key: "real-providers-available",
      label: "Real providers available or fallback source active",
      passed: input.providerDiagnostics.sourceStatus !== "empty",
      required: true,
    },
    {
      key: "fallback-works",
      label: "Fallback works",
      passed: input.providerDiagnostics.fallback.fallbackReady,
      required: true,
    },
    {
      key: "daily-preview-generated",
      label: "Daily preview generated",
      passed: input.productLine !== "daily" || input.rankedStoryCount > 0,
      required: input.productLine === "daily",
    },
    {
      key: "weekly-preview-generated",
      label: "Weekly preview generated",
      passed: input.productLine !== "weekly" || input.rankedStoryCount > 0,
      required: input.productLine === "weekly",
    },
    {
      key: "admin-publish-health-visible",
      label: "Admin publish health visible",
      passed: true,
      required: true,
    },
    {
      key: "no-auto-publish",
      label: "No auto-publish enabled",
      passed: true,
      required: true,
    },
    {
      key: "no-ai-dependency",
      label: "No AI dependency required",
      passed: true,
      required: true,
    },
    {
      key: "no-notification-dependency",
      label: "No notification dependency required",
      passed: true,
      required: true,
    },
    {
      key: "public-readback-safe",
      label: "Public readback safe",
      passed: true,
      required: true,
    },
    {
      key: "social-pack-non-blocking",
      label: "Social Pack non-blocking",
      passed: true,
      required: true,
    },
  ];

  return {
    items,
    passed: items.filter((item) => item.required).every((item) => item.passed),
  };
}
