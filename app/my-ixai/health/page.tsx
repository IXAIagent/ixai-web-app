import { WorkspaceHealthCenter } from "@/components/workspace/workspace-health-center";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/health",
  description:
    "IXAI Workspace Health Center shows read-only provider, cache, runtime safety, data quality, and i18n readiness for Beta verification.",
  title: "Workspace Health | 我的 IXAI",
});

export default function WorkspaceHealthPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-3 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <WorkspaceHealthCenter />
    </main>
  );
}
