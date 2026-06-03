import { FeatureGatedPage } from "@/components/pro/feature-gated-page";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "風險中心 | IXAI Pro",
  description:
    "IXAI Pro 風險中心測試入口，未來將整理投資組合風險、集中度與情境監控。",
  canonical: "/risk",
});

export default function RiskPage() {
  return (
    <FeatureGatedPage
      description="風險中心會在 Pro 權限開放後，把投資組合、FCN、市場 regime 與關注清單整理成風險提醒工作流。"
      feature="risk_engine"
      moduleName="風險中心"
      sections={[
        {
          copy: "未來在安全連接帳號資料後，會整理投資組合層級風險狀態。",
          title: "投資組合風險",
        },
        {
          copy: "未來可檢查資產類別、產業、主題與幣別曝險是否過度集中。",
          title: "集中度風險",
        },
        {
          copy: "未來可觀察利率、波動率、AI 回檔與流動性壓力情境。",
          title: "情境監控",
        },
        {
          copy: "未來可提供風險意識提醒；不產生買賣訊號。",
          title: "AI 風險提醒",
        },
      ]}
    />
  );
}
