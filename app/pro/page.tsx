import { ProWorkspaceHub } from "@/components/pro/pro-workspace-hub";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "IXAI Pro Workspace",
  description:
    "IXAI Pro Workspace is the beta product hub for Portfolio Intelligence, FCN Monitoring, and Risk Engine inside app.ixuan.ai.",
});

export default function ProPage() {
  return <ProWorkspaceHub />;
}
