import { GlobalRiskCenterWorkspace } from "@/components/risk/global-risk-center-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/risk",
  description:
    "Global Risk Center 讀取 FCN、Stock、Crypto risk sources，顯示 FCN 風險摘要、多資產 readiness、upcoming events 與資料來源狀態。",
  title: "Global Risk Center | 我的 IXAI",
});

export default function MyIxaiRiskPage() {
  return <GlobalRiskCenterWorkspace />;
}
