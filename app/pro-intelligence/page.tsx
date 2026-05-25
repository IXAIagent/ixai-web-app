import { ProIntelligenceShell } from "@/components/pro/pro-intelligence-shell";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import type { MembershipPlan } from "@/src/lib/membership/memberships";

export const metadata = buildPublicMetadata({
  title: "IXAI Pro Intelligence Layer",
  description:
    "IXAI Pro Intelligence Layer preview for future entitlement-aware portfolio, FCN and AI alert workflows.",
});

function readDemoPlan(value: string | string[] | undefined): MembershipPlan {
  const normalized = Array.isArray(value) ? value[0] : value;

  if (normalized === "pro" || normalized === "enterprise") {
    return normalized;
  }

  return "free";
}

export default async function ProIntelligencePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return <ProIntelligenceShell membership={readDemoPlan(params.membership)} />;
}
