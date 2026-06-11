import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Home,
  Newspaper,
  Settings,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { buildPublicMetadata } from "@/src/lib/brand/metadata";

export const metadata = buildPublicMetadata({
  title: "我的 IXAI",
  description: "Account 是過渡入口；IXAI Workspace Home 是登入後主工作台。",
});

const workspaceLinks = [
  {
    description: "管理 Portfolio Center、資產與未來持倉 readback。",
    href: "/my-ixai/portfolio",
    icon: BriefcaseBusiness,
    label: "Portfolio",
  },
  {
    description: "集中查看風險、情境與監控模組。",
    href: "/my-ixai/risk",
    icon: ShieldAlert,
    label: "Risk",
  },
  {
    description: "整理 FCN positions、underlyings 與未來 KI / KO 監控。",
    href: "/my-ixai/fcn",
    icon: ShieldCheck,
    label: "FCN",
  },
  {
    description: "承接 Daily、Weekly、News、Commentary 與 Recommendation surfaces。",
    href: "/my-ixai/intelligence",
    icon: Newspaper,
    label: "Intelligence",
  },
  {
    description: "未來管理帳號、會員、通知、語言、地區與 broker connections。",
    href: "/my-ixai/settings",
    icon: Settings,
    label: "Settings",
  },
];

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          Legacy Transitional Page
        </p>
        <h1 className="mt-2 max-w-3xl font-serif text-2xl font-semibold leading-8 sm:mt-3 sm:text-5xl sm:leading-snug">
          你的 IXAI Workspace 已啟用。
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:mt-4 sm:leading-7">
          Account 不再是主要入口。登入後請從 Workspace Home 開始，依工作流進入
          Portfolio、Risk、FCN、Intelligence 與 Settings。
        </p>
        <div className="mt-5 max-w-xs">
          <Link
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--ixai-cream)] px-4 py-2.5 text-sm font-semibold text-[var(--ixai-forest)]"
            href="/my-ixai/home"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            進入 Workspace
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.84)] p-4 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Workspace 管理
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
          前往 Workspace 管理
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workspaceLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="group flex min-h-32 flex-col justify-between rounded-lg border border-[var(--ixai-border)] bg-white/55 p-4 text-[var(--ixai-forest)] transition hover:-translate-y-0.5 hover:bg-white/80"
                href={item.href}
                key={item.href}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-[var(--ixai-gold)]" aria-hidden="true" />
                    {item.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--ixai-gold)] transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
                <span className="mt-4 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                  {item.description}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
