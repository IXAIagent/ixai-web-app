import Image from "next/image";
import Link from "next/link";

const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Daily Brief", href: "/daily-brief" },
  { label: "Weekly Brief", href: "/weekly-brief" },
  { label: "IXAI Pro", href: "/ixai" },
  { label: "Contact", href: "/about#contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-[rgba(176,141,87,0.28)] bg-[var(--ixai-forest)] text-[var(--ixai-cream)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-12">
        <div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <Image
                alt="I-Xuan Investment Co. Ltd."
                className="h-auto w-10"
                height={48}
                src="/logo/ixuan-logo.png"
                width={96}
              />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ixai-gold)]">
                IXAI
              </p>
              <p className="mt-1 text-lg font-semibold">
                AI Wealth Intelligence
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/62">
            一玄打造的金融 intelligence platform，結合市場情報、AI
            分析與風險監控，為每日財富決策建立更穩定的閱讀與觀察節奏。
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <nav className="grid gap-2">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Navigation
            </p>
            {footerLinks.map((link) => (
              <Link
                className="text-sm text-white/64 transition hover:text-white"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--ixai-gold)]">
              Trust Note
            </p>
            <p className="mt-3 text-sm leading-7 text-white/62">
              市場研究與風險觀察用途，不構成投資建議、買賣指令或報酬承諾。
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-white/46 sm:flex-row sm:items-center sm:justify-between">
          <p>© I-Xuan Investment Co. Ltd.</p>
          <p>Public Content Layer + Daily Usage Layer + Future SaaS Layer</p>
        </div>
      </div>
    </footer>
  );
}
