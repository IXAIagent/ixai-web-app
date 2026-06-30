"use client";

import type { I18NNamespace } from "@/src/lib/i18n";
import { useTranslation } from "@/src/lib/i18n";

export function TranslatedText({
  fallback,
  k,
  namespace,
}: {
  fallback?: string;
  k: string;
  namespace: I18NNamespace;
}) {
  const { t } = useTranslation(namespace);

  return <>{t(k, fallback)}</>;
}
