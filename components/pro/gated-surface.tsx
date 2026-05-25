"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import type { IntelligenceSurface } from "@/src/lib/intelligence/access";
import { getSurfaceAccessState } from "@/src/lib/intelligence/access";
import { GatedOverlay } from "@/components/pro/gated-overlay";

export function GatedSurface({
  children,
  membership = "free",
  source = "gated_surface",
  surface,
}: {
  children: ReactNode;
  membership?: "free" | "pro" | "enterprise";
  source?: string;
  surface: IntelligenceSurface;
}) {
  const access = getSurfaceAccessState(surface, { plan: membership });

  useEffect(() => {
    trackEvent("gated_surface_view", {
      membership,
      source,
      surface,
    });
  }, [membership, source, surface]);

  if (access.allowed && access.state === "allowed") {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-48 blur-[1.5px]">
        {children}
      </div>
      <div className="absolute inset-x-3 top-6 z-10 sm:inset-x-6">
        <GatedOverlay membership={membership} source={source} surface={surface} />
      </div>
    </div>
  );
}
