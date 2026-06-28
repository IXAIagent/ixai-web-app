"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, RefreshCw } from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { getWorkspaceCopilotSummary } from "@/src/lib/copilot";
import type { WorkspaceCopilotSummary } from "@/src/lib/copilot";
import { runWorkspaceRuntimeBudget, runWorkspaceSafe } from "@/src/lib/workspace/runtime-safety";

function buildSafeCopilotShell(): WorkspaceCopilotSummary {
  return {
    capabilityCount: 1,
    explanations: [
      {
        capability: "explain_data_quality",
        id: "copilot-safe-shell",
        sourceEngine: "safe_shell",
        summary:
          "Copilot diagnostics are paused until you request a refresh. This keeps route entry lightweight while preserving explain-only behavior.",
        title: "Runtime-safe Copilot shell",
      },
    ],
    generatedAt: new Date().toISOString(),
    informationalOnlyDisclaimer:
      "Workspace Copilot is rule-based and explain-only. It does not call AI models and does not provide buy, sell, hold, target price, or order instructions.",
    mode: "rule_based_explain_only",
  };
}

export function WorkspaceCopilotSummary() {
  const [summary, setSummary] = useState<WorkspaceCopilotSummary>(() => buildSafeCopilotShell());
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function refresh() {
    setIsLoading(true);
    const fallback = buildSafeCopilotShell();
    const result = await runWorkspaceRuntimeBudget(
      "copilot-summary-manual-refresh",
      () =>
        runWorkspaceSafe(
          "workspace-copilot-summary",
          getWorkspaceCopilotSummary,
          fallback,
        ),
      {
        data: fallback,
        error: null,
        label: "workspace-copilot-summary",
        ok: true,
      },
      { threshold: 3, timeoutMs: 3000 },
    );

    if (!mountedRef.current) {
      return;
    }

    setSummary(result.data ?? fallback);
    setIsLoading(false);
  }

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Bot} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Workspace Copilot
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
              Explain-only workspace assistant
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
              Rule-based explanation templates for Portfolio, Risk, FCN, Schedule, Alerts, and data quality. No AI model calls are used.
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)] disabled:opacity-60"
          disabled={isLoading}
          onClick={() => void refresh()}
          type="button"
        >
          <RefreshCw className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {isLoading ? "讀取中" : "Run summary"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {summary?.explanations.map((item) => (
          <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4" key={item.id}>
            <p className="text-base font-semibold text-[var(--ixai-forest)]">{item.title}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]">{item.capability} · {item.sourceEngine}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--ixai-forest-soft)]">{item.summary}</p>
          </article>
        ))}
      </div>

      {summary ? (
        <p className="mt-5 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          {summary.informationalOnlyDisclaimer}
        </p>
      ) : null}
    </section>
  );
}
