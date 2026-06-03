import { ProPreviewDashboard } from "@/components/pro/pro-preview-dashboard";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "IXAI Pro 預覽控制台",
  description:
    "IXAI Pro 的示意預覽控制台，展示投資組合分析、FCN 風險監控與 AI 警示工作流。",
});

export default function ProPreviewPage() {
  return <ProPreviewDashboard />;
}
