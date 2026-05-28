import { IntelligenceLanding } from "@/components/home/intelligence-landing";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "IXAI — AI Investment Intelligence Layer",
  description:
    "讓 AI 開始理解你的投資世界。IXAI 整合市場情報、Watchlist memory、FCN 風險意識與 LINE intelligence delivery。",
  keywords: [
    "IXAI",
    "AI Investment Intelligence",
    "Investment Intelligence",
    "Watchlist Memory",
    "FCN Risk Awareness",
    "LINE Intelligence",
    "AI Wealth OS",
  ],
  canonical: "/",
});

export default function Home() {
  return <IntelligenceLanding />;
}
