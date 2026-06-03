import { ProWorkspaceHub } from "@/components/pro/pro-workspace-hub";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "IXAI Pro 入口",
  description:
    "IXAI Pro 是進階投資情報工作區，提供投資組合分析、FCN 監控與風險中心的測試入口。",
});

export default function ProPage() {
  return <ProWorkspaceHub />;
}
