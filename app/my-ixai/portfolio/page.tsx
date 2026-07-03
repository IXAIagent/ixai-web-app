import { PortfolioExperienceWorkspace } from "@/components/portfolio/portfolio-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/portfolio",
  description:
    "IXAI Portfolio Workspace 整理總資產、配置、今日表現、持倉與進階資料狀態。",
  title: "Portfolio | 我的 IXAI",
});

export default function MyIxaiPortfolioPage() {
  return <PortfolioExperienceWorkspace />;
}
