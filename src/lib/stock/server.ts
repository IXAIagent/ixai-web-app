import {
  PositionRequestError,
  assertPortfolioOwnership,
  assertUuid,
  getCurrentSupabaseUser,
  isRecord,
  normalizeEnum,
  normalizeMetadata,
  normalizeNumber,
  normalizeText,
  positionFetch,
} from "@/src/lib/positions/supabase";
import {
  STOCK_CURRENCIES,
  STOCK_MARKETS,
  STOCK_POSITION_STATUSES,
  STOCK_POSITION_TYPES,
  type StockCurrency,
  type StockMarket,
  type StockPosition,
  type StockPositionCreateInput,
  type StockPositionRow,
  type StockPositionStatus,
  type StockPositionType,
  type StockPositionUpdateInput,
} from "@/src/types/stock-position";

type StockMutationPayload = {
  average_cost?: number | null;
  currency?: StockCurrency;
  current_price?: number | null;
  market?: StockMarket;
  metadata?: Record<string, unknown>;
  name?: string | null;
  position_type?: StockPositionType;
  quantity?: number;
  status?: StockPositionStatus;
  symbol?: string;
};

const STOCK_SELECT =
  "id,user_id,portfolio_id,symbol,name,market,currency,quantity,average_cost,current_price,position_type,status,metadata,created_at,updated_at";
const STORAGE_LABEL = "Stock";

function normalizeCreateInput(input: unknown): StockPositionCreateInput {
  if (!isRecord(input)) {
    throw new PositionRequestError(400, "invalid_input", "Stock payload is required.");
  }

  const portfolioId = normalizeText(input.portfolioId, "portfolioId", { required: true });

  if (!portfolioId) {
    throw new PositionRequestError(404, "portfolio_not_found", "Portfolio not found.");
  }

  assertUuid(portfolioId, "Portfolio not found.");

  return {
    averageCost: normalizeNumber(input.averageCost, "averageCost"),
    currency: normalizeEnum(input.currency, STOCK_CURRENCIES, "currency", "USD"),
    currentPrice: normalizeNumber(input.currentPrice, "currentPrice"),
    market: normalizeEnum(input.market, STOCK_MARKETS, "market", "US"),
    metadata: normalizeMetadata(input.metadata),
    name: normalizeText(input.name, "name"),
    portfolioId,
    positionType: normalizeEnum(input.positionType, STOCK_POSITION_TYPES, "positionType", "equity"),
    quantity: normalizeNumber(input.quantity, "quantity", 0) ?? 0,
    symbol:
      normalizeText(input.symbol, "symbol", {
        maxLength: 32,
        required: true,
        uppercase: true,
      }) ?? "",
  };
}

function normalizeUpdateInput(input: unknown): StockPositionUpdateInput {
  if (!isRecord(input)) {
    throw new PositionRequestError(400, "invalid_input", "Stock payload is required.");
  }

  const patch: StockPositionUpdateInput = {};

  if (input.symbol !== undefined) {
    patch.symbol =
      normalizeText(input.symbol, "symbol", {
        maxLength: 32,
        required: true,
        uppercase: true,
      }) ?? "";
  }

  if (input.name !== undefined) {
    patch.name = normalizeText(input.name, "name");
  }

  if (input.market !== undefined) {
    patch.market = normalizeEnum(input.market, STOCK_MARKETS, "market");
  }

  if (input.currency !== undefined) {
    patch.currency = normalizeEnum(input.currency, STOCK_CURRENCIES, "currency");
  }

  if (input.quantity !== undefined) {
    patch.quantity = normalizeNumber(input.quantity, "quantity", 0) ?? 0;
  }

  if (input.averageCost !== undefined) {
    patch.averageCost = normalizeNumber(input.averageCost, "averageCost");
  }

  if (input.currentPrice !== undefined) {
    patch.currentPrice = normalizeNumber(input.currentPrice, "currentPrice");
  }

  if (input.positionType !== undefined) {
    patch.positionType = normalizeEnum(input.positionType, STOCK_POSITION_TYPES, "positionType");
  }

  if (input.status !== undefined) {
    patch.status = normalizeEnum(input.status, STOCK_POSITION_STATUSES, "status");
  }

  if (input.metadata !== undefined) {
    patch.metadata = normalizeMetadata(input.metadata);
  }

  if (Object.keys(patch).length === 0) {
    throw new PositionRequestError(400, "invalid_input", "No stock fields to update.");
  }

  return patch;
}

function toMutationPayload(input: StockPositionUpdateInput): StockMutationPayload {
  return {
    ...(input.averageCost !== undefined ? { average_cost: input.averageCost } : {}),
    ...(input.currency !== undefined ? { currency: input.currency } : {}),
    ...(input.currentPrice !== undefined ? { current_price: input.currentPrice } : {}),
    ...(input.market !== undefined ? { market: input.market } : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.positionType !== undefined ? { position_type: input.positionType } : {}),
    ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.symbol !== undefined ? { symbol: input.symbol } : {}),
  };
}

function toStockPosition(row: StockPositionRow): StockPosition {
  return {
    averageCost: row.average_cost,
    createdAt: row.created_at,
    currency: row.currency,
    currentPrice: row.current_price,
    id: row.id,
    market: row.market,
    metadata: row.metadata ?? {},
    name: row.name,
    portfolioId: row.portfolio_id,
    positionType: row.position_type,
    quantity: row.quantity,
    status: row.status,
    symbol: row.symbol,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

function buildPositionSearch(userId: string, options?: { portfolioId?: string }) {
  const search = new URLSearchParams({
    order: "created_at.desc",
    select: STOCK_SELECT,
    status: "neq.archived",
    user_id: `eq.${userId}`,
  });

  if (options?.portfolioId) {
    assertUuid(options.portfolioId, "Portfolio not found.");
    search.set("portfolio_id", `eq.${options.portfolioId}`);
  }

  return search;
}

function buildPositionByIdSearch(userId: string, id: string) {
  return new URLSearchParams({
    id: `eq.${id}`,
    limit: "1",
    select: STOCK_SELECT,
    user_id: `eq.${userId}`,
  });
}

export async function listStockPositions(
  authorizationHeader: string | null,
  options?: { portfolioId?: string },
): Promise<StockPosition[]> {
  const user = await getCurrentSupabaseUser(authorizationHeader, STORAGE_LABEL);

  if (options?.portfolioId) {
    await assertPortfolioOwnership(user, options.portfolioId, STORAGE_LABEL);
  }

  const rows = await positionFetch<StockPositionRow[]>(
    user,
    `stock_positions?${buildPositionSearch(user.id, options)}`,
    {},
    STORAGE_LABEL,
  );

  return (Array.isArray(rows) ? rows : []).map(toStockPosition);
}

export async function getStockPositionById(
  authorizationHeader: string | null,
  id: string,
): Promise<StockPosition | null> {
  assertUuid(id, "Stock position not found.");

  const user = await getCurrentSupabaseUser(authorizationHeader, STORAGE_LABEL);
  const rows = await positionFetch<StockPositionRow[]>(
    user,
    `stock_positions?${buildPositionByIdSearch(user.id, id)}`,
    {},
    STORAGE_LABEL,
  );

  return Array.isArray(rows) && rows[0] ? toStockPosition(rows[0]) : null;
}

export async function createStockPosition(
  authorizationHeader: string | null,
  input: unknown,
): Promise<StockPosition> {
  const user = await getCurrentSupabaseUser(authorizationHeader, STORAGE_LABEL);
  const normalized = normalizeCreateInput(input);

  await assertPortfolioOwnership(user, normalized.portfolioId, STORAGE_LABEL);

  const rows = await positionFetch<StockPositionRow[]>(user, "stock_positions", {
    body: JSON.stringify({
      average_cost: normalized.averageCost ?? null,
      currency: normalized.currency,
      current_price: normalized.currentPrice ?? null,
      market: normalized.market,
      metadata: normalized.metadata ?? {},
      name: normalized.name ?? null,
      portfolio_id: normalized.portfolioId,
      position_type: normalized.positionType,
      quantity: normalized.quantity ?? 0,
      status: "active",
      symbol: normalized.symbol,
      user_id: user.id,
    }),
    headers: {
      prefer: "return=representation",
    },
    method: "POST",
  }, STORAGE_LABEL);

  if (!Array.isArray(rows) || !rows[0]) {
    throw new PositionRequestError(
      502,
      "position_storage_failed",
      "Stock position could not be created.",
    );
  }

  return toStockPosition(rows[0]);
}

export async function updateStockPosition(
  authorizationHeader: string | null,
  id: string,
  input: unknown,
): Promise<StockPosition | null> {
  assertUuid(id, "Stock position not found.");

  const user = await getCurrentSupabaseUser(authorizationHeader, STORAGE_LABEL);
  const normalized = normalizeUpdateInput(input);
  const rows = await positionFetch<StockPositionRow[]>(
    user,
    `stock_positions?${buildPositionByIdSearch(user.id, id)}`,
    {
      body: JSON.stringify(toMutationPayload(normalized)),
      headers: {
        prefer: "return=representation",
      },
      method: "PATCH",
    },
    STORAGE_LABEL,
  );

  return Array.isArray(rows) && rows[0] ? toStockPosition(rows[0]) : null;
}

export async function archiveStockPosition(
  authorizationHeader: string | null,
  id: string,
): Promise<StockPosition | null> {
  return updateStockPosition(authorizationHeader, id, { status: "archived" });
}
