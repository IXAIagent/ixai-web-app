"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Link as LinkIcon, MessageCircle, Send, Share2 } from "lucide-react";
import { trackEvent } from "@/src/lib/analytics/analytics";
import {
  buildLineShareUrl,
  buildLinkedInShareUrl,
  buildTelegramShareUrl,
  buildXShareUrl,
  type ShareCopy,
} from "@/src/lib/share/share-copy";

// v1.33 — Share row used on home / daily / weekly / fcn surfaces.
//
//   - Mobile: navigator.share first when available (uses the OS share
//     sheet so LINE / Messages / IG appear natively).
//   - Desktop: classic per-network URL share buttons + clipboard copy.
//
// trackEvent("share_click") fires with channel + surface so analytics
// can see which network drives distribution.

type ShareSurface = "home" | "weekly" | "daily" | "fcn" | "share";

type ChannelButtonProps = {
  label: string;
  icon: typeof LinkIcon;
  onClick: () => void;
};

function ChannelButton({ label, icon: Icon, onClick }: ChannelButtonProps) {
  return (
    <button
      aria-label={label}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-3 py-2 text-xs font-medium text-[var(--ixai-forest)] transition active:scale-[0.98] hover:bg-white/75"
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
      {label}
    </button>
  );
}

export function ShareActions({
  copy,
  surface,
  variant = "light",
}: {
  copy: ShareCopy;
  surface: ShareSurface;
  variant?: "light" | "dark";
}) {
  const [copied, setCopied] = useState(false);

  const handleNativeShare = useCallback(async () => {
    trackEvent("share_click", { surface, channel: "native" });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: copy.title,
          text: copy.body,
          url: copy.url,
        });
      } catch {
        // User cancelled OS sheet — no follow-up needed.
      }
    }
  }, [copy, surface]);

  const handleCopy = useCallback(async () => {
    trackEvent("share_click", { surface, channel: "copy" });
    try {
      await navigator.clipboard.writeText(copy.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback no-op; clipboard API may be unavailable in private mode.
    }
  }, [copy, surface]);

  function externalShare(channel: string, href: string) {
    trackEvent("share_click", { surface, channel });
    if (channel === "x") {
      trackEvent("share_to_x", { surface });
    }
    if (channel === "linkedin") {
      trackEvent("share_to_linkedin", { surface });
    }
    if (channel === "line") {
      trackEvent("share_to_line", { surface });
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  const isDark = variant === "dark";

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${
        isDark ? "text-[rgba(245,240,230,0.82)]" : "text-[var(--ixai-forest)]"
      }`}
    >
      <button
        aria-label="Share via OS share sheet"
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition active:scale-[0.98] ${
          isDark
            ? "border border-[rgba(176,141,87,0.42)] bg-white/[0.05] text-[var(--ixai-cream)] hover:bg-white/[0.12]"
            : "ixai-cta-forest bg-[var(--ixai-forest)]"
        }`}
        onClick={handleNativeShare}
        type="button"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share
      </button>

      <ChannelButton
        icon={copied ? Check : Copy}
        label={copied ? "Copied" : "Copy link"}
        onClick={handleCopy}
      />
      <ChannelButton
        icon={LinkIcon}
        label="X / Twitter"
        onClick={() => externalShare("x", buildXShareUrl(copy))}
      />
      <ChannelButton
        icon={LinkIcon}
        label="LinkedIn"
        onClick={() => externalShare("linkedin", buildLinkedInShareUrl(copy))}
      />
      <ChannelButton
        icon={Send}
        label="Telegram"
        onClick={() => externalShare("telegram", buildTelegramShareUrl(copy))}
      />
      <ChannelButton
        icon={MessageCircle}
        label="LINE"
        onClick={() => externalShare("line", buildLineShareUrl(copy))}
      />
    </div>
  );
}
