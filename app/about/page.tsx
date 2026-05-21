import Image from "next/image";
import { getBrandContactChannels } from "@/src/lib/brand/contact";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { ecosystemLayers } from "@/src/lib/ixai/ecosystem";

const beliefs = [
  {
    title: "Risk matters more than prediction",
    copy: "市場不需要更多確定口吻。真正重要的是理解風險來源、資產關聯與最差情境。",
  },
  {
    title: "Information overload is the new market risk",
    copy: "資訊本身不稀缺，稀缺的是脈絡、篩選、節奏與能被重複使用的判斷框架。",
  },
  {
    title: "AI will reshape wealth intelligence",
    copy: "AI 的價值不是取代判斷，而是協助整理資訊、監控變化，讓決策更有結構。",
  },
  {
    title: "Daily usage creates better decisions",
    copy: "真正有用的金融產品，應該能每天打開，逐步建立投資者自己的市場操作語境。",
  },
];

export const metadata = buildPublicMetadata({
  title: "關於一玄與 IXAI",
  description:
    "認識 IXAI、一玄與 AI Wealth Intelligence 的品牌理念、founder narrative 與 community layer。",
});

export default function AboutPage() {
  const communityLinks = getBrandContactChannels();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045]">
              <Image
                alt="I-Xuan Investment Co. Ltd."
                className="h-auto w-12"
                height={60}
                priority
                src="/logo/ixuan-logo.png"
                width={120}
              />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--ixai-gold)]">
                IXAI
              </p>
              <p className="mt-2 text-sm leading-7 text-white/58">
                I-Xuan Investment Co. Ltd.
              </p>
            </div>
          </div>

          <div>
            <h1 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
              IXAI
              <span className="mt-2 block text-2xl font-medium text-white/74 sm:text-3xl">
                AI Wealth Intelligence
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/72">
              IXAI 不是為了預測市場，而是為了理解風險、資訊與資產配置。它是一套結合市場情報、AI 分析與風險監控的金融 intelligence platform。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.88)] p-6 sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Why IXAI Exists
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <h2 className="font-serif text-3xl font-semibold leading-tight text-[var(--ixai-forest)]">
            市場資訊過載之後，投資者需要的不是更多聲音，而是更清楚的市場觀察系統。
          </h2>
          <div className="grid gap-4 text-sm leading-8 text-[var(--ixai-ink-muted)]">
            <p>
              資訊變多，風險不會因此變少。投資者每天接觸新聞、價格、KOL、財報與政策訊號，卻很少有一個穩定的系統，幫助自己分辨哪些訊號真正影響資產配置。
            </p>
            <p>
              AI 將改變金融資訊處理方式。IXAI 想建立的是每日市場情報入口：每天可打開、可閱讀、可監控，也能逐步回到個人投資脈絡的金融作業系統。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-6 sm:p-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Founder / I-Xuan
          </p>
          <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-[var(--ixai-forest)]">
            建立一個每天都會打開的 AI wealth platform。
          </h2>
        </div>
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-6 sm:p-7">
          <div className="grid gap-4 text-sm leading-8 text-[var(--ixai-ink-muted)]">
            <p>
              一玄長期關注 AI、FCN、Crypto、美股與風險管理，也關注市場結構、資產配置與不同產品之間的風險傳導。
            </p>
            <p>
              IXAI 不提供喊單，也不把投資簡化成單一答案。它希望提供的是 intelligence：讓使用者更清楚自己在看什麼、承擔什麼、以及哪些變化值得被持續監控。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)]">
        <div className="border-b border-[var(--ixai-border)] px-6 py-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            What We Believe
          </p>
          <h2 className="mt-1 text-base font-semibold text-[var(--ixai-forest)]">
            金融 intelligence 的四個基本信念
          </h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2">
          {beliefs.map((belief) => (
            <article
              className="border-b border-[var(--ixai-border)] p-6 md:border-r"
              key={belief.title}
            >
              <h3 className="text-lg font-semibold leading-7 text-[var(--ixai-forest)]">
                {belief.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                {belief.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.84)] p-6 sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          IXAI Ecosystem
        </p>
        <h2 className="mt-2 max-w-3xl font-serif text-3xl font-semibold leading-tight text-[var(--ixai-forest)]">
          ixai-web-app 是公開市場情報入口，IXAI Pro 是 AI Wealth Operating System。
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-8 text-[var(--ixai-ink-muted)]">
          Daily Brief、Weekly Brief、Market Intelligence、FCN Education、AI Risk Monitoring
          與 Portfolio OS 都屬於同一個 IXAI ecosystem：公開層建立閱讀習慣與信任，
          Pro 層把 intelligence 延伸成個人化風險工作流。
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {ecosystemLayers.map((layer) => (
            <article
              className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-5"
              key={layer.title}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                {layer.label}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
                {layer.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
                {layer.copy}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {layer.items.map((item) => (
                  <span
                    className="rounded-md border border-[var(--ixai-border)] bg-[rgba(9,41,31,0.025)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ixai-forest-soft)]"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="rounded-lg border border-[var(--ixai-border)] bg-[var(--ixai-forest)] p-6 text-[var(--ixai-cream)] sm:p-7"
        id="contact"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
          Community / Contact
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <h2 className="font-serif text-3xl font-semibold leading-tight">
              讓市場閱讀成為一種持續的社群語境。
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/64">
              IXAI 的 public content layer 會持續透過 Daily Brief、Weekly
              Brief 與 community channel 累積信任與市場脈絡。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {communityLinks.map((link) => (
              <a
                className="rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-medium text-white/76 transition hover:bg-white/10 hover:text-white"
                href={link.value}
                key={link.label}
                rel={link.isExternal ? "noreferrer" : undefined}
                target={link.isExternal ? "_blank" : undefined}
              >
                {link.ctaLabel}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
