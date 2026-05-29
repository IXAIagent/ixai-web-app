"use client";

import { useEffect } from "react";
import { trackEvent } from "@/src/lib/analytics/analytics";

export function ShareIntelligenceTracker({
  category,
  slug,
}: {
  category: string;
  slug: string;
}) {
  useEffect(() => {
    trackEvent("share_page_view", {
      category,
      path: window.location.pathname,
      slug,
      surface: "share_intelligence",
    });
  }, [category, slug]);

  return null;
}
