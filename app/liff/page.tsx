import { LiffEntryCard } from "@/components/line/liff-entry-card";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { getLiffConfig } from "@/src/lib/line/liff";

export const metadata = buildPublicMetadata({
  title: "IXAI LIFF",
  description: "IXAI LINE Login 與 LIFF identity restore 基礎入口。",
});

export default function LiffPage() {
  const config = getLiffConfig();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <LiffEntryCard
        liffId={config.liffId}
        liffReady={config.liffReady}
        lineLoginReady={config.lineLoginReady}
        officialAccountUrl={config.officialAccountUrl}
      />
    </div>
  );
}
