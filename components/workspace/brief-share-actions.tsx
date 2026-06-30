"use client";

import { useMemo, useState } from "react";
import { Clipboard, Download, Printer } from "lucide-react";

import {
  buildWorkspaceBriefMarkdown,
  buildWorkspaceBriefPlainText,
  buildWorkspaceBriefShareText,
  type WorkspaceMorningBrief,
} from "@/src/lib/workspace/morning-brief";
import { useTranslation } from "@/src/lib/i18n";

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BriefShareActions({ brief }: { brief: WorkspaceMorningBrief }) {
  const { t } = useTranslation("morningBrief");
  const [status, setStatus] = useState<string>("ready");
  const markdown = useMemo(() => buildWorkspaceBriefMarkdown(brief), [brief]);
  const plainText = useMemo(() => buildWorkspaceBriefPlainText(brief), [brief]);
  const shareText = useMemo(() => buildWorkspaceBriefShareText(brief), [brief]);

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(shareText);
      setStatus("copied");
    } catch {
      setStatus("copyUnavailable");
    }
  }

  function exportMarkdown() {
    downloadTextFile(`ixai-workspace-brief-${brief.date}.md`, markdown);
    setStatus("exported");
  }

  function printBrief() {
    window.print();
    setStatus("printOpened");
  }

  return (
    <section className="mt-5 rounded-xl border border-[var(--ixai-border)] bg-white/55 p-4 print:border-0 print:bg-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            {t("shareExport")}
          </p>
          <h3 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            {t("actionTitle")}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
            {t("actionDescription")}
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-[var(--ixai-border)] bg-white/70 px-2.5 py-1 text-xs font-semibold text-[var(--ixai-forest-soft)]">
          {t(status, status)}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row print:hidden">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]"
          onClick={() => void copyBrief()}
          type="button"
        >
          <Clipboard className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {t("copyBrief")}
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]"
          onClick={exportMarkdown}
          type="button"
        >
          <Download className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {t("exportMarkdown")}
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]"
          onClick={printBrief}
          type="button"
        >
          <Printer className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
          {t("printFriendly")}
        </button>
      </div>

      <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] p-3 text-xs leading-5 text-[var(--ixai-forest-soft)] print:max-h-none print:overflow-visible print:border-0 print:bg-white print:text-black">
        {plainText}
      </pre>
    </section>
  );
}
