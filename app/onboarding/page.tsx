import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "IXAI Onboarding",
  description:
    "建立 IXAI investor profile、watchlist seed、intelligence preference 與 LINE intelligence entry。",
});

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
