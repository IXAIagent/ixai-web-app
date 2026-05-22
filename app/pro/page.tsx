import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarCheck,
  FileText,
  Mail,
} from "lucide-react";
import { EcosystemBridge } from "@/components/layout/ecosystem-bridge";
import { getPrimaryContactLinks } from "@/src/lib/brand/contact";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { ecosystemLayers, ixaiEcosystem } from "@/src/lib/ixai/ecosystem";

const proCapabilities = [
  {
    title: "Portfolio Intelligence",
    copy: "把持倉、風格、集中度與市場 regime 轉換成可閱讀的風險狀態。",
  },
  {
    title: "FCN Monitoring",
    copy: "追蹤 worst-of、KI / KO distance、觀察日與 coupon schedule。",
  },
  {
    title: "Crypto Risk",
    copy: "把 BTC / ETH 與流動性、美元、利率壓力放進同一個風險語境。",
  },
  {
    title: "Regime Detection",
    copy: "觀察 risk-on / risk-off、利率壓力、AI beta 與市場廣度變化。",
  },
  {
    title: "AI Risk Alerts",
    copy: "用 AI-assisted interpretation 提醒重要風險變化，而不是生成買賣指令。",
  },
  {
    title: "Cross Asset Exposure",
    copy: "把股票、ETF、Crypto、FCN 與總經變數放在同一張 intelligence map。",
  },
];

const architectureSteps = [
  "Daily Brief",
  "Watchlist",
  "Risk Intelligence",
  "IXAI Pro OS",
];

const previewCards = [
  ["Portfolio State", "AI beta concentration", "Medium watch"],
  ["FCN Engine", "Worst-of / KI distance", "Risk-first monitor"],
  ["Market Regime", "Rates + dollar pressure", "Neutral to watch"],
  ["Personal Brief", "Watchlist-aware context", "Review required"],
];

export const metadata = buildPublicMetadata({
  title: "IXAI Pro — AI Wealth Operating System",
  description:
    "IXAI Pro 是跨資產 AI 風控與 intelligence workspace，延伸自 IXAI 公開市場情報入口。",
});

export default function ProPage() {
  const contactLinks = getPrimaryContactLinks();
  const lineUrl = contactLinks.line?.value ?? ixaiEcosystem.contactUrl;
  const emailUrl = contactLinks.email?.value ?? ixaiEcosystem.contactUrl;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:gap-7 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="grid gap-5 p-4 sm:gap-8 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--ixai-gold)]">
              IXAI Pro Preview
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:mt-4 sm:text-5xl">
              IXAI Pro
              <span className="mt-1.5 block text-xl font-medium text-white/74 sm:mt-2 sm:text-3xl">
                AI Wealth Operating System
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72 sm:mt-6 sm:text-base sm:leading-8">
              跨資產 AI 風控與 intelligence workspace。IXAI Pro 不是交易入口，
              而是協助使用者建立 portfolio、FCN、Crypto 與總經風險 awareness 的工作層。
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-3 py-2.5 text-sm font-semibold text-[var(--ixai-forest)] sm:px-4"
                href={ixaiEcosystem.proDashboardUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                {ixaiEcosystem.cta.enterPro}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-sm font-medium text-white/76 transition hover:bg-white/8 hover:text-white sm:px-4"
                href={emailUrl}
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {ixaiEcosystem.cta.contactIxuan}
              </a>
              <Link
                className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-sm font-medium text-white/76 transition hover:bg-white/8 hover:text-white sm:col-span-1 sm:px-4"
                href={ixaiEcosystem.dailyBriefUrl}
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                {ixaiEcosystem.cta.viewDailyBrief}
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3.5 sm:p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
              Public ↔ Pro Bridge
            </p>
            <div className="mt-4 grid gap-3">
              {ecosystemLayers.map((layer) => (
                <div className="rounded-lg border border-white/10 bg-black/10 p-4" key={layer.title}>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-white/42">
                    {layer.label}
                  </p>
                  <h2 className="mt-2 text-base font-semibold text-white/88">
                    {layer.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/58">{layer.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <EcosystemBridge />

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-4 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          What IXAI Pro Does
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
          從公開市場情報，延伸到個人化風險工作流。
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {proCapabilities.map((item) => (
            <article
              className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4"
              key={item.title}
            >
              <h3 className="text-base font-semibold text-[var(--ixai-forest)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-5 sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
            Why IXAI Exists
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[var(--ixai-forest)]">
            AI 不取代投資判斷，AI 協助建立 intelligence 與 risk awareness。
          </h2>
        </div>
        <div className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-5 sm:p-6">
          <div className="grid gap-4 text-sm leading-8 text-[var(--ixai-ink-muted)]">
            <p>
              市場資訊過載、波動加速、產品結構變複雜之後，使用者需要的不是更多訊號噪音，
              而是一個能把資訊、資產與風險放回同一脈絡的工作層。
            </p>
            <p>
              IXAI Pro 的方向是 AI-assisted interpretation：整理、監控、提示與解釋風險，
              但不提供買賣指令、不承諾報酬，也不把市場簡化成單一答案。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Product Architecture
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
          Public layer 建立習慣，Pro layer 建立個人化工作流。
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {architectureSteps.map((step, index) => (
            <div
              className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4"
              key={step}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                Layer {index + 1}
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--ixai-forest)]">{step}</p>
              {index < architectureSteps.length - 1 ? (
                <div className="mt-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--ixai-ink-muted)]">
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  next layer
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[rgba(176,141,87,0.32)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          IXAI Pro Workspace Preview
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          Pro dashboard 會是工作空間，不是公開內容頁。
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {previewCards.map(([title, signal, status]) => (
            <article
              className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-4"
              key={title}
            >
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[rgba(7,31,23,0.8)] to-transparent backdrop-blur-[1px]" />
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ixai-gold)]">
                {title}
              </p>
              <p className="mt-6 text-lg font-semibold text-white/86">{signal}</p>
              <p className="mt-3 text-sm leading-6 text-white/54">{status}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.86)] p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Contact / CTA
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--ixai-forest)]">
              想把市場情報延伸成你的 AI Wealth OS？
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ixai-ink-muted)]">
              透過 LINE 或 Email 了解 IXAI Pro、FCN 風險監控與 AI-assisted risk awareness。
              一玄不提供報牌或報酬承諾，所有溝通以風險理解與資訊整理為核心。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)]"
              href={lineUrl}
              rel="noreferrer"
              target="_blank"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              預約一玄顧問
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
              href={ixaiEcosystem.proDashboardUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              申請 IXAI Pro
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--ixai-border)] px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
              href={emailUrl}
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              聯絡一玄
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
