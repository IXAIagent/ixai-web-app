// v1.36.2 — Analytics → Subscriber Profile sync.
//
// Routes analytics-style events through to the subscriber profile
// repository. Fire-and-forget: a failed Supabase write or a missing
// email must NEVER block UI / analytics fire-and-forget paths.
//
// Today we only update profiles when an explicit email is known (the
// payload carries email, or the call site already has a normalizedEmail
// from a previous subscribe flow). The hook into anonymous distinct
// IDs lives in v1.36.3 funnel aggregation; this module is intentionally
// scoped to known-email aggregation.

import { log } from "@/src/lib/log";
import type { AnalyticsEventName } from "@/src/lib/analytics/schema";
import {
  incrementProfileRead,
  incrementProfileShare,
  updateProfileReadDepth,
  upsertSubscriberProfile,
  type SubscriberSurface,
} from "@/src/lib/subscribers/profiles";

type ProfileSyncContext = {
  email?: string;
  surface?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  depthPercent?: number;
};

function pickSurface(surface?: string): SubscriberSurface | null {
  if (!surface) {
    return null;
  }
  const trimmed = surface.toLowerCase();
  if (trimmed.includes("weekly")) return "weekly";
  if (trimmed.includes("daily")) return "daily";
  if (trimmed.includes("market")) return "market";
  if (trimmed.includes("fcn")) return "fcn";
  return null;
}

async function safe<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    log.warn("[ixai.profileSync] mutation failed", error);
    return null;
  }
}

export async function syncProfileFromEvent(
  event: AnalyticsEventName,
  context: ProfileSyncContext,
): Promise<void> {
  const email = context.email?.trim();
  if (!email) {
    return;
  }

  try {
    if (
      event === "weekly_open" ||
      event === "daily_open" ||
      event === "market_open" ||
      event === "fcn_open"
    ) {
      const surface = pickSurface(event.replace(/_open$/, ""));
      if (surface) {
        await safe(incrementProfileRead({ email, surface }));
      }
      return;
    }

    if (
      event === "share_to_x" ||
      event === "share_to_line" ||
      event === "share_to_linkedin" ||
      event === "share_click"
    ) {
      await safe(incrementProfileShare(email));
      return;
    }

    if (event === "article_read_depth" && typeof context.depthPercent === "number") {
      await safe(updateProfileReadDepth({ email, depthPercent: context.depthPercent }));
      return;
    }

    if (event === "email_capture_success") {
      await safe(
        upsertSubscriberProfile({
          email,
          utmSource: context.utmSource,
          utmMedium: context.utmMedium,
          utmCampaign: context.utmCampaign,
          metadata: context.surface ? { capture_surface: context.surface } : undefined,
        }),
      );
      return;
    }
  } catch (error) {
    // Belt-and-suspenders: outer try keeps a failed safe() from leaking.
    log.warn("[ixai.profileSync] unhandled event sync error", error);
  }
}

// Identity bridge: when the analytics layer learns an email-bearing
// identity, ensure a profile row exists and the last_seen_at + UTM
// attribution carry over. Fire-and-forget.
export async function syncProfileFromIdentity(input: {
  email: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): Promise<void> {
  try {
    await safe(upsertSubscriberProfile(input));
  } catch (error) {
    log.warn("[ixai.profileSync] identity sync failed", error);
  }
}
