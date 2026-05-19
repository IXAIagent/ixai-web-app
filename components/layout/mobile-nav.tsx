import Link from "next/link";

const mobileItems = [
  { label: "首頁", href: "/" },
  { label: "每日", href: "/daily-brief" },
  { label: "自選", href: "/watchlist" },
  { label: "Pro", href: "/ixai" },
  { label: "關於", href: "/about" },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[rgba(176,141,87,0.28)] bg-[rgba(9,41,31,0.96)] px-3 py-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileItems.map((item, index) => (
          <Link
            className={`rounded-lg py-2 text-center text-xs font-medium ${
              index === 0
                ? "bg-white/10 text-[var(--ixai-cream)]"
                : "text-white/58"
            }`}
            href={item.href}
            key={item.label}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
