// v1.32.1 — derive the current section title from the pathname so the
// mobile header always reflects where the user is. Used by the mobile
// header center label and by the drawer for active-route highlighting.

export type MobileSection =
  | "brief"
  | "market"
  | "ixai"
  | "fcn"
  | "watchlist"
  | "account"
  | "pro"
  | "about"
  | "feedback"
  | "settings"
  | "home"
  | "other";

export function resolveMobileSection(pathname: string): MobileSection {
  if (pathname === "/" || pathname === "") {
    return "home";
  }
  if (pathname.startsWith("/daily-brief") || pathname.startsWith("/weekly-brief")) {
    return "brief";
  }
  if (pathname.startsWith("/market")) {
    return "market";
  }
  if (pathname.startsWith("/ixai")) {
    return "ixai";
  }
  if (pathname.startsWith("/fcn")) {
    return "fcn";
  }
  if (pathname.startsWith("/watchlist")) {
    return "watchlist";
  }
  if (pathname.startsWith("/account")) {
    return "account";
  }
  if (pathname.startsWith("/pro")) {
    return "pro";
  }
  if (pathname.startsWith("/about")) {
    return "about";
  }
  if (pathname.startsWith("/feedback")) {
    return "feedback";
  }
  if (pathname.startsWith("/settings")) {
    return "settings";
  }
  return "other";
}

export function getMobileSectionTitle(pathname: string): string {
  switch (resolveMobileSection(pathname)) {
    case "home":
      return "IXAI";
    case "brief":
      return pathname.startsWith("/weekly-brief") ? "Weekly Intelligence" : "Daily Brief";
    case "market":
      return "Market";
    case "ixai":
      return "IXAI";
    case "fcn":
      return "FCN";
    case "watchlist":
      return "Watchlist";
    case "account":
      return "Me";
    case "pro":
      return "IXAI Pro";
    case "about":
      return "About 一玄";
    case "feedback":
      return "Feedback";
    case "settings":
      return "Settings";
    default:
      return "IXAI";
  }
}
