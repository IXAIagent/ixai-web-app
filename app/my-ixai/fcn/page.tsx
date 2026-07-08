import { FcnExperienceWorkspace } from "@/components/fcn/fcn-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/fcn",
  description:
    "IXAI FCN 監控整理 KI 距離、觀察日、配息、到期與需要留意的產品。",
  title: "FCN | 我的 IXAI",
});

export default function MyIxaiFcnPage() {
  return <FcnExperienceWorkspace />;
}
