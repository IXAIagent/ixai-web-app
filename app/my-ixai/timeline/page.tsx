import { TimelineExperienceWorkspace } from "@/components/timeline/timeline-experience-workspace";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/timeline",
  description:
    "IXAI Workspace Timeline aggregates FCN schedule events and dated alerts into read-only future event buckets.",
  title: "Timeline | 我的 IXAI",
});

export default function MyIxaiTimelinePage() {
  return <TimelineExperienceWorkspace />;
}
