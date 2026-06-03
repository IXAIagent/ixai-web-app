import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

// v1.32.2 — Public → Pro conversion guardrail. Restrained tone; explains
// the public/pro split without hard-selling. No performance claims.

const PUBLIC_ITEMS = [
  "市場狀態敘事（每日 / 每週）",
  "跨市場情報流",
  "FCN 教育型市場觀察",
  "每日晨報 / 每週情報閱讀",
  "關注清單與基礎個人化偏好",
];

const PRO_ITEMS = [
  "個人化投資組合分析",
  "FCN basket 風險監控",
  "Worst-of / KI distance 個人化追蹤",
  "個人化每週情報",
  "AI 風險提醒與跨資產監控",
];

export function ProGuardrail() {
  return (
    <section className="rounded-2xl border border-[rgba(176,141,87,0.30)] bg-[rgba(255,250,240,0.86)] p-4 shadow-[0_14px_38px_rgba(9,41,31,0.045)] sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(176,141,87,0.34)] bg-[rgba(176,141,87,0.13)] text-[var(--ixai-gold)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          公開市場情報 × IXAI Pro
        </p>
      </div>
      <h2 className="mt-3 text-lg font-semibold leading-7 text-[var(--ixai-forest)] sm:text-xl">
        高層市場情報公開閱讀；個人化保留在 IXAI Pro。
      </h2>
      <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
        IXAI App 用來建立每日市場閱讀習慣；當需要把市場敘事對齊個人持倉與 FCN 風控時，未來可進入 IXAI Pro。
      </p>

      <div className="mt-5 grid gap-3 sm:gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-[var(--ixai-border)] bg-white/55 p-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            公開市場情報提供
          </div>
          <ul className="mt-3 grid gap-1.5 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {PUBLIC_ITEMS.map((item) => (
              <li className="flex items-start gap-2" key={item}>
                <span aria-hidden="true" className="mt-2.5 inline-block h-1 w-1 rounded-full bg-[var(--ixai-gold)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-[var(--ixai-border)] bg-white/55 p-4">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            IXAI Pro 未來提供
          </div>
          <ul className="mt-3 grid gap-1.5 text-sm leading-7 text-[var(--ixai-forest-soft)]">
            {PRO_ITEMS.map((item) => (
              <li className="flex items-start gap-2" key={item}>
                <span aria-hidden="true" className="mt-2.5 inline-block h-1 w-1 rounded-full bg-[var(--ixai-gold)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <Link
          className="ixai-cta-forest inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--ixai-forest)] px-4 py-2.5 text-sm font-semibold"
          href="/pro"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          了解 IXAI Pro
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--ixai-border)] bg-white/55 px-4 py-2.5 text-sm font-medium text-[var(--ixai-forest)]"
          href="/account"
        >
          建立 IXAI 帳號
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <p className="mt-4 text-xs leading-6 text-[var(--ixai-ink-muted)]">
        IXAI 公開市場情報不提供個別投資建議、買賣指令或績效保證；個人化分析保留至付費 Pro 開放。
      </p>
    </section>
  );
}
