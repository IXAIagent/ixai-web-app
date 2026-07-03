import { FcnExperienceWorkspace } from "@/components/fcn/fcn-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/fcn",
  description:
    "FCN Risk Workspace 顯示 FCN 風險、KI 距離、觀察日、配息、到期與進階資料狀態。",
  title: "FCN Risk Workspace | 我的 IXAI",
});

export default function MyIxaiFcnPage() {
  return <FcnExperienceWorkspace />;
}
