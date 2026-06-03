import { FeatureGatedPage } from "@/components/pro/feature-gated-page";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "投資組合分析 | IXAI Pro",
  description:
    "IXAI Pro 投資組合分析測試入口，未來將連接資產配置、部位整理與 AI 投資筆記。",
  canonical: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <FeatureGatedPage
      description="投資組合分析會在 Pro 權限開放後，將帳號中的投資組合脈絡連接到市場情報。"
      feature="portfolio"
      moduleName="投資組合分析"
      sections={[
        {
          copy: "測試版會先整理帳號層級總覽；目前不串接券商，也不讀取真實部位。",
          title: "投資組合總覽",
        },
        {
          copy: "未來可依資產類別、幣別與主題曝險整理配置；目前僅顯示測試版結構。",
          title: "資產配置",
        },
        {
          copy: "未來會建立部位層級工作區；目前不載入持股、券商資料或交易功能。",
          title: "部位整理",
        },
        {
          copy: "未來會把市場情報連到投資組合脈絡，但不提供買賣指令。",
          title: "AI 投資筆記",
        },
      ]}
    />
  );
}
