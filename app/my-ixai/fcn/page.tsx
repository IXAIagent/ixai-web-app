import { FcnCenterWorkspace } from "@/components/fcn/fcn-center-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/fcn",
  description:
    "FCN Center 顯示 FCN draft positions、underlyings、KI / KO、observation schedules 與 coupon schedule readback。",
  title: "FCN Center | 我的 IXAI",
});

export default function MyIxaiFcnPage() {
  return <FcnCenterWorkspace />;
}
