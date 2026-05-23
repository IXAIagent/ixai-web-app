"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_CHANNELS,
  loadNotificationPreferences,
  saveNotificationPreferences,
  updateNotificationPreference,
  type NotificationChannelKey,
  type NotificationPreferences,
} from "@/src/lib/pwa/notification-preferences";

export function NotificationPreferencesPanel() {
  // SSR uses defaults so the panel hydrates without layout shift; the real
  // localStorage value is loaded once on the client.
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setPrefs(loadNotificationPreferences());
      setHydrated(true);
    }, 0);

    return () => {
      window.clearTimeout(handle);
    };
  }, []);

  function toggle(key: NotificationChannelKey) {
    setPrefs((current) => {
      const next = updateNotificationPreference(current, key, !current[key]);
      saveNotificationPreferences(next);
      return next;
    });
  }

  return (
    <div className="grid gap-3 sm:gap-4">
      {NOTIFICATION_CHANNELS.map((channel) => {
        const checked = prefs[channel.key];

        return (
          <label
            className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 transition active:scale-[0.995] sm:p-5"
            key={channel.key}
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                {channel.label}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {channel.description}
              </p>
            </div>
            <span
              aria-checked={checked}
              aria-disabled={!hydrated}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${
                checked
                  ? "border-[var(--ixai-forest)] bg-[var(--ixai-forest)]"
                  : "border-[var(--ixai-border)] bg-white/55"
              } ${hydrated ? "" : "opacity-60"}`}
              role="switch"
            >
              <span
                className={`absolute h-5 w-5 rounded-full bg-[var(--ixai-cream)] shadow-[0_2px_6px_rgba(9,41,31,0.18)] transition ${
                  checked ? "translate-x-6" : "translate-x-1"
                }`}
              />
              <input
                aria-label={channel.label}
                checked={checked}
                className="sr-only"
                disabled={!hydrated}
                onChange={() => toggle(channel.key)}
                type="checkbox"
              />
            </span>
          </label>
        );
      })}
    </div>
  );
}
