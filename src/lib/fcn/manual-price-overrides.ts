import type { FCNManualPriceOverrides } from "@/src/lib/fcn/intelligence-center";

export const FCN_MANUAL_PRICE_EVENT = "ixai:fcn-manual-prices:changed";
export const FCN_MANUAL_PRICE_STORAGE_KEY = "ixai.fcn.manual-prices.v320";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function parseManualPrices(raw: string | null): FCNManualPriceOverrides {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed)
        .map(([symbol, value]) => [normalizeSymbol(symbol), value])
        .filter(
          (entry): entry is [string, number] =>
            Boolean(entry[0]) && typeof entry[1] === "number" && Number.isFinite(entry[1]),
        ),
    );
  } catch {
    return {};
  }
}

export function loadFcnManualPriceOverrides(): FCNManualPriceOverrides {
  if (!canUseLocalStorage()) {
    return {};
  }

  return parseManualPrices(window.localStorage.getItem(FCN_MANUAL_PRICE_STORAGE_KEY));
}

export function saveFcnManualPriceOverrides(prices: FCNManualPriceOverrides) {
  if (!canUseLocalStorage()) {
    return;
  }

  const normalized = Object.fromEntries(
    Object.entries(prices)
      .map(([symbol, value]) => [normalizeSymbol(symbol), value])
      .filter((entry): entry is [string, number] => {
        return Boolean(entry[0]) && typeof entry[1] === "number" && Number.isFinite(entry[1]);
      }),
  );

  try {
    window.localStorage.setItem(FCN_MANUAL_PRICE_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(FCN_MANUAL_PRICE_EVENT));
  } catch {
    // Manual price overrides must never block FCN Center rendering.
  }
}
