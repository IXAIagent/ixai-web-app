import Link from "next/link";
import { ArrowDown, ArrowUpRight, FileText, Mail } from "lucide-react";
import { ProInterestCard } from "@/components/pro/pro-interest-card";
import { getPrimaryContactLinks } from "@/src/lib/brand/contact";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";

const publicLayerItems = [
  "市場情報與宏觀資產觀察",
  "台股 / 美股 / Crypto 訊號整理",
  "FCN 教育與風險觀念",
  "Daily Brief 與 Weekly Brief",
  "基礎 Watchlist 與帳號偏好",
];

const proUnlockItems = [
  {
    title: "個人化 Portfolio Intelligence",
    copy: "把持倉、集中度、風格與市場 regime 放入個人風險語境。",
  },
  {
    title: "FCN Risk Workspace",
    copy: "追蹤 worst-of、KI / KO distance、觀察日與 coupon schedule。",
  },
  {
    title: "多資產風險儀表板",
    copy: "整合股票、ETF、Crypto、FCN 與總經變數的跨資產 monitoring。",
  },
  {
    title: "專屬 Watchlist Intelligence",
    copy: "讓自選觀察不只是價格清單，而是個人化市場情報入口。",
  },
  {
    title: "即時風險提醒",
    copy: "針對重大 regime、價格與 FCN threshold 變化建立提醒工作流。",
  },
  {
    title: "更深入的 AI interpretation",
    copy: "將公開市場訊號轉換為可審閱、可追蹤的個人風險解讀。",
  },
];

const architectureSteps = [
  "Public Market Intelligence",
  "Watchlist & Account Memory",
  "Personal Risk Awareness",
  "IXAI Pro Workspace",
];

export const metadata = buildPublicMetadata({
  title: "IXAI Pro — AI Risk Intelligence Workspace",
  description:
    "IXAI Pro 是為進階投資者打造的 AI Risk Intelligence Workspace，未來延伸個人化風險管理、FCN 監控與多資產決策輔助。",
});

export default function ProPage() {
  const contactLinks = getPrimaryContactLinks();
  const emailUrl = contactLinks.email?.value ?? ixaiEcosystem.contactUrl;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-7 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="grid gap-5 p-4 sm:gap-8 sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-10">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--ixai-gold)]">
              IXAI Pro Preview
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:mt-4 sm:text-5xl">
              IXAI Pro：為進階投資者打造的 AI Risk Intelligence Workspace
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72 sm:mt-6 sm:text-base sm:leading-8">
              從市場資訊走向個人化風險管理、FCN 監控與多資產決策輔助。
              IXAI Pro 是未來付費層，完整風控引擎不會在 Public App 中釋放。
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
              <Link
                className="ixai-cta-cream inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ixai-cream)] px-3 py-2.5 text-sm font-semibold sm:px-4"
                href="/register"
              >
                建立 IXAI Account
              </Link>
              <a
                className="ixai-cta-outline-dark inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-sm font-medium transition hover:bg-white/8 hover:text-white sm:px-4"
                href={emailUrl}
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                聯絡一玄
              </a>
              <Link
                className="ixai-cta-outline-dark col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-sm font-medium transition hover:bg-white/8 hover:text-white sm:col-span-1 sm:px-4"
                href="/daily-brief"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                查看 Daily Brief
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3.5 sm:p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              Free → Personal → Pro
            </p>
            <div className="mt-4 grid gap-3">
              {architectureSteps.map((step, index) => (
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4" key={step}>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/42">
                    Layer {index + 1}
                  </p>
                  <h2 className="mt-2 text-base font-semibold text-white/88">{step}</h2>
                  {index < architectureSteps.length - 1 ? (
                    <div className="mt-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-white/42">
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      next
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            What Public App Gives You
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
            免費層建立市場閱讀習慣。
          </h2>
          <div className="mt-5 grid gap-3">
            {publicLayerItems.map((item) => (
              <p
                className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4 text-sm leading-7 text-[var(--ixai-forest-soft)]"
                key={item}
              >
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            What IXAI Pro Will Unlock
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
            Pro 層把 intelligence 轉成個人化風險工作流。
          </h2>
          <div className="mt-5 grid gap-3">
            {proUnlockItems.map((item) => (
              <article className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4" key={item.title}>
                <h3 className="text-base font-semibold text-[var(--ixai-forest)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--ixai-ink-muted)]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-5 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Product Positioning
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[var(--ixai-forest)]">
            IXAI Pro 尚未正式開放，現在先建立優先通知名單。
          </h2>
        </div>
        <div className="grid gap-4">
          <ProInterestCard />
          <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-4 text-sm leading-7 text-[var(--ixai-ink-muted)] sm:p-5">
            IXAI Pro 會聚焦個人化風險管理、FCN 監控與多資產 intelligence。
            內容與功能不構成個別投資建議、買賣指令或保證獲利。
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Contact
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              想了解 IXAI Pro 如何延伸你的市場工作流？
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/64">
              你可以先建立 IXAI Account 並登記 Pro interest。若需要更直接的說明，也可以聯絡一玄。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="ixai-cta-cream inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
              href="/account"
            >
              前往我的 IXAI
            </Link>
            <a
              className="ixai-cta-outline-dark inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium transition hover:bg-white/8 hover:text-white"
              href={emailUrl}
            >
              聯絡一玄
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
