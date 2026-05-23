"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { registerServiceWorker } from "@/src/lib/pwa/register-sw";

const ADMIN_PATH_PREFIXES = ["/admin", "/api/admin"];

function isAdminPath(pathname: string) {
  return ADMIN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function PwaRegister() {
  const pathname = usePathname();

  useEffect(() => {
    if (isAdminPath(pathname)) {
      return;
    }

    let cancelled = false;

    function run() {
      if (cancelled) {
        return;
      }

      void registerServiceWorker();
    }

    if (document.readyState === "complete") {
      run();
    } else {
      window.addEventListener("load", run, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", run);
    };
  }, [pathname]);

  return null;
}
