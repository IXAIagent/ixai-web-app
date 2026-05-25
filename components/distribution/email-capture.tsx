"use client";

import { useState } from "react";
import { ArrowRight, Check, Mail } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import {
  getAnonymousDistinctId,
  safeAlias,
  safeIdentify,
} from "@/src/lib/analytics/identity";
import { getAttributionPayload } from "@/src/lib/distribution/attribution";

// v1.34+ — Email Capture foundation. Institutional cream card; no
// newsletter / spam tone. Posts to /api/distribution/subscribe and
// stitches anonymous analytics into a known subscriber after success.

type CaptureState = "idle" | "loading" | "success" | "error";

const DEFAULT_TITLE = "Get weekly market intelligence";
const DEFAULT_DESCRIPTION =
  "AI-assisted weekly strategist narrative for AI, macro, Taiwan semis, crypto and FCN risk intelligence.";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function EmailCapture({
  surface = "home",
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  variant = "card",
}: {
  surface?: string;
  title?: string;
  description?: string;
  variant?: "card" | "inline";
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<CaptureState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!isValidEmail(value)) {
      setErrorMessage("Email format is not valid.");
      setState("error");
      trackEvent("email_capture_error", { surface, reason: "invalid_email" });
      return;
    }

    setErrorMessage(null);
    setState("loading");
    trackEvent("email_capture_submit", { surface });

    try {
      const attribution = getAttributionPayload();
      const path = `${window.location.pathname}${window.location.search || ""}`;
      const response = await fetch("/api/distribution/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: value,
          surface,
          path,
          attribution,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Subscribe failed.");
      }

      setState("success");

      const normalizedEmail = normalizeEmail(value);
      const anonymousId = getAnonymousDistinctId();
      const subscribedAt = new Date().toISOString();

      if (anonymousId) {
        safeAlias(anonymousId, normalizedEmail);
      }

      safeIdentify(normalizedEmail, {
        email: normalizedEmail,
        subscriber_status: "active",
        first_subscribed_surface: surface,
        subscribed_at: subscribedAt,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        referrer: attribution.referrer,
      });

      trackEvent("email_capture_success", { surface });
    } catch (error) {
      setState("error");
      const reason = error instanceof Error ? error.message : "Subscribe failed.";
      setErrorMessage("Unable to subscribe right now. Please try again later.");
      trackEvent("email_capture_error", { surface, reason: reason.slice(0, 64) });
    }
  }

  const isCard = variant === "card";
  const wrapperClass = isCard
    ? "rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-6"
    : "rounded-2xl border border-[var(--ixai-border)] bg-white/55 p-3.5 sm:p-4";

  return (
    <section className={wrapperClass}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
          <Mail className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          IXAI Intelligence
        </p>
      </div>
      <h2 className="mt-3 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        {description}
      </p>

      {state === "success" ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3.5 text-sm leading-7 text-[var(--ixai-forest)]">
          <Check className="mt-1 h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          <p>
            You&rsquo;re on the list. IXAI Intelligence 會在後續開放時優先通知你。
          </p>
        </div>
      ) : (
        <form
          aria-label="IXAI weekly intelligence subscription"
          className="mt-4 grid gap-2 sm:flex sm:items-center sm:gap-3"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor={`ixai-email-${surface}`}>
            Email address
          </label>
          <input
            autoComplete="email"
            className="min-h-11 w-full flex-1 rounded-lg border border-[var(--ixai-border)] bg-white/82 px-3.5 py-2 text-sm text-[var(--ixai-forest)] outline-none transition focus:border-[var(--ixai-gold)] sm:max-w-md"
            id={`ixai-email-${surface}`}
            inputMode="email"
            name="email"
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === "error") {
                setState("idle");
                setErrorMessage(null);
              }
            }}
            placeholder="you@company.com"
            required
            type="email"
            value={email}
          />
          <button
            className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            disabled={state === "loading"}
            type="submit"
          >
            {state === "loading" ? "Subscribing…" : "Subscribe"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      )}

      {state === "error" && errorMessage ? (
        <p className="mt-3 text-xs leading-6 text-[#7b2a1c]">{errorMessage}</p>
      ) : null}

      <p className="mt-3 text-[11px] leading-5 text-[var(--ixai-ink-muted)]">
        Submitted as part of IXAI Public Beta. No marketing spam; institutional risk-first read only.
      </p>
    </section>
  );
}
