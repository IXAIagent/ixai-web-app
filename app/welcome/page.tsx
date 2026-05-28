import Link from "next/link";
import { ArrowRight, LineChart, ListChecks, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";

const WELCOME_CARDS = [
  [LineChart, "市場偏好", "美股、台股、Crypto、FCN 與 ETF 的情報優先權。"],
  [ListChecks, "Watchlist Memory", "先用本機狀態建立觀察名單，未來可接 Pro memory。"],
  [MessageCircle, "LINE Intelligence", "連接 LINE 接收情報，為未來 opt-in delivery 做準備。"],
  [ShieldCheck, "Risk-first", "IXAI 提供市場資訊與風險觀察，不提供保證報酬或買賣指令。"],
] as const;

export const metadata = buildPublicMetadata({
  title: "Welcome to IXAI",
  description:
    "建立你的 IXAI intelligence layer，從市場偏好、自選觀察與 LINE intelligence entry 開始。",
});

export default function WelcomePage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 py-3 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <div className="grid gap-5 p-4 sm:p-8 lg:grid-cols-[1fr_0.92fr] lg:p-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--ixai-gold)]">
              IXAI Intelligence Activation
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-5xl">
              開始建立你的每日市場情報關係。
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
              IXAI 會先理解你關注的市場、投資風格、風險偏好與 Watchlist。
              這是未來 Daily Intelligence、LINE entry 與 Portfolio Intelligence 的基礎。
            </p>
            <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
              <Link
                className="ixai-cta-cream inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold"
                href="/onboarding"
              >
                開始 Onboarding
                <ArrowRight className="h-4 w-4 stroke-current text-[var(--ixai-forest)]" aria-hidden="true" />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-[var(--ixai-cream)] transition hover:bg-white/8"
                href="/pro-preview"
              >
                查看 Intelligence Preview
                <Sparkles className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="grid gap-3">
            {WELCOME_CARDS.map(([Icon, title, copy]) => (
              <article className="rounded-lg border border-white/10 bg-white/[0.045] p-4" key={String(title)}>
                <Icon className="h-4 w-4 stroke-current text-[var(--ixai-gold)]" aria-hidden="true" />
                <h2 className="mt-3 text-base font-semibold text-[var(--ixai-cream)]">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-white/62">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.86)] p-4 sm:p-6 lg:grid-cols-3">
        {[
          ["1", "回答偏好", "選擇市場、投資節奏與情報主題。"],
          ["2", "建立觀察", "加入股票、幣種或 ETF 作為日後 personal intelligence seed。"],
          ["3", "連接未來", "保留 LINE 與 Pro Intelligence 的低風險入口。"],
        ].map(([step, title, copy]) => (
          <article className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4" key={step}>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              Step {step}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--ixai-forest)]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--ixai-ink-muted)]">{copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
