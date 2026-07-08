"use client";

import { useState } from "react";
import { Bot, Copy, MessageSquareText, Send, ShieldCheck, Sparkles } from "lucide-react";

import { WorkspaceCopilotSummary } from "@/components/copilot/workspace-copilot-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";

const suggestedQuestions = [
  "Why is my portfolio down today?",
  "Which FCN is closest to KI?",
  "What should I watch tomorrow?",
  "How is TSLA affecting me?",
  "What changed in the market today?",
  "哪些新聞影響我的 Portfolio？",
];

export function CopilotExperienceWorkspace() {
  const [copied, setCopied] = useState<string | null>(null);
  const [draftQuestion, setDraftQuestion] = useState("");

  async function copyQuestion(question: string) {
    setDraftQuestion(question);
    try {
      await navigator.clipboard.writeText(question);
      setCopied(question);
    } catch {
      setCopied(null);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          eyebrow="Copilot"
          kpis={[
            { description: "Questions you can ask immediately.", icon: MessageSquareText, label: "Suggested Questions", value: String(suggestedQuestions.length) },
            { description: "Conversation history will appear below.", icon: Bot, label: "Conversation", value: "Ready" },
            { description: "Only explains existing Workspace context.", icon: ShieldCheck, label: "Safe Boundary", value: "Explain-only" },
            { description: "Manual summary remains available below.", icon: Sparkles, label: "Context", value: "Manual" },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                Ask IXAI...
              </p>
              <div className="mt-3 rounded-lg border border-white/12 bg-white/[0.06] p-4">
                <p className="text-lg font-semibold leading-7 text-white">
                  {draftQuestion || "Why is my portfolio down today?"}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/68">
                  Choose a suggested question or type your own. Copilot is for explanation, not trading instructions.
                </p>
              </div>
            </>
          }
          summary="Copilot has one purpose: ask questions. Runtime, source, and prompt diagnostics stay in Advanced."
          title="Ask IXAI about your portfolio, FCN, risk, or market."
        />

        <WorkspaceProductSection
          description="Start with a real investment-monitoring question instead of a blank technical panel."
          eyebrow="Ask"
          title="Ask IXAI..."
        >
          <div className="rounded-lg border border-[var(--ixai-border)] bg-white/78 p-4">
            <label className="text-sm font-semibold text-[var(--ixai-forest)]" htmlFor="copilot-question">
              Your question
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                className="min-h-12 rounded-lg border border-[var(--ixai-border)] bg-white px-4 text-base text-[var(--ixai-forest)] outline-none focus:border-[var(--ixai-gold)]"
                id="copilot-question"
                onChange={(event) => setDraftQuestion(event.target.value)}
                placeholder="Why is my portfolio down today?"
                type="text"
                value={draftQuestion}
              />
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 text-sm font-semibold text-[var(--ixai-cream)]"
                type="button"
              >
                <Send className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                Ask
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
              This sprint redesigns the question interface only. It does not add AI model calls or new backend behavior.
            </p>
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="Suggested questions make Copilot feel like an assistant, not a runtime panel."
          eyebrow="Suggested Questions"
          title="You can ask this"
        >
          <div className="grid gap-3 lg:grid-cols-2">
            {suggestedQuestions.map((question) => (
              <button
                className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4 text-left text-sm font-semibold text-[var(--ixai-forest)] transition hover:bg-white/90"
                key={question}
                onClick={() => void copyQuestion(question)}
                type="button"
              >
                <span>{question}</span>
                <Copy className="h-4 w-4 shrink-0 text-[var(--ixai-gold)]" aria-hidden="true" />
              </button>
            ))}
          </div>
          {copied ? (
            <p className="mt-3 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-3 text-sm text-[var(--ixai-forest-soft)]">
              Copied and filled: {copied}
            </p>
          ) : null}
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="A clean conversation area. No runtime or rule-based wording in the main layer."
          eyebrow="Conversation"
          title="Conversation"
        >
          <div className="grid gap-3">
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
              <p className="text-base font-semibold text-[var(--ixai-forest)]">No conversation yet.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                Start with portfolio, FCN, risk, market, or Morning Brief questions. IXAI will explain context and next things to monitor.
              </p>
            </article>
            <WorkspaceCopilotSummary />
          </div>
        </WorkspaceProductSection>

        <WorkspaceDiagnosticsPanel description="context, prompt source, readback, safety boundary">
          <WorkspaceKpiGrid
            items={[
              { description: "Initial load does not auto-run a full workspace graph.", icon: Sparkles, label: "Context", value: "Manual" },
              { description: "No external AI model is added by this sprint.", icon: ShieldCheck, label: "Mode", value: "Explain-only" },
              { description: "Suggested prompt source.", icon: Bot, label: "Prompt Source", value: "Static" },
            ]}
          />
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            Copilot only organizes existing Workspace information in this sprint. It does not add AI calls, trading recommendations, target prices, or notification delivery.
          </p>
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}
