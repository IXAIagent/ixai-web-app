import Link from "next/link";
import { ArrowUpRight, Camera, Mail, MessageCircle, Users } from "lucide-react";
import { IxaiLogoFrame } from "@/components/brand/ixai-logo";
import { getBrandContactChannels } from "@/src/lib/brand/contact";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

const philosophyCards = [
  {
    title: "風險先於報酬",
    copy: "一玄相信，投資判斷的第一步不是追求更高報酬，而是先理解自己承擔了什麼風險。",
  },
  {
    title: "看得更遠，決策更穩",
    copy: "市場每天都有雜訊；真正能累積價值的是長期框架、資產脈絡與可重複使用的判斷節奏。",
  },
  {
    title: "資訊需要被整理",
    copy: "新聞、價格、利率、產業與資金流都會互相影響。IXAI 的角色是把訊號整理成可閱讀的 intelligence。",
  },
  {
    title: "AI 是輔助判讀",
    copy: "AI 可以協助整理與提醒，但不能取代風險承擔者的判斷，也不代表保證獲利。",
  },
];

const publicAppItems = [
  "美股 / 台股 / Crypto / 宏觀資產觀察",
  "Market Intelligence 與風險摘要",
  "Daily Brief 與一玄觀點",
  "FCN 教育與風險意識建立",
  "未來 Push Notification 與個人化提醒",
];

const contactIcons = {
  Email: Mail,
  Facebook: Users,
  Instagram: Camera,
  LINE: MessageCircle,
};

export const metadata = buildPublicMetadata({
  title: "關於一玄與 IXAI",
  description:
    "一玄投資與 IXAI 以 AI、金融專業與風險控管，打造每日可用的財富情報系統。",
});

export default function AboutPage() {
  const communityLinks = getBrandContactChannels();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-7 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="grid gap-6 p-4 sm:gap-8 sm:p-8 lg:grid-cols-[0.82fr_1.18fr] lg:p-10">
          <div className="flex items-start gap-3 sm:gap-4">
            <IxaiLogoFrame className="h-16 w-24 sm:h-14 sm:w-20" logoSize="md" priority tone="dark" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--ixai-gold)]">
                I-Xuan
              </p>
              <p className="mt-2 text-sm leading-7 text-white/58">
                Investment Intelligence
              </p>
            </div>
          </div>

          <div>
            <h1 className="font-serif text-3xl font-semibold leading-tight sm:text-5xl">
              一玄投資 × IXAI Intelligence OS
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72 sm:mt-6 sm:text-base sm:leading-8">
              用 AI 與金融專業，打造每日可用的財富情報系統。IXAI 協助使用者理解市場、
              追蹤風險，並逐步建立自己的市場觀察工作流。
            </p>
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-7">
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

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Founder Story
          </p>
          <h2 className="mt-3 font-serif text-2xl font-semibold leading-8 text-[var(--ixai-forest)] sm:text-3xl sm:leading-tight">
            一玄做 IXAI，是因為市場需要更好的風險語言。
          </h2>
        </div>
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-7">
          <div className="grid gap-3 text-sm leading-7 text-[var(--ixai-ink-muted)] sm:gap-4 sm:leading-8">
            <p>
              從 FCN、美股、台股到 Crypto，許多投資者真正面對的問題不是資訊不足，
              而是資訊過多、風險來源分散，卻缺少一個能每天回來整理的系統。
            </p>
            <p>
              一玄重視風險控管，因為市場最容易讓人受傷的時候，往往不是看錯方向，
              而是沒有看清楚槓桿、集中度、流動性與最差情境。
            </p>
            <p>
              IXAI 不是短線喊單工具，也不是把市場簡化成買進或賣出。它希望建立更清楚的市場判讀：
              讓使用者知道今天值得關注什麼、風險如何變化，以及哪些訊號需要持續追蹤。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)]">
        <div className="border-b border-[var(--ixai-border)] px-4 py-4 sm:px-6 sm:py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Investment Philosophy
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            一玄投資與 IXAI 的四個信念
          </h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {philosophyCards.map((item) => (
            <article
              className="border-b border-[var(--ixai-border)] p-4 sm:p-6 md:border-r"
              key={item.title}
            >
              <h3 className="text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                {item.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          IXAI Public App
        </p>
        <h2 className="mt-2 max-w-3xl font-serif text-2xl font-semibold leading-8 text-[var(--ixai-forest)] sm:text-3xl sm:leading-tight">
          Public App 是每日市場情報入口，協助使用者建立習慣與風險意識。
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-[var(--ixai-ink-muted)] sm:mt-4 sm:leading-8">
          IXAI Public App 不釋放完整 Pro 風控引擎，而是提供公開市場層的閱讀、教育與觀察。
          使用者可以每天打開 IXAI，從價格、新聞、Daily Brief 與一玄觀點中建立自己的市場節奏。
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {publicAppItems.map((item) => (
            <p
              className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]"
              key={item}
            >
              {item}
            </p>
          ))}
        </div>
      </section>

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
              讓市場閱讀成為一種可持續的日常。
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/64">
              一玄會持續透過 IXAI、Daily Brief 與 community channel 累積市場脈絡與信任。
              內容僅供市場資訊、教育內容與風險觀察參考，不構成個別投資建議或保證獲利。
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
