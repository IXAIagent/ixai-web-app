"use client";

import { useEffect, useState } from "react";
import { ArrowDownToLine, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Platform = "unknown" | "ios" | "android-or-desktop";

function detectStandalone(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const nav = window.navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in nav && Boolean(nav.standalone))
  );
}

function detectPlatform(): Platform {
  if (typeof window === "undefined") {
    return "unknown";
  }

  if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
    return "ios";
  }

  return "android-or-desktop";
}

export function InstallAppCard() {
  // SSR neutral state so hydration matches; real platform read after mount.
  const [mounted, setMounted] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [isStandalone, setIsStandalone] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setMounted(true);
      setPlatform(detectPlatform());
      setIsStandalone(detectStandalone());
    }, 0);

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.clearTimeout(handle);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    try {
      await installEvent.prompt();
      await installEvent.userChoice.catch(() => null);
    } finally {
      setInstallEvent(null);
    }
  }

  if (!mounted || isStandalone) {
    return null;
  }

  const isIos = platform === "ios";

  return (
    <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Add to Home
            </p>
            <h3 className="mt-1.5 text-base font-semibold leading-6 text-[var(--ixai-forest)] sm:text-lg">
              將 IXAI 加入主畫面。
            </h3>
            {isIos ? (
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                iPhone Safari：點選下方分享圖示，選擇「加入主畫面」即可像 App 一樣開啟 IXAI。
              </p>
            ) : (
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                Android Chrome：點下方安裝按鈕，或從瀏覽器選單選擇「安裝 App」。
              </p>
            )}
          </div>
        </div>
        {installEvent ? (
          <button
            className="ixai-cta-forest inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
            onClick={handleInstall}
            type="button"
          >
            <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
            安裝 App
          </button>
        ) : null}
      </div>
    </section>
  );
}
