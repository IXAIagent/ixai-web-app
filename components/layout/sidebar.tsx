import Link from "next/link";

const navItems = [
  { label: "市場首頁", href: "/" },
  { label: "每日簡報", href: "/daily-brief" },
  { label: "週報", href: "/weekly-brief" },
  { label: "市場總覽", href: "/market" },
  { label: "自選觀察", href: "/watchlist" },
  { label: "IXAI Pro", href: "/ixai" },
  { label: "關於一玄", href: "/about" },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[rgba(176,141,87,0.24)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)] md:flex md:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--ixai-gold)]">
          IXAI
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-normal">
          財富情報系統
        </h1>
        <p className="mt-2 max-w-44 text-sm leading-6 text-white/58">
          為每日市場閱讀建立更有紀律的決策脈絡。
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
        {navItems.map((item, index) => (
          <Link
            className={`rounded-lg px-3 py-2.5 text-sm transition ${
              index === 0
                ? "bg-white/10 text-white"
                : "text-white/62 hover:bg-white/7 hover:text-white"
            }`}
            href={item.href}
            key={item.label}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="m-3 rounded-lg border border-white/10 bg-white/[0.045] p-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          今日脈絡
        </p>
        <p className="mt-2 text-sm leading-6 text-white/72">
          市場結構偏正向，領漲集中，仍對利率變化敏感。
        </p>
      </div>
    </aside>
  );
}
