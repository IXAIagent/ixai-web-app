import Link from "next/link";
import {
  ArrowUpRight,
  Camera,
  Compass,
  Globe2,
  Mail,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Telescope,
  Users,
} from "lucide-react";
import { IxaiLogoFrame } from "@/components/brand/ixai-logo";
import { getBrandContactChannels } from "@/src/lib/brand/contact";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

const philosophyCards = [
  {
    icon: ShieldCheck,
    title: "風險控管先於追求報酬",
    copy: "一玄相信，投資判斷的第一步不是追求更高報酬，而是先理解自己承擔了什麼風險。沒有先看見風險的決策，難以走得長遠。",
  },
  {
    icon: Globe2,
    title: "全球視角的市場研究",
    copy: "一玄持續研究美股、台股、宏觀資產、利率與 Crypto，因為任何單一市場的訊號都不再孤立存在。",
  },
  {
    icon: Compass,
    title: "看得更遠，決策更穩",
    copy: "市場每天都有雜訊；真正能累積價值的，是長期框架、資產脈絡與可重複使用的判斷節奏。",
  },
  {
    icon: Telescope,
    title: "FCN 與結構型商品專業",
    copy: "一玄專注於 FCN、worst-of、KI / KO 與波動率定價，把高配息背後的下檔風險講清楚，是一玄長期累積的專業。",
  },
];

const ixaiSystemItems = [
  "美股 / 台股 / Crypto / 宏觀資產觀察",
  "Market Intelligence 與風險摘要",
  "Daily Brief 與一玄觀點",
  "FCN Education Hub 與風險意識建立",
  "Watchlist、Account Memory 與個人化提醒",
];

const contactIcons = {
  Email: Mail,
  Facebook: Users,
  Instagram: Camera,
  LINE: MessageCircle,
};

export const metadata = buildPublicMetadata({
  title: "About 一玄 — 一玄投資股份有限公司",
  description:
    "About 一玄：一玄投資股份有限公司以風險控管、全球市場研究與 FCN 專業為核心，延伸出 IXAI AI Wealth Intelligence 系統。相信一玄，發現財富無限可能。",
});

export default function AboutPage() {
  const communityLinks = getBrandContactChannels();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-7 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      {/* Hero — About 一玄, 公司全名、雙 slogan、品牌定位主軸. */}
      <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="grid gap-6 p-4 sm:gap-8 sm:p-8 lg:grid-cols-[0.82fr_1.18fr] lg:p-10">
          <div className="flex items-start gap-3 sm:gap-4">
            <IxaiLogoFrame className="h-16 w-24 sm:h-14 sm:w-20" logoSize="md" priority tone="dark" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--ixai-gold)]">
                About 一玄
              </p>
              <p className="mt-2 text-sm leading-7 text-white/58">
                I-Xuan Investment
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--ixai-gold)]">
              I-Xuan Investment Co., Ltd.
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
              一玄投資股份有限公司
            </h1>
            <p className="mt-4 max-w-2xl font-serif text-base font-medium leading-8 text-[var(--ixai-cream)] sm:text-xl sm:leading-9">
              相信一玄，發現財富無限可能。
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/64 sm:text-base sm:leading-8">
              Trust I-Xuan. Discover Infinite Wealth Possibilities.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:mt-6 sm:text-base sm:leading-8">
              一玄投資以風險控管、全球市場研究與 FCN 專業為核心，延伸出 IXAI ——
              一套每日可用的 AI Wealth Intelligence 系統。
            </p>
            <div className="mt-5 grid grid-cols-1 gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
              <Link
                className="ixai-cta-cream inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
                href="/register"
              >
                建立 IXAI Account
              </Link>
              <Link
                className="ixai-cta-outline-dark inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium transition hover:bg-white/8 hover:text-white"
                href="/pro"
              >
                了解 IXAI Pro
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Founder & 公司定位 — 一玄為什麼存在，IXAI 為什麼是延伸. */}
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Why 一玄
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold leading-8 text-[var(--ixai-forest)] sm:text-3xl sm:leading-tight">
            一玄不是另一個喊單品牌，而是一套對市場負責的研究與風控信念。
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:mt-5 sm:leading-8">
            一玄投資長期專注於 FCN 與結構型商品研究、跨資產風險觀察、全球宏觀市場
            脈絡，並以此累積對客戶與市場的信任。
          </p>
        </div>
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-7">
          <div className="grid gap-3 text-sm leading-7 text-[var(--ixai-ink-muted)] sm:gap-4 sm:leading-8">
            <p>
              從 FCN、美股、台股到 Crypto，許多投資者真正面對的問題不是資訊不足，
              而是資訊過多、風險來源分散，卻缺少一個能每天回來整理的系統。
            </p>
            <p>
              一玄相信，市場最容易讓人受傷的時候，往往不是看錯方向，
              而是沒有看清楚槓桿、集中度、流動性與最差情境。
            </p>
            <p>
              為了把這套風險語言交給更多投資者，一玄打造了 IXAI —— 一個讓「市場閱讀」
              變成每日習慣的 AI Wealth Intelligence 系統。
            </p>
          </div>
        </div>
      </section>

      {/* 一玄投資哲學 — 4 cards with icon. */}
      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)]">
        <div className="border-b border-[var(--ixai-border)] px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Investment Philosophy
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)] sm:text-lg">
            一玄投資的四個核心信念
          </h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {philosophyCards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                className="border-b border-[var(--ixai-border)] p-4 sm:p-6 md:border-r"
                key={item.title}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)] sm:leading-8">
                  {item.copy}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* IXAI 是一玄延伸出的 AI Wealth Intelligence 系統. */}
      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-7">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            IXAI 是一玄延伸出的 AI Wealth Intelligence 系統
          </p>
        </div>
        <h2 className="mt-3 max-w-3xl font-serif text-2xl font-semibold leading-8 text-[var(--ixai-forest)] sm:text-3xl sm:leading-tight">
          為什麼一玄要打造 IXAI Intelligence OS？
        </h2>
        <div className="mt-4 grid gap-3 text-sm leading-7 text-[var(--ixai-forest-soft)] sm:mt-5 sm:gap-4 sm:leading-8">
          <p>
            一玄相信，能讓投資者長期受益的，不是更多「明牌」，而是一套可以每天回來檢視的市場框架。
            IXAI 把一玄的風險語言、全球市場觀察與 FCN 專業，轉譯成可閱讀、可追蹤、可累積的 AI 情報層。
          </p>
          <p>
            IXAI 不是短線喊單工具，也不是把市場簡化成買進或賣出。它是一玄交給投資者的「每日市場
            閱讀工具」，讓使用者知道今天值得關注什麼、風險如何變化、哪些訊號需要持續追蹤。
          </p>
          <p>
            IXAI 是一玄品牌延伸出的 AI Wealth Intelligence 系統 —— 一玄是研究與信念的本體，
            IXAI 是讓這份研究每天觸達投資者的方式。
          </p>
        </div>
        <div className="mt-5 grid gap-3 sm:mt-6 md:grid-cols-2 xl:grid-cols-3">
          {ixaiSystemItems.map((item) => (
            <p
              className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]"
              key={item}
            >
              {item}
            </p>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[var(--ixai-border)] pt-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(176,141,87,0.4)] bg-[rgba(176,141,87,0.13)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            IXAI Public Beta
          </span>
          <span className="text-xs leading-6 text-[var(--ixai-ink-muted)]">
            IXAI Public Beta 持續優化中，歡迎提供回饋。
          </span>
        </div>
        <p className="mt-3 text-xs leading-6 text-[var(--ixai-ink-muted)]">
          IXAI Public App 提供市場資訊、教育內容與風險觀察；不構成個別投資建議，
          也不承諾任何績效或保證獲利。完整 FCN 風控、portfolio intelligence 與個人化提醒，
          將保留在未來的 IXAI Pro 付費層。
        </p>
      </section>

      {/* Community / Contact. */}
      <section
        className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-7"
        id="contact"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
          Community / Contact
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <h2 className="font-serif text-2xl font-semibold leading-8 sm:text-3xl sm:leading-tight">
              相信一玄，發現財富無限可能。
            </h2>
            <p className="mt-2 text-sm leading-7 text-white/58">
              Trust I-Xuan. Discover Infinite Wealth Possibilities.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/64">
              一玄會持續透過 IXAI、Daily Brief 與 community channel 累積市場脈絡與信任。
              所有內容僅供市場資訊、教育與風險觀察參考，不構成個別投資建議或保證獲利。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {communityLinks.map((link) => {
              const ContactIcon = contactIcons[link.label] ?? Mail;

              return (
                <a
                  className="inline-flex min-h-12 items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-medium text-white/76 transition hover:bg-white/10 hover:text-white"
                  href={link.value}
                  key={link.label}
                  rel={link.isExternal ? "noreferrer" : undefined}
                  target={link.isExternal ? "_blank" : undefined}
                >
                  <span className="inline-flex items-center gap-2">
                    <ContactIcon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                    {link.ctaLabel}
                  </span>
                  <ArrowUpRight className="h-4 w-4 opacity-70" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
