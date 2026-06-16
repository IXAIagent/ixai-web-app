import { FCNCenterWorkspace } from "@/components/fcn/fcn-center-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/fcn",
  description:
    "FCN Intelligence Center 讀取 Supabase FCN positions，顯示 lifecycle、manual price overlay、KI distance、timeline 與 concentration risk readback。",
  title: "FCN Intelligence Center | 我的 IXAI",
});

export default function MyIxaiFcnPage() {
  return <FCNCenterWorkspace />;
}
