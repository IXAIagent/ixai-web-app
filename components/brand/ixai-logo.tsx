import Image from "next/image";

const logoSizes = {
  xs: "w-11",
  sm: "w-14",
  md: "w-20",
  lg: "w-28",
};

export function IxaiLogo({
  className = "",
  priority = false,
  size = "sm",
}: Readonly<{
  className?: string;
  priority?: boolean;
  size?: keyof typeof logoSizes;
}>) {
  return (
    <Image
      alt="I-Xuan IXAI"
      className={`h-auto select-none object-contain ${logoSizes[size]} ${className}`}
      height={239}
      priority={priority}
      sizes="(max-width: 768px) 96px, 128px"
      src="/logo/ixuan-logo.png"
      unoptimized
      width={527}
    />
  );
}

export function IxaiLogoFrame({
  className = "",
  logoSize = "sm",
  priority = false,
  tone = "light",
}: Readonly<{
  className?: string;
  logoSize?: keyof typeof logoSizes;
  priority?: boolean;
  tone?: "dark" | "light";
}>) {
  const toneClass =
    tone === "dark"
      ? "border-white/10 bg-white/[0.055]"
      : "border-[var(--ixai-border)] bg-[var(--ixai-paper)]";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg border ${toneClass} ${className}`}
    >
      <IxaiLogo priority={priority} size={logoSize} />
    </div>
  );
}
