import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Globe2,
  KeyRound,
  Languages,
  Settings,
  ShieldCheck,
  UserCircle,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { I18nFoundationStatusCard } from "@/components/i18n/i18n-foundation-status-card";
import { LocalizationPreferenceCard } from "@/components/i18n/localization-preference-card";
import { TranslatedText } from "@/components/i18n/translated-text";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { SettingsRuntimeDiagnosticsControl } from "@/components/workspace/settings-runtime-diagnostics-control";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  canonical: "/my-ixai/settings",
  description:
    "Settings 是 IXAI Workspace 的帳號、偏好、通知、語言、地區與未來 broker connection 設定預覽。",
  title: "Settings | 我的 IXAI",
});

const settingsAreas = [
  {
    descriptionKey: "accountDescription",
    href: "/account",
    icon: UserCircle,
    labelKey: "accountLabel",
    statusKey: "available",
  },
  {
    descriptionKey: "notificationsDescription",
    href: "/settings/notifications",
    icon: Bell,
    labelKey: "notificationsLabel",
    statusKey: "preview",
  },
  {
    descriptionKey: "languageCopy",
    href: null,
    icon: Languages,
    id: "language",
    labelKey: "languageLabel",
    statusKey: "available",
  },
  {
    descriptionKey: "regionDescription",
    href: null,
    icon: Globe2,
    labelKey: "regionLabel",
    statusKey: "comingSoon",
  },
  {
    descriptionKey: "brokerDescription",
    href: null,
    icon: KeyRound,
    labelKey: "brokerLabel",
    statusKey: "comingSoon",
  },
  {
    descriptionKey: "dataDescription",
    href: null,
    icon: ShieldCheck,
    labelKey: "dataLabel",
    statusKey: "comingSoon",
  },
];

export default function MyIxaiSettingsPage() {
  return (
    <main className="min-h-screen bg-[var(--ixai-cream)] text-[var(--ixai-forest)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
                <TranslatedText k="heroEyebrow" namespace="settings" />
              </p>
              <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">
                <TranslatedText k="heroTitle" namespace="settings" />
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
                <TranslatedText k="heroBody" namespace="settings" />
              </p>
            </div>
            <FeatureIcon icon={Settings} shadow={false} tone="cream" />
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {settingsAreas.map((area) => {
            const Icon = area.icon;
            const content = (
              <article className="flex min-h-56 flex-col justify-between rounded-2xl border border-[rgba(9,41,31,0.14)] bg-white/82 p-5 shadow-[0_18px_48px_rgba(9,41,31,0.06)]">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <FeatureIcon icon={Icon} size="sm" shadow={false} />
                    <span className="rounded-full border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.82)] px-2.5 py-1 font-mono text-[10px] font-semibold text-[var(--ixai-forest-soft)]">
                      <TranslatedText k={area.statusKey} namespace="settings" />
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-[var(--ixai-forest)]">
                    <TranslatedText k={area.labelKey} namespace="settings" />
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                    <TranslatedText k={area.descriptionKey} namespace="settings" />
                  </p>
                  {area.id === "language" ? (
                    <div className="mt-4">
                      <LanguageSwitcher mode="full" />
                      <p className="mt-3 text-xs leading-5 text-[var(--ixai-forest-soft)]">
                        <TranslatedText k="sharedLocaleNote" namespace="settings" />
                      </p>
                    </div>
                  ) : null}
                </div>
                {area.id === "language" ? null : area.href ? (
                  <span className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/70 px-3 py-2 text-sm font-semibold text-[var(--ixai-forest)]">
                    <TranslatedText k="open" namespace="settings" />
                    <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.72)] px-3 py-2 text-sm font-semibold text-[var(--ixai-forest-soft)]">
                    <TranslatedText k="comingSoon" namespace="settings" />
                  </span>
                )}
              </article>
            );

            return area.href ? (
              <Link href={area.href} key={area.labelKey}>
                {content}
              </Link>
            ) : (
              <div key={area.labelKey}>{content}</div>
            );
          })}
        </section>

        <I18nFoundationStatusCard />

        <LocalizationPreferenceCard />

        <SettingsRuntimeDiagnosticsControl />

        <p className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-xs leading-6 text-[var(--ixai-forest-soft)]">
          <TranslatedText k="footerNote" namespace="settings" />
        </p>
      </section>
    </main>
  );
}
