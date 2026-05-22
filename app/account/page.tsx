import { AccountPanel } from "@/components/auth/account-panel";
import { PwaInstallCard } from "@/components/pwa/install-card";
import { buildPublicMetadata } from "@/src/lib/brand/metadata";
import { ixaiIdentity } from "@/src/lib/ixai/identity";

export const metadata = buildPublicMetadata({
  title: "我的 IXAI",
  description: "我的 IXAI 是偏好設定、watchlist 同步與未來個人化 AI 風險監控的入口。",
});

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-4 text-[var(--ixai-cream)] shadow-[0_18px_56px_rgba(9,41,31,0.14)] sm:p-7 sm:shadow-[0_24px_80px_rgba(9,41,31,0.16)]">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          My IXAI
        </p>
        <h1 className="mt-2 max-w-3xl font-serif text-2xl font-semibold leading-8 sm:mt-3 sm:text-5xl sm:leading-snug">
          個人化 AI wealth intelligence 的起點。
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72 sm:mt-4 sm:leading-7">
          我的 IXAI 是個人身份層、偏好中心、watchlist 同步中心，也是未來 IXAI Pro
          個人情報工作區的入口。
        </p>
        <p className="mt-3 max-w-3xl text-xs leading-6 text-white/56">
          {ixaiIdentity.sharedAccountMessage}
        </p>
      </section>

      <AccountPanel />
      <PwaInstallCard />

      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[rgba(255,250,240,0.82)] p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          IXAI Pro connection
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
          Public Account 先建立，Pro 連接分階段開放。
        </h2>
        <div className="mt-5 grid gap-3 text-sm leading-6 text-[var(--ixai-forest-soft)] sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Public App", "使用 IXAI Account 進入 Public Intelligence Layer。"],
            ["Shared login", "未來支援 Public App 與 IXAI Pro 共用登入。"],
            ["Watchlist sync", "目前此裝置保存；登入後將逐步支援跨裝置同步。"],
            ["Notifications", "Daily Brief、風險與 FCN 通知需使用者明確開啟。"],
          ].map(([label, copy]) => (
            <article
              className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4"
              key={label}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ixai-gold)]">
                {label}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ixai-forest-soft)]">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["FREE", "Daily Brief、Weekly Brief、市場總覽與基礎自選觀察。"],
          ["PERSONAL", "保存自選觀察、關注主題與閱讀記憶，調整個人情報優先順序。"],
          ["PRO", "FCN 監控、投資組合 intelligence、AI 風險提醒、Crypto 監控與個人晨報。"],
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

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.78)] p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Why account?
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
          IXAI Account 是建立個人市場記憶與未來 Pro continuity 的起點。
        </h2>
        <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--ixai-forest-soft)] md:grid-cols-2">
          {[
            "未來支援跨裝置同步 watchlist，不只存在單一瀏覽器。",
            "保存 interests，讓情報排序逐步貼近你的市場關注。",
            "累積 reading memory，讓 IXAI 更懂你的每日使用脈絡。",
            "為未來 IXAI Pro 的 FCN、portfolio、AI risk alerts 與 personal morning brief 做準備。",
            ixaiIdentity.accountContinuityCopy,
          ].map((item) => (
            <p
              className="rounded-lg border border-[var(--ixai-border)] bg-white/45 p-4"
              key={item}
            >
              {item}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
