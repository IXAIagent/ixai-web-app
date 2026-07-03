import { WorkspaceBetaExperience } from "@/components/workspace/platform/workspace-beta-experience";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/beta",
  description:
    "IXAI V14 Beta Preview readiness dashboard for invite-only production polish, QA checklist, feedback template, and release notes.",
  title: "V14 Beta Preview | 我的 IXAI",
});

export default function WorkspaceBetaPage() {
  return <WorkspaceBetaExperience />;
}
