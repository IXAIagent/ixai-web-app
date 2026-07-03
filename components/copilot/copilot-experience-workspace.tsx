"use client";

import { useState } from "react";
import { Bot, Copy, MessageSquareText, ShieldCheck, Sparkles, WalletCards } from "lucide-react";

import { WorkspaceCopilotSummary } from "@/components/copilot/workspace-copilot-summary";
import {
  WorkspaceDiagnosticsPanel,
  WorkspaceKpiGrid,
  WorkspaceProductHero,
  WorkspaceProductSection,
} from "@/components/workspace/product";

const suggestedQuestions = [
  "今天有哪些 FCN 快 KI？",
  "今天最大的風險是什麼？",
  "哪些新聞影響我的 Portfolio？",
  "我的資產配置有哪些需要留意？",
  "今天 Morning Brief 重點是什麼？",
];

export function CopilotExperienceWorkspace() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyQuestion(question: string) {
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
          eyebrow="AI Assistant"
          kpis={[
            { description: "可直接複製或用作提問起點。", icon: MessageSquareText, label: "Suggested Questions", value: String(suggestedQuestions.length) },
            { description: "目前以 rule-based summary 呈現。", icon: Bot, label: "Recent Conversations", value: "準備中" },
            { description: "點擊產生摘要後才整理 Workspace 脈絡。", icon: WalletCards, label: "Available Context", value: "手動整理" },
            { description: "只做 explain-only，不提供交易指令。", icon: ShieldCheck, label: "Safe Mode", value: "開啟" },
          ]}
          side={
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                你可以問
              </p>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-white/72">
                {suggestedQuestions.slice(0, 3).map((question) => (
                  <p key={question}>{question}</p>
                ))}
              </div>
            </>
          }
          summary="Copilot 是 IXAI 的 explain-only 問答入口，協助你把 Morning Brief、Portfolio、FCN、Risk 與市場重點整理成可追問的問題。"
          title="問 IXAI：把今天的重點變成可理解的問題。"
        />

        <WorkspaceProductSection
          description="先提供可用問題，避免使用者面對空白聊天頁不知道從哪裡開始。"
          eyebrow="Suggested Questions"
          title="你可以這樣問"
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
              已複製：{copied}
            </p>
          ) : null}
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="尚未有對話歷史時，先用 friendly guidance 說明 Copilot 可以協助整理什麼。"
          eyebrow="Empty State"
          title="開始前，你可以先選一個問題"
        >
          <div className="rounded-lg border border-[var(--ixai-border)] bg-white/68 p-4">
            <p className="text-base font-semibold text-[var(--ixai-forest)]">目前沒有歷史對話</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
              從 FCN、今日風險、Portfolio 影響或 Morning Brief 開始。Copilot 只整理與解釋，不提供買賣建議。
            </p>
          </div>
        </WorkspaceProductSection>

        <WorkspaceProductSection
          description="保留既有 manual run 功能，但不讓工具狀態成為第一眼內容。"
          eyebrow="Conversation"
          title="產生 explain-only 摘要"
        >
          <WorkspaceCopilotSummary />
        </WorkspaceProductSection>

        <WorkspaceDiagnosticsPanel description="摘要整理方式與安全邊界">
          <WorkspaceKpiGrid
            items={[
              { description: "初始載入不自動整理完整工作區資料。", icon: Sparkles, label: "整理方式", value: "手動" },
              { description: "Copilot 不呼叫外部 AI model。", icon: ShieldCheck, label: "Mode", value: "Explain-only" },
              { description: "點擊產生摘要後才執行。", icon: Bot, label: "Generated", value: "待手動執行" },
            ]}
          />
          <p className="rounded-lg border border-[var(--ixai-border)] bg-white/62 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
            Copilot 只整理既有工作區資訊並提供說明，不呼叫外部 AI model，也不提供買進、賣出、持有、目標價或下單指令。
          </p>
        </WorkspaceDiagnosticsPanel>
      </section>
    </main>
  );
}
