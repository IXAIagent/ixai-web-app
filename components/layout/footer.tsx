"use client";

import { IxaiLogoFrame } from "@/components/brand/ixai-logo";
import { getPrimaryContactLinks } from "@/src/lib/brand/contact";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";
import { useTranslation } from "@/src/lib/i18n";

export function Footer() {
  const contactLinks = getPrimaryContactLinks();
  const { t } = useTranslation("common");
  const footerLinks = [
    contactLinks.line,
    contactLinks.email,
    contactLinks.instagram,
    contactLinks.facebook,
  ].filter((link): link is NonNullable<typeof link> => Boolean(link?.value));

  return (
    <footer className="border-t border-[rgba(176,141,87,0.22)] bg-[#071f17] text-[var(--ixai-cream)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 text-xs leading-6 text-[rgba(245,240,230,0.48)] sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <IxaiLogoFrame className="h-9 w-[4.5rem]" logoSize="xs" tone="dark" />
          <p>{t("footerDisclaimer")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            className="text-[rgba(245,240,230,0.64)] transition hover:text-[var(--ixai-cream)]"
            href={ixaiEcosystem.proPreviewUrl}
          >
            {t("learnPro", ixaiEcosystem.cta.learnPro)}
          </a>
          {footerLinks.map((link) => (
            <a
              className="text-[rgba(245,240,230,0.56)] transition hover:text-[var(--ixai-cream)]"
              href={link.value}
              key={link.value}
              rel={link.isExternal ? "noreferrer" : undefined}
              target={link.isExternal ? "_blank" : undefined}
            >
              {link.ctaLabel}
            </a>
          ))}
          <p>© I-Xuan Investment Co. Ltd.</p>
        </div>
      </div>
    </footer>
  );
}
