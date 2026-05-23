// v1.29.5 — local "I have seen this hint" markers for first-visit
// onboarding. localStorage only, no Supabase write. Heavy onboarding flows
// live in the future Pro layer; Public App just remembers "you've already
// been shown the welcome banner once."

export const ONBOARDING_MARKERS = {
  homeWelcome: "ixai_onboarding_seen_v1",
  fcnIntro: "ixai_fcn_intro_seen_v1",
} as const;

export type OnboardingMarkerKey = keyof typeof ONBOARDING_MARKERS;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readOnboardingSeen(marker: OnboardingMarkerKey): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    return Boolean(window.localStorage.getItem(ONBOARDING_MARKERS[marker]));
  } catch {
    return false;
  }
}

export function markOnboardingSeen(marker: OnboardingMarkerKey): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(ONBOARDING_MARKERS[marker], new Date().toISOString());
  } catch {
    // localStorage quota / private mode — first-visit hint will reappear
    // next session, which is acceptable.
  }
}
