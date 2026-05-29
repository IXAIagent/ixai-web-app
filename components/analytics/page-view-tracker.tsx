"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { registerAnalyticsProvider, safePage, safeTrack } from "@/src/lib/analytics/analytics";
import { createPosthogProvider } from "@/src/lib/analytics/posthog-provider";
import { getAttributionPayload } from "@/src/lib/distribution/attribution";
import { getDeviceType } from "@/src/lib/analytics/schema";
import type { AnalyticsEventName } from "@/src/lib/analytics/schema";

const DEPTHS = [25, 50, 75, 100] as const;

function inferSurface(pathname: string) {
  if (pathname.startsWith("/daily-brief/")) return "daily";
  if (pathname.startsWith("/weekly-brief/")) return "weekly";
  if (pathname.startsWith("/market")) return "market";
  if (pathname.startsWith("/fcn")) return "fcn";
  if (pathname === "/") return "home";
  return "public";
}

function inferOpenEvent(pathname: string): AnalyticsEventName | null {
  if (pathname.startsWith("/daily-brief")) return "daily_open";
  if (pathname.startsWith("/weekly-brief")) return "weekly_open";
  if (pathname.startsWith("/market")) return "market_open";
  if (pathname.startsWith("/fcn")) return "fcn_open";
  return null;
}

function isPublicIntelligencePath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/daily-brief") ||
    pathname.startsWith("/share") ||
    pathname.startsWith("/weekly-brief")
  );
}

function shouldTrackReadDepth(pathname: string) {
  return pathname.startsWith("/daily-brief/") || pathname.startsWith("/weekly-brief/");
}

function getDeviceWidth() {
  return typeof window === "undefined" ? undefined : window.innerWidth;
}

export function PageViewTracker() {
  const pathname = usePathname();
  const initialized = useRef(false);
  const depthPath = useRef("");
  const firedDepths = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    registerAnalyticsProvider(createPosthogProvider());
    initialized.current = true;
  }, []);

  useEffect(() => {
    const attribution = getAttributionPayload();
    const surface = inferSurface(pathname);
    const path = `${pathname}${window.location.search || ""}`;
    const timestamp = new Date().toISOString();
    const deviceType = getDeviceType(getDeviceWidth());
    const referrer = document.referrer || attribution.referrer;

    safePage(path, {
      surface,
      path,
      timestamp,
      attribution,
      deviceType,
      referrer,
    });

    const openEvent = inferOpenEvent(pathname);

    if (openEvent) {
      safeTrack(openEvent, {
        surface,
        path,
        timestamp,
        attribution,
        deviceType,
        referrer,
      });
    }

    if (isPublicIntelligencePath(pathname)) {
      safeTrack("public_intelligence_view", {
        surface,
        path,
        timestamp,
        attribution,
        deviceType,
        referrer,
      });
    }

    depthPath.current = pathname;
    firedDepths.current = new Set();
  }, [pathname]);

  useEffect(() => {
    if (!shouldTrackReadDepth(pathname)) {
      return;
    }

    let ticking = false;

    function measureDepth() {
      ticking = false;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight <= 0 ? 100 : Math.min(100, Math.round((scrollTop / docHeight) * 100));
      const surface = inferSurface(pathname);
      const path = `${pathname}${window.location.search || ""}`;

      for (const depth of DEPTHS) {
        if (percent >= depth && !firedDepths.current.has(depth)) {
          firedDepths.current.add(depth);
          safeTrack("article_read_depth", {
            surface,
            path,
            depth,
            timestamp: new Date().toISOString(),
            attribution: getAttributionPayload(),
            deviceType: getDeviceType(getDeviceWidth()),
          });
        }
      }
    }

    function handleScroll() {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(measureDepth);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  return null;
}
