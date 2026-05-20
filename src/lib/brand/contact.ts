export type BrandContactChannel = {
  label: "LINE" | "Facebook" | "Instagram" | "Email";
  value: string;
  ctaLabel: string;
  isExternal: boolean;
};

export const brandContact = {
  email: "ixuan.winning@gmail.com",
  facebookUrl: "https://www.facebook.com/profile.php?id=61578789500837",
  instagramUrl: "https://instagram.com/ixuan.winning",
  lineUrl: "https://line.me/ti/p/uVB26n5UfC",
};

function isValidPublicEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !value.endsWith(".placeholder");
}

export function getBrandContactChannels() {
  const channels: BrandContactChannel[] = [
    {
      label: "LINE",
      value: brandContact.lineUrl,
      ctaLabel: "加入 LINE 諮詢",
      isExternal: true,
    },
    {
      label: "Email",
      value: isValidPublicEmail(brandContact.email) ? `mailto:${brandContact.email}` : "",
      ctaLabel: "聯絡一玄",
      isExternal: false,
    },
    {
      label: "Instagram",
      value: brandContact.instagramUrl,
      ctaLabel: "追蹤 Instagram",
      isExternal: true,
    },
    {
      label: "Facebook",
      value: brandContact.facebookUrl,
      ctaLabel: "追蹤 Facebook",
      isExternal: true,
    },
  ];

  return channels.map((channel) => ({
    ...channel,
    isEnabled: Boolean(channel.value),
  }));
}

export function getPrimaryContactLinks() {
  const channels = getBrandContactChannels();

  return {
    email: channels.find((channel) => channel.label === "Email"),
    facebook: channels.find((channel) => channel.label === "Facebook"),
    instagram: channels.find((channel) => channel.label === "Instagram"),
    line: channels.find((channel) => channel.label === "LINE"),
  };
}
