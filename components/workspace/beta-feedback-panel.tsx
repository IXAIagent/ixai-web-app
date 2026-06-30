"use client";

import { useMemo, useState } from "react";
import { Clipboard, FileText } from "lucide-react";

const FEEDBACK_TEMPLATE = [
  "IXAI V14 Beta Preview Feedback",
  "",
  "Route:",
  "What I expected:",
  "What happened:",
  "Console / screen issue:",
  "Data quality state shown:",
  "Device / browser:",
  "Notes:",
  "",
  "Please do not include sensitive account credentials, auth tokens, or private identifiers.",
].join("\n");

export function BetaFeedbackPanel() {
  const [status, setStatus] = useState("Template ready");
  const releaseNotes = useMemo(
    () => [
      "V14 Beta Preview",
      "Live market data, valuation, FCN live risk, Workspace Intelligence, Morning Brief, Timeline, Copilot, Health Center, and Beta readiness are available for invite-only testing.",
      "No trading, broker connection, recommendation, target price, scheduled delivery, AI model call, database write, or external feedback service is enabled by this framework.",
    ],
    [],
  );

  async function copyTemplate() {
    try {
      await navigator.clipboard.writeText(FEEDBACK_TEMPLATE);
      setStatus("Feedback template copied");
    } catch {
      setStatus("Copy unavailable");
    }
  }

  return (
    <section className="rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Feedback / Release Notes
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[var(--ixai-forest)]">
            V14 Beta Preview framework
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            Lightweight local feedback entry. Nothing is sent, stored, emailed, or delivered to an external service in this Sprint.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
          {status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <div className="flex items-start gap-3">
            <FileText className="mt-1 h-5 w-5 text-[var(--ixai-gold)]" aria-hidden="true" />
            <div>
              <p className="font-semibold text-[var(--ixai-forest)]">Release notes</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {releaseNotes.map((item) => (
                  <li className="rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-[var(--ixai-forest)]">Feedback template</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                Copy a local template for manual user feedback collection. This does not write to Supabase or send email.
              </p>
            </div>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]"
              onClick={() => void copyTemplate()}
              type="button"
            >
              <Clipboard className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              Copy Template
            </button>
          </div>
          <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--ixai-border)] bg-white/70 p-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
            {FEEDBACK_TEMPLATE}
          </pre>
        </article>
      </div>
    </section>
  );
}
