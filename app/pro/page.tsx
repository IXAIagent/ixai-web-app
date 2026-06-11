import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  Globe2,
  Layers3,
  Newspaper,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { FeatureIcon } from "@/components/ui/feature-icon";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "IXAI Platform — AI 投資風控平台",
  description:
    "IXAI 是幫助投資人整理資產、監控風險、理解市場的 AI 投資工作平台。",
  canonical: "/pro",
});

const whyCards = [
  {
    copy: "每天都有新聞、財報、利率、幣圈與地緣政治消息，但不是每一則都跟你的部位有關。",
    icon: Newspaper,
    title: "資訊太多",
  },
  {
    copy: "股票、ETF、FCN、加密貨幣與不同券商帳戶分散在不同地方，投資人很難看見整體風險。",
    icon: Layers3,
    title: "商品太分散",
  },
  {
    copy: "多數工具幫你看價格，但不一定幫你整理集中度、相關性、情境壓力與 FCN Worst-of 風險。",
    icon: ShieldAlert,
    title: "風險沒有被整理",
  },
];

const comparisonRows = [
  ["看盤與報價", "即時價格與交易入口通常較完整", "規劃接入市場資料，但核心不是看盤或下單"],
  ["新聞資訊", "提供大量新聞與推播", "把新聞對應到持倉、FCN underlyings 與風險流程"],
  ["投資組合", "多半停留在資產列表或報酬顯示", "整理 Portfolio、估值、配置、曝險與資料來源"],
  ["FCN 監控", "通常不是核心能力", "規劃 Worst-of、KI / KO、觀察日與 coupon workflow"],
  ["風險中心", "多數工具不會整理情境壓力與相關性", "集中 concentration、correlation、scenario 與 stress test"],
  ["AI 晨報", "偏通用新聞摘要", "規劃根據 Portfolio、News、Risk 與 Intelligence 產生個人化晨報"],
  ["跨資產分析", "常依商品線分散", "以多資產工作流整理 FCN、股票、Crypto、Cash 與未來商品"],
  ["多券商整合", "視單一券商而定", "規劃 Binance、Futu、國泰、IBKR 等方向，尚未正式接入"],
];

const productCenters = [
  {
    copy: "管理資產、部位、估值、配置與曝險。",
    icon: BriefcaseBusiness,
    title: "Portfolio Center",
  },
  {
    copy: "追蹤集中度、相關性、情境分析與壓力測試。",
    icon: ShieldAlert,
    title: "Risk Center",
  },
  {
    copy: "管理 FCN 標的、Worst-of、KI / KO、觀察日與配息節奏。",
    icon: ShieldCheck,
    title: "FCN Center",
  },
  {
    copy: "整合市場新聞、AI Commentary、Daily / Weekly Intelligence 與未來 AI Morning Brief。",
    icon: Sparkles,
    title: "Intelligence Center",
  },
];

const roadmapCards = [
  {
    copy: "Portfolio / Risk / FCN / Intelligence Foundation 已完成基礎架構。",
    title: "Phase 1",
  },
  {
    copy: "正在把功能整理成更適合投資人日常使用的工作台。",
    title: "Phase 2",
  },
  {
    copy: "規劃導入即時市場資料、通知系統與個人化晨報。",
    title: "Phase 3",
  },
  {
    copy: "未來規劃支援 Binance、Futu、國泰、IBKR 等整合方向。",
    title: "Phase 4",
  },
  {
    copy: "支援美股、台股、港股、A股、日股、韓股、歐股、新加坡與加密資產。",
    title: "Phase 5",
  },
];

const pricingCards = [
  {
    copy: "適合開始整理資產與體驗基礎 Portfolio / FCN / Risk 功能的使用者。",
    title: "IXAI Free",
  },
  {
    copy: "未來可能包含更多監控額度、提醒通知、AI 晨報與進階市場情報。",
    title: "IXAI Plus",
  },
  {
    copy: "未來可能包含多帳戶管理、進階風控、Broker Sync、FCN 進階分析與個人化 Intelligence。",
    title: "IXAI Professional",
  },
  {
    copy: "未來可能服務家族辦公室、顧問團隊與法人客戶，支援多人管理與客戶報告。",
    title: "Enterprise / Advisor",
  },
];

export default function ProPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="grid gap-6 p-4 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
              IXAI Platform
            </p>
            <h1 className="mt-3 max-w-4xl font-serif text-3xl font-semibold leading-tight sm:text-5xl sm:leading-snug">
              IXAI：AI 投資風控平台
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/74 sm:text-base sm:leading-8">
              幫助投資人管理資產、監控風險、理解市場，把市場資訊轉換成可持續執行的投資工作流程。
            </p>
            <div className="mt-5 grid gap-2 text-sm leading-7 text-white/70">
              <p>不是明牌群。</p>
              <p>不是自動交易。</p>
              <p>不是單純看盤工具。</p>
              <p>
                IXAI 的目標，是讓投資人每天都能更清楚地知道：我持有什麼、風險在哪裡、市場正在改變什麼。
              </p>
            </div>
            <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
                href="/register"
              >
                免費開始使用
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-[var(--ixai-cream)] transition hover:bg-white/[0.12]"
                href="/my-ixai/home"
              >
                進入 IXAI Workspace
                <Compass className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-white/[0.055] p-4 sm:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
              Platform Principle
            </p>
            <div className="mt-4 grid gap-3">
              {[
                "整理資產，而不是製造更多雜訊。",
                "監控風險，而不是取代投資人判斷。",
                "連接市場與部位，而不是只推送新聞。",
              ].map((item) => (
                <p className="flex items-start gap-2 text-sm leading-7 text-white/72" key={item}>
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--ixai-gold)]" aria-hidden="true" />
                  {item}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.88)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          Why IXAI
        </p>
        <h2 className="mt-2 max-w-3xl text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          投資人缺的不是資訊，而是風險流程。
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {whyCards.map((card) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4" key={card.title}>
              <FeatureIcon icon={card.icon} />
              <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {card.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          Different By Design
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          IXAI 和一般投資 App 的差異
        </h2>
        <div className="mt-5 grid gap-3">
          {comparisonRows.map(([topic, normal, ixai]) => (
            <article
              className="grid gap-3 rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 lg:grid-cols-[0.75fr_1fr_1fr]"
              key={topic}
            >
              <h3 className="text-sm font-semibold text-[var(--ixai-forest)]">{topic}</h3>
              <p className="text-sm leading-7 text-[var(--ixai-forest-soft)]">
                <span className="font-semibold text-[var(--ixai-forest)]">一般投資 App：</span>
                {normal}
              </p>
              <p className="text-sm leading-7 text-[var(--ixai-forest-soft)]">
                <span className="font-semibold text-[var(--ixai-forest)]">IXAI：</span>
                {ixai}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.88)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          Product Centers
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          IXAI Workspace 由四個核心中心組成。
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {productCenters.map((center) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4" key={center.title}>
              <FeatureIcon icon={center.icon} />
              <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                {center.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {center.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
          Roadmap
        </p>
        <h2 className="mt-2 max-w-4xl text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
          IXAI 的長期方向：Multi-Asset + Multi-Broker + Multi-Market AI Risk Platform
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {roadmapCards.map((card) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4" key={card.title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                {card.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {card.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.88)] p-4 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
              Future Pricing
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
              未來分層收費方向
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ixai-forest-soft)]">
            目前 IXAI 仍在產品建構與測試階段，正式價格與方案內容將以未來公告為準。
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {pricingCards.map((card) => (
            <article className="rounded-lg border border-[var(--ixai-border)] bg-white/60 p-4" key={card.title}>
              <FeatureIcon icon={card.title.includes("Free") ? CircleDollarSign : Building2} />
              <h3 className="mt-3 text-base font-semibold leading-6 text-[var(--ixai-forest)]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
                {card.copy}
              </p>
              <p className="mt-3 rounded-md border border-[rgba(176,141,87,0.28)] bg-[rgba(176,141,87,0.08)] px-3 py-2 text-xs font-semibold text-[var(--ixai-forest)]">
                規劃中 · 以正式公告為準
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1fr_0.8fr]">
        <article className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
            Advisory Philosophy
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)] sm:text-2xl">
            從 FCN 顧問與市場實務出發。
          </h2>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            <p>
              IXAI 來自一玄投資顧問對市場監控、FCN 管理與投資人風險溝通的實務經驗。
            </p>
            <p>
              我們相信，投資人真正需要的不是更多雜訊，而是一套能把市場資訊、資產配置、FCN 條件與風險變化整理成日常流程的系統。
            </p>
            <p>
              IXAI 的目標，是把 AI Morning Brief、Portfolio Monitoring、FCN Risk、Global Market Intelligence 整合成一個可持續使用的投資工作平台。
            </p>
          </div>
        </article>

        <article className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-6">
          <FeatureIcon icon={BellRing} tone="cream" />
          <h2 className="mt-4 text-xl font-semibold leading-7">
            清楚地使用 IXAI
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/70">
            IXAI 不提供自動下單、不保證收益，也不取代投資人自身判斷。平台內容用於市場資訊整理、風險監控與投資流程輔助，不構成個別投資建議。
          </p>
          <div className="mt-5 grid gap-2">
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
              href="/register"
            >
              免費開始使用
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-[var(--ixai-cream)]"
              href="/my-ixai/home"
            >
              進入 IXAI Workspace
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <FeatureIcon icon={Globe2} shadow={false} />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ixai-gold)]">
              Global Direction
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-7 text-[var(--ixai-forest)]">
              IXAI 是 Global Multi-Asset, Multi-Broker, Multi-Market AI Risk Platform。
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              長期設計需支援美國、台灣、香港、中國、日本、韓國、歐洲、新加坡、Crypto 與 FCN structured products。所有引擎都應保持 market-agnostic，不假設單一市場或單一語言。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
