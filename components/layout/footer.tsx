import Link from "next/link";

const footerLinks = [
  { label: "Contact", href: "/about#contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-[rgba(176,141,87,0.22)] bg-[#071f17] text-[var(--ixai-cream)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-xs leading-6 text-white/48 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <p>市場資料與內容僅供資訊參考，不構成投資建議、買賣指令或報酬承諾。</p>
        <div className="flex flex-wrap items-center gap-3">
          {footerLinks.map((link) => (
            <Link
              className="text-white/56 transition hover:text-white"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <p>© I-Xuan Investment Co. Ltd.</p>
        </div>
      </div>
    </footer>
  );
}
