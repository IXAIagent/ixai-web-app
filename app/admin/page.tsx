import Link from "next/link";
import { AudienceSnapshot } from "@/components/admin/audience-snapshot";
import { ConversionFunnel } from "@/components/admin/conversion-funnel";
import { DistributionSnapshot } from "@/components/admin/distribution-snapshot";
import { IdentitySnapshot } from "@/components/admin/identity-snapshot";
import { IntelligenceAnalyticsSnapshot } from "@/components/admin/intelligence-analytics-snapshot";
import { LineIdentitySnapshot } from "@/components/admin/line-identity-snapshot";
import { MembershipSnapshot } from "@/components/admin/membership-snapshot";
import { ProReadinessSnapshot } from "@/components/admin/pro-readiness-snapshot";

export const metadata = {
  title: "IXAI 營運控制台 | Admin",
  description: "IXAI 內部情報、受眾、分發與會員營運控制層。",
};

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          控制台首頁
        </p>
        <h1 className="mt-3 max-w-4xl font-serif text-3xl font-semibold leading-tight sm:text-5xl">
          IXAI 營運控制台
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
          內部情報、受眾、分發與會員營運控制層。Public routes 維持對外使用者體驗；
          此控制台用於內容營運、成長數據與 Pro 轉換準備。
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ["每日簡報流程", "審閱、預覽並手動發佈 Daily Brief。", "/admin/daily-briefs"],
          ["每週情報流程", "管理 Weekly Intelligence 草稿與發佈流程。", "/admin/daily-briefs#weekly"],
          ["發佈佇列", "所有內容仍需人工審閱後才能發佈。", "/admin/daily-briefs#queue"],
        ].map(([title, copy, href]) => (
          <Link
            className="rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
            href={href}
            key={title}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              內容營運
            </p>
            <h2 className="mt-2 text-base font-semibold text-[var(--ixai-cream)]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/52">{copy}</p>
          </Link>
        ))}
      </section>

      <section id="intelligence">
        <IntelligenceAnalyticsSnapshot />
      </section>
      <section id="audience">
        <AudienceSnapshot />
      </section>
      <section id="identity">
        <IdentitySnapshot />
      </section>
      <section id="line-identity">
        <LineIdentitySnapshot />
      </section>
      <section id="funnel">
        <ConversionFunnel />
      </section>
      <section id="membership">
        <MembershipSnapshot />
      </section>
      <section id="pro-readiness">
        <ProReadinessSnapshot />
      </section>
      <section id="distribution">
        <DistributionSnapshot />
      </section>
      <section
        className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/52 sm:p-5"
        id="system"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
          System
        </p>
        <p className="mt-2">
          環境變數、系統健康與紀錄介面保留給後續內部營運使用。Admin routes
          不渲染 public navigation 或一般使用者 app shell。
        </p>
      </section>
    </div>
  );
}
