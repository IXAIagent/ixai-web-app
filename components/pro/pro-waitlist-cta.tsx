import { EmailCapture } from "@/components/distribution/email-capture";
import Link from "next/link";

export function ProWaitlistCta({
  requestedFeature = "portfolio_intelligence",
  surface = "pro_waitlist",
}: {
  requestedFeature?: string;
  surface?: string;
}) {
  return (
    <div className="grid gap-3">
      <EmailCapture
        description="加入 IXAI Pro 等候名單，取得 personal portfolio intelligence、FCN 風險監控與 AI market memory 的後續開放通知。此預覽階段不會收費。"
        metadata={{
          intent: "pro_waitlist",
          requested_feature: requestedFeature,
        }}
        surface={surface}
        title="加入 Pro 等候名單"
        variant="inline"
      />
      <Link
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-white/45 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
        href="/pro-preview"
      >
        查看 Pro 預覽控制台
      </Link>
    </div>
  );
}
