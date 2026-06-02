"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Database, ShieldCheck } from "lucide-react";

type BackendHealth = {
  ok: boolean;
  backendUrlConfigured: boolean;
  backendStatus: string;
  checkedAt: string;
  source: "ixai-backend";
};

type BackendUiState =
  | { label: "Checking"; tone: "pending"; detail: "Checking backend connection..." }
  | { label: "Connected"; tone: "ok"; detail: string }
  | { label: "Not configured"; tone: "muted"; detail: string }
  | { label: "Unavailable"; tone: "warning"; detail: string };

const IXAI_PRO_LAB_URL = "https://ixai-website-clean.vercel.app/";

function mapBackendState(health: BackendHealth | null, failed: boolean): BackendUiState {
  if (!health && !failed) {
    return {
      label: "Checking",
      tone: "pending",
      detail: "Checking backend connection...",
    };
  }

  if (!health || failed) {
    return {
      label: "Unavailable",
      tone: "warning",
      detail: "Backend health proxy could not reach IXAI backend.",
    };
  }

  if (health.ok) {
    return {
      label: "Connected",
      tone: "ok",
      detail: `IXAI backend responded: ${health.backendStatus}.`,
    };
  }

  if (!health.backendUrlConfigured) {
    return {
      label: "Not configured",
      tone: "muted",
      detail: "IXAI_BACKEND_URL is not configured for this environment.",
    };
  }

  return {
    label: "Unavailable",
    tone: "warning",
    detail: `IXAI backend status: ${health.backendStatus}.`,
  };
}

function toneClass(tone: BackendUiState["tone"]) {
  if (tone === "ok") {
    return "border-emerald-700/20 bg-emerald-50/70 text-emerald-900";
  }

  if (tone === "warning") {
    return "border-amber-700/22 bg-amber-50/80 text-amber-950";
  }

  return "border-[var(--ixai-border)] bg-white/50 text-[var(--ixai-forest)]";
}

export function ProLabConnectionCard({
  source,
  showBackendStatus = false,
}: {
  source: "account" | "pro" | "pro_preview";
  showBackendStatus?: boolean;
}) {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!showBackendStatus) {
      return;
    }

    let mounted = true;

    fetch("/api/backend/health", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as BackendHealth;
        if (mounted) {
          setHealth(payload);
          setFailed(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setFailed(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, [showBackendStatus]);

  const backend = mapBackendState(health, failed);
  const sourceLabel =
    source === "account" ? "Account" : source === "pro" ? "Pro" : "Pro Preview";

  return (
    <section className="rounded-lg border border-[rgba(176,141,87,0.3)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            IXAI Pro Lab · {sourceLabel}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
            IXAI App 正在連接 Pro portfolio / FCN / risk intelligence。
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Portfolio, FCN, and risk intelligence are being integrated from IXAI Pro Lab.
            目前 Pro Lab 是獨立 preview dashboard；未來會逐步整合到 app.ixuan.ai
            的 Account / Pro Intelligence flow。
          </p>
        </div>

        {showBackendStatus ? (
          <div className={`min-w-[190px] rounded-lg border px-3 py-2 ${toneClass(backend.tone)}`}>
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Backend
            </p>
            <p className="mt-1 text-sm font-semibold">{backend.label}</p>
            <p className="mt-1 text-xs leading-5 opacity-80">{backend.detail}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
        <a
          className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
          href={IXAI_PRO_LAB_URL}
          rel="noreferrer"
          target="_blank"
        >
          <span>Open IXAI Pro Lab</span>
          <ArrowUpRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
        </a>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
          href="/pro"
        >
          <ShieldCheck className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          Explore Pro
        </Link>
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
        This connection layer does not load portfolio holdings, FCN positions, broker data,
        paid entitlement, or personalized recommendations.
      </p>
    </section>
  );
}
