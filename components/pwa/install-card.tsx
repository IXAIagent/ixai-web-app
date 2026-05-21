"use client";

import { Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneMode() {
  const nav = navigator as Navigator & { standalone?: boolean };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in nav && Boolean(nav.standalone))
  );
}

function isIosLike() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function PwaInstallCard() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const syncClientState = window.setTimeout(() => {
      setIsStandalone(isStandaloneMode());
      setIsIos(isIosLike());
    }, 0);

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.clearTimeout(syncClientState);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice.catch(() => null);
    setInstallEvent(null);
  }

  if (isStandalone) {
    return (
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-1 h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              IXAI App
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              你正在以 App 模式使用 IXAI。
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
              App 模式仍以即時網路資料為準；市場報價、風險提醒與最新簡報需要連線才能更新。
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.34)] bg-[rgba(255,250,240,0.82)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-1 h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Install IXAI
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
              安裝 IXAI 到主畫面。
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">
              方便每天查看 Daily Brief、Market Pulse 與自選觀察。IXAI 不會把離線舊報價當成即時資料。
            </p>
            {isIos ? (
              <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                iPhone / iPad：請用 Safari 開啟，點選分享，再選「加入主畫面」。
              </p>
            ) : (
              <p className="mt-2 text-xs leading-6 text-[var(--ixai-forest-soft)]">
                Chrome / Edge：若瀏覽器支援，會顯示安裝按鈕；也可從網址列安裝圖示加入。
              </p>
            )}
          </div>
        </div>
        {installEvent ? (
          <button
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
            onClick={handleInstall}
            type="button"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            安裝 IXAI
          </button>
        ) : null}
      </div>
    </section>
  );
}
