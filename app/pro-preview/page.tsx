import { ProPreviewDashboard } from "@/components/pro/pro-preview-dashboard";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "IXAI Pro Preview Dashboard",
  description:
    "A sample-only IXAI Pro dashboard preview for portfolio intelligence, FCN risk monitoring and AI alert workflows.",
});

export default function ProPreviewPage() {
  return <ProPreviewDashboard />;
}
