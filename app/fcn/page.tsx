import { FeatureGatedPage } from "@/components/pro/feature-gated-page";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "FCN 監控 | IXAI Pro",
  description:
    "IXAI Pro FCN 監控測試入口，未來將整理觀察日、KI / KO 與 Worst-of 風險脈絡。",
  canonical: "/fcn",
});

export default function FCNPage() {
  return (
    <FeatureGatedPage
      description="FCN 監控會在 Pro 權限開放後，整理 KI / KO、Worst-of、觀察日與結構型商品風險脈絡。"
      feature="fcn_monitoring"
      moduleName="FCN 監控"
      sections={[
        {
          copy: "測試版會先建立結構型商品工作區；目前不匯入真實 FCN 部位。",
          title: "FCN 持倉",
        },
        {
          copy: "未來可整理配息與觀察日節奏，協助理解時間風險。",
          title: "配息與觀察日",
        },
        {
          copy: "未來可用於 KI / KO 教育與監控提醒，不提供個人化商品建議。",
          title: "KI / KO 觀察",
        },
        {
          copy: "未來可協助理解哪個連結標的正在主導結構風險。",
          title: "Worst-of 監控",
        },
      ]}
    />
  );
}
