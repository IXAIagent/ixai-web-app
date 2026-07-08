import { CopilotExperienceWorkspace } from "@/components/copilot/copilot-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/copilot",
  description:
    "IXAI Workspace Copilot helps users ask portfolio, FCN, risk, and market questions without adding AI model calls or trading advice.",
  title: "Copilot | 我的 IXAI",
});

export default function WorkspaceCopilotPage() {
  return <CopilotExperienceWorkspace />;
}
