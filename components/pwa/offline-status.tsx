"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function syncOnlineState() {
      setIsOffline(!navigator.onLine);
    }

    syncOnlineState();
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);

    return () => {
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl rounded-lg border border-[rgba(176,141,87,0.42)] bg-[rgba(255,250,240,0.96)] p-3 text-sm leading-6 text-[var(--ixai-forest)] shadow-[0_18px_48px_rgba(9,41,31,0.16)] backdrop-blur md:bottom-4 md:left-auto md:right-4 md:mx-0">
      <div className="flex items-start gap-3">
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ixai-gold)]" aria-hidden="true" />
        <p>
          目前離線，市場資料與最新簡報可能無法更新。請重新連線後再查看即時行情與最新風險觀察。
        </p>
      </div>
    </div>
  );
}
