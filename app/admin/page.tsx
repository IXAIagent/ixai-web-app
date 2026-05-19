import Link from "next/link";

export const metadata = {
  title: "Admin | IXAI",
  description: "IXAI internal editorial operation layer.",
};

export default function AdminPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-lg border border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] p-5 text-[var(--ixai-cream)] shadow-[0_24px_80px_rgba(9,41,31,0.16)] sm:p-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
          Internal Admin
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-snug sm:text-5xl">
          內容營運系統的第一層。
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
          v1.6 先建立 Daily Brief draft pipeline，讓 IXAI 從 local TS content
          走向可審稿、可發布、可自動更新的 editorial layer。
        </p>
      </section>

      <section className="rounded-lg border border-[var(--ixai-border)] bg-[rgba(255,250,240,0.82)] p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Editorial
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--ixai-forest)]">
          Daily Briefs
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ixai-ink-muted)]">
          管理 AI generated draft、review queue 與 publish workflow。這頁目前不放入公開導覽。
        </p>
        <Link
          className="mt-5 inline-flex rounded-lg bg-[var(--ixai-forest)] px-4 py-2 text-sm font-medium text-[var(--ixai-cream)]"
          href="/admin/daily-briefs"
        >
          進入 Daily Brief Pipeline
        </Link>
      </section>
    </div>
  );
}
