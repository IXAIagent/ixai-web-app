import { IntelligenceLanding } from "@/components/home/intelligence-landing";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "IXAI — 一玄 AI 投資助理",
  description:
    "一玄 AI 投資助理協助台灣投資人閱讀市場情報、理解 FCN 風險，並銜接 IXAI Pro 投資組合與風險監控工作區。",
  keywords: [
    "IXAI",
    "一玄",
    "AI 投資助理",
    "每日晨報",
    "FCN 監控",
    "投資組合分析",
    "風險中心",
    "投資顧問",
  ],
  canonical: "/",
});

export default function Home() {
  return <IntelligenceLanding />;
}
