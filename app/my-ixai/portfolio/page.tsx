import { PortfolioExperienceWorkspace } from "@/components/portfolio/portfolio-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/portfolio",
  description:
    "IXAI Portfolio 整理總資產、配置、今日表現、持倉與需要補齊的資產資訊。",
  title: "Portfolio | 我的 IXAI",
});

export default function MyIxaiPortfolioPage() {
  return <PortfolioExperienceWorkspace />;
}
