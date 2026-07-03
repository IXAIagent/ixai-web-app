import { CopilotExperienceWorkspace } from "@/components/copilot/copilot-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/copilot",
  description:
    "IXAI Workspace Copilot 是 rule-based、explain-only 的工作區說明入口，不提供投資建議或交易指令。",
  title: "Copilot | 我的 IXAI",
});

export default function WorkspaceCopilotPage() {
  return <CopilotExperienceWorkspace />;
}
