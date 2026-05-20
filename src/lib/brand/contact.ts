export type BrandContactChannel = {
  label: "LINE" | "Instagram" | "Threads" | "Email";
  value: string;
};

export const brandContact = {
  lineUrl: "",
  instagramUrl: "",
  threadsUrl: "",
  email: "",
};

function isValidPublicEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && !value.endsWith(".placeholder");
}

export function getBrandContactChannels() {
  const channels: BrandContactChannel[] = [
    { label: "LINE", value: brandContact.lineUrl },
    { label: "Instagram", value: brandContact.instagramUrl },
    { label: "Threads", value: brandContact.threadsUrl },
    { label: "Email", value: isValidPublicEmail(brandContact.email) ? `mailto:${brandContact.email}` : "" },
  ];

  return channels.map((channel) => ({
    ...channel,
    isEnabled: Boolean(channel.value),
  }));
}
