"use client";

import { trackEvent } from "@/src/lib/analytics/events";
import type { ReactNode } from "react";

// v1.29.5 — small click-trackable wrapper used inside the /feedback page
// so we capture which channel a visitor chooses without coupling
// analytics to the route's server component.
export function FeedbackLink({
  channel,
  className,
  external,
  href,
  children,
}: {
  channel: string;
  className: string;
  external?: boolean;
  href: string;
  children: ReactNode;
}) {
  function handleClick() {
    trackEvent("feedback_click", { channel });
  }

  return (
    <a
      className={className}
      href={href}
      onClick={handleClick}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      {children}
    </a>
  );
}
