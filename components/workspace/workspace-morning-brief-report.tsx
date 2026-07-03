"use client";

import { CalendarClock, Newspaper, ShieldCheck, Sparkles } from "lucide-react";

import { WorkspaceMorningBriefV14Card } from "@/components/workspace/workspace-morning-brief-v14-card";
import { WorkspaceProductHero } from "@/components/workspace/product";
import { useTranslation } from "@/src/lib/i18n";

export function WorkspaceMorningBriefReport() {
  const { t } = useTranslation("productPolish");

  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
        <WorkspaceProductHero
          actions={[
            { href: "/my-ixai/home", icon: Sparkles, label: t("backHome"), variant: "secondary" },
          ]}
          eyebrow={t("morningBriefHeroEyebrow", "Daily Workspace Report")}
          kpis={[
            { description: t("morningBriefSummaryBody"), icon: Newspaper, label: t("morningBriefDailySummary"), value: t("readFullReport") },
            { description: t("portfolioHeroBody"), icon: ShieldCheck, label: t("morningBriefPortfolio"), value: t("informationOnly") },
            { description: t("workspaceLanguageRule"), icon: CalendarClock, label: t("morningBriefActionPlan"), value: t("morningBriefManualMode") },
          ]}
          summary={t("morningBriefHeroBody")}
          title={t("morningBriefHeroTitle")}
        />

        <WorkspaceMorningBriefV14Card autoLoad={false} />
      </section>
    </main>
  );
}
