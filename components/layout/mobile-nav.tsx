import Link from "next/link";
import { ixaiEcosystem } from "@/src/lib/ixai/ecosystem";

const mobileItems = [
  { label: "首頁", href: "/" },
  { label: "每日", href: "/daily-brief" },
  { label: "市場", href: "/market" },
  { label: "FCN", href: "/fcn" },
  { external: true, label: "Pro", href: ixaiEcosystem.proDashboardUrl },
  { label: "關於", href: "/about" },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[rgba(176,141,87,0.28)] bg-[rgba(9,41,31,0.96)] px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur md:hidden">
      <div className="grid grid-cols-6 gap-1">
        {mobileItems.map((item, index) => (
          <Link
            className={`flex min-h-11 items-center justify-center rounded-lg px-1 text-center text-[11px] font-medium leading-tight ${
              index === 0
                ? "bg-white/10 text-[var(--ixai-cream)]"
                : "text-[rgba(245,240,230,0.58)]"
            }`}
            href={item.href}
            key={item.label}
            rel={item.external ? "noopener noreferrer" : undefined}
            target={item.external ? "_blank" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
