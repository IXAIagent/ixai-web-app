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
        description="Join the IXAI Pro waitlist for personal portfolio intelligence, FCN risk monitoring and AI market memory. No payment is required at this preview stage."
        metadata={{
          intent: "pro_waitlist",
          requested_feature: requestedFeature,
        }}
        surface={surface}
        title="Join Pro Waitlist"
        variant="inline"
      />
      <Link
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-white/45 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
        href="/pro-preview"
      >
        View Pro Preview Dashboard
      </Link>
    </div>
  );
}
