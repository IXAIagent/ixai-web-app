import { WorkspaceCopilotSummary } from "@/components/copilot/workspace-copilot-summary";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/copilot",
  description:
    "IXAI Workspace Copilot 是 rule-based、explain-only 的工作區說明入口，不提供投資建議或交易指令。",
  title: "Copilot | 我的 IXAI",
});

export default function WorkspaceCopilotPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <WorkspaceCopilotSummary />
    </main>
  );
}
