import { WorkspaceHealthExperience } from "@/components/workspace/platform/workspace-health-experience";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/health",
  description:
    "IXAI Workspace Health Center shows read-only provider, cache, runtime safety, data quality, and i18n readiness for Beta verification.",
  title: "Workspace Health | 我的 IXAI",
});

export default function WorkspaceHealthPage() {
  return <WorkspaceHealthExperience />;
}
