import { FCNCenterWorkspace } from "@/components/fcn/fcn-center-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/fcn",
  description:
    "FCN Center 讀取現有 FCN Wizard 與 Supabase persistence，顯示 FCN positions、underlyings、barrier terms 與 observation schedule。",
  title: "FCN Center | 我的 IXAI",
});

export default function MyIxaiFcnPage() {
  return <FCNCenterWorkspace />;
}
