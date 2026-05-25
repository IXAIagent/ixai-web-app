import { EmailCapture } from "@/components/distribution/email-capture";

export function ProWaitlistCta({
  requestedFeature = "portfolio_intelligence",
  surface = "pro_waitlist",
}: {
  requestedFeature?: string;
  surface?: string;
}) {
  return (
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
  );
}
