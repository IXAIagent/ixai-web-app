import { TimelineExperienceWorkspace } from "@/components/timeline/timeline-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/timeline",
  description:
    "IXAI Timeline 整理今天、明天與本週接下來會發生的投資相關事件。",
  title: "Timeline | 我的 IXAI",
});

export default function MyIxaiTimelinePage() {
  return <TimelineExperienceWorkspace />;
}
