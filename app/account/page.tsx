import { AccountPanel } from "@/components/auth/account-panel";

export const metadata = {
  title: "我的 IXAI | Identity",
  description: "IXAI lightweight identity, guest mode, interests, and personal intelligence memory.",
};

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          My IXAI
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-snug sm:text-5xl">
          個人化 AI wealth intelligence 的起點。
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72">
          v1.9 先建立輕量身份、興趣設定與 intelligence memory。未來 IXAI Pro
          會把這些訊號延伸成 FCN、投資組合與風險監控工作流。
        </p>
      </section>

      <AccountPanel />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["FREE", "Daily Brief、Weekly Brief、basic watchlist 與 guest memory。"],
          ["PERSONAL", "登入後同步 watchlist、interests 與 daily usage context。"],
          ["PRO", "未來解鎖 FCN monitoring、AI risk alerts、portfolio intelligence。"],
        ].map(([label, copy]) => (
          <article
            className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-4"
            key={label}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ixai-gold)]">
              {label}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--ixai-forest-soft)]">
              {copy}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
