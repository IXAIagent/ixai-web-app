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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-[rgba(176,141,87,0.22)] bg-[#071f17] text-[var(--ixai-cream)] md:flex md:flex-col">
      <div className="border-b border-white/10 px-4 py-5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--ixai-gold)]">
          IXAI
        </p>
        <h1 className="mt-2 text-base font-semibold tracking-normal">
          Intelligence OS
        </h1>
        <p className="mt-2 text-xs leading-5 text-white/48">
          Daily market command layer.
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2.5 py-4">
        {navItems.map((item, index) => (
          <Link
            className={`rounded-md px-3 py-2 font-mono text-xs transition ${
              index === 0
                ? "bg-white/10 text-white"
                : "text-white/54 hover:bg-white/[0.06] hover:text-white"
            }`}
            href={item.href}
            key={item.label}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="m-2.5 rounded-lg border border-white/10 bg-black/18 p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
          Risk State
        </p>
        <p className="mt-2 text-xs leading-5 text-white/62">
          Risk-on 偏正向，但利率仍是估值壓力源。
        </p>
      </div>
    </aside>
  );
}
