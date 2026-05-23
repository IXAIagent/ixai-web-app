import Link from "next/link";
import {
  ArrowLeft,
  Bug,
  Lightbulb,
  Mail,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { FeedbackLink } from "@/components/feedback/feedback-link";
import { ProInterestCard } from "@/components/pro/pro-interest-card";
import { getPrimaryContactLinks } from "@/src/lib/brand/contact";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "提供回饋 — IXAI Public Beta",
  description:
    "IXAI Public Beta 持續優化中。歡迎透過 LINE、Email 或 IXAI Pro 等候清單留下使用回饋、Bug 回報與功能建議。",
});

type FeedbackChannel = {
  channelKey: string;
  icon: typeof Mail;
  eyebrow: string;
  title: string;
  copy: string;
  ctaLabel: string;
  href: string;
  external: boolean;
};

export default function FeedbackPage() {
  const contactLinks = getPrimaryContactLinks();
  const lineUrl = contactLinks.line?.value ?? "/about#contact";
  const emailUrl = contactLinks.email?.value ?? "/about#contact";

  const channels: FeedbackChannel[] = [
    {
      channelKey: "line",
      icon: MessageCircle,
      eyebrow: "LINE",
      title: "與一玄團隊直接對話",
      copy: "適合使用回饋、產品問題、FCN 與 IXAI Pro 諮詢；回覆速度通常最快。",
      ctaLabel: "加入 LINE",
      href: lineUrl,
      external: true,
    },
    {
      channelKey: "bug_email",
      icon: Bug,
      eyebrow: "Bug 回報",
      title: "回報你遇到的問題",
      copy: "請描述瀏覽器、裝置與步驟，我們會回到對應 surface 進行修正。",
      ctaLabel: "寄信回報問題",
      href: `${emailUrl}?subject=${encodeURIComponent("IXAI Bug Report")}`,
      external: false,
    },
    {
      channelKey: "feature_email",
      icon: Lightbulb,
      eyebrow: "功能建議",
      title: "提出你想看到的功能",
      copy: "Daily Brief 主題、Watchlist 行為、FCN 教育、Pro 預覽 — 任何想法都歡迎。",
      ctaLabel: "寄信提建議",
      href: `${emailUrl}?subject=${encodeURIComponent("IXAI Feature Request")}`,
      external: false,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-2xl border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.16)] sm:p-7">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-[rgba(176,141,87,0.18)] text-[var(--ixai-gold)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
            Feedback · Public Beta
          </p>
        </div>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-9 sm:text-4xl sm:leading-snug">
          IXAI Public Beta 持續優化中，歡迎提供回饋。
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72 sm:text-base sm:leading-8">
          你提供的使用回饋、Bug 回報與功能建議，會直接交給一玄與 IXAI 團隊。
          所有對話都是非公開的，IXAI 不會用回饋內容做任何投資建議或行銷推送。
        </p>
      </section>

      <section className="grid gap-3 sm:gap-4">
        {channels.map((channel) => {
          const Icon = channel.icon;

          return (
            <article
              className="rounded-2xl border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-5"
              key={channel.channelKey}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
                      {channel.eyebrow}
                    </p>
                    <h2 className="mt-1.5 text-base font-semibold leading-6 text-[var(--ixai-forest)] sm:text-lg">
                      {channel.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                      {channel.copy}
                    </p>
                  </div>
                </div>
                <FeedbackLink
                  channel={channel.channelKey}
                  className="ixai-cta-forest inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
                  external={channel.external}
                  href={channel.href}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {channel.ctaLabel}
                </FeedbackLink>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          IXAI Pro Waitlist
        </p>
        <h2 className="mt-2 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
          想優先取得 IXAI Pro 通知？
        </h2>
        <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
          IXAI Pro 尚未開放。完成登記後，一玄團隊會於開放測試時優先通知 — 不會用於行銷推送。
        </p>
        <div className="mt-4">
          <ProInterestCard />
        </div>
      </section>

      <Link
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/45 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
        href="/account"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        返回我的 IXAI
      </Link>
    </div>
  );
}
