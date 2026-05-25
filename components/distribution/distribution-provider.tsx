"use client";

import { useEffect } from "react";
import { captureAttributionFromLocation } from "@/src/lib/distribution/attribution";

// v1.34 — Distribution provider. Captures UTM attribution from the
// landing URL once per session and persists it in sessionStorage. No
// children rendering — mounts at the layout root next to other
// providers so attribution is ready before any distribution component
// reads it. No analytics calls.
export function DistributionProvider() {
  useEffect(() => {
    captureAttributionFromLocation();
  }, []);

  return null;
}
