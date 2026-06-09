import {
  PositionRequestError,
  assertPortfolioOwnership,
  assertUuid,
  getCurrentSupabaseUser,
  isRecord,
  normalizeDate,
  normalizeEnum,
  normalizeInteger,
  normalizeMetadata,
  normalizeNumber,
  normalizeText,
  positionFetch,
} from "@/src/lib/positions/supabase";
import {
  CRYPTO_CURRENCIES,
  CRYPTO_POSITION_STATUSES,
  CRYPTO_POSITION_TYPES,
  CRYPTO_STRATEGY_TYPES,
  type CryptoCurrency,
  type CryptoPosition,
  type CryptoPositionCreateInput,
  type CryptoPositionRow,
  type CryptoPositionStatus,
  type CryptoPositionType,
  type CryptoPositionUpdateInput,
  type CryptoStrategyType,
} from "@/src/types/crypto-position";

type CryptoMutationPayload = {
  average_cost?: number | null;
  currency?: CryptoCurrency;
  current_price?: number | null;
  dual_settlement_date?: string | null;
  dual_target_price?: number | null;
  exchange?: string | null;
  grid_count?: number | null;
  grid_lower_price?: number | null;
  grid_upper_price?: number | null;
  leverage?: number | null;
  metadata?: Record<string, unknown>;
  name?: string | null;
  position_type?: CryptoPositionType;
  quantity?: number;
  status?: CryptoPositionStatus;
  strategy_type?: CryptoStrategyType;
  symbol?: string;
};

const CRYPTO_SELECT =
  "id,user_id,portfolio_id,symbol,name,exchange,currency,quantity,average_cost,current_price,position_type,strategy_type,leverage,grid_lower_price,grid_upper_price,grid_count,dual_target_price,dual_settlement_date,status,metadata,created_at,updated_at";
const STORAGE_LABEL = "Crypto";

function normalizeCreateInput(input: unknown): CryptoPositionCreateInput {
  if (!isRecord(input)) {
    throw new PositionRequestError(400, "invalid_input", "Crypto payload is required.");
  }

  const portfolioId = normalizeText(input.portfolioId, "portfolioId", { required: true });

  if (!portfolioId) {
    throw new PositionRequestError(404, "portfolio_not_found", "Portfolio not found.");
  }

  assertUuid(portfolioId, "Portfolio not found.");

  return {
    averageCost: normalizeNumber(input.averageCost, "averageCost"),
    currency: normalizeEnum(input.currency, CRYPTO_CURRENCIES, "currency", "USDT"),
    currentPrice: normalizeNumber(input.currentPrice, "currentPrice"),
    dualSettlementDate: normalizeDate(input.dualSettlementDate, "dualSettlementDate"),
    dualTargetPrice: normalizeNumber(input.dualTargetPrice, "dualTargetPrice"),
    exchange: normalizeText(input.exchange, "exchange"),
    gridCount: normalizeInteger(input.gridCount, "gridCount"),
    gridLowerPrice: normalizeNumber(input.gridLowerPrice, "gridLowerPrice"),
    gridUpperPrice: normalizeNumber(input.gridUpperPrice, "gridUpperPrice"),
    leverage: normalizeNumber(input.leverage, "leverage"),
    metadata: normalizeMetadata(input.metadata),
    name: normalizeText(input.name, "name"),
    portfolioId,
    positionType: normalizeEnum(input.positionType, CRYPTO_POSITION_TYPES, "positionType", "spot"),
    quantity: normalizeNumber(input.quantity, "quantity", 0) ?? 0,
    strategyType: normalizeEnum(input.strategyType, CRYPTO_STRATEGY_TYPES, "strategyType", "holding"),
    symbol:
      normalizeText(input.symbol, "symbol", {
        maxLength: 32,
        required: true,
        uppercase: true,
      }) ?? "",
  };
}

function normalizeUpdateInput(input: unknown): CryptoPositionUpdateInput {
  if (!isRecord(input)) {
    throw new PositionRequestError(400, "invalid_input", "Crypto payload is required.");
  }

  const patch: CryptoPositionUpdateInput = {};

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

  if (input.exchange !== undefined) {
    patch.exchange = normalizeText(input.exchange, "exchange");
  }

  if (input.currency !== undefined) {
    patch.currency = normalizeEnum(input.currency, CRYPTO_CURRENCIES, "currency");
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
    patch.positionType = normalizeEnum(input.positionType, CRYPTO_POSITION_TYPES, "positionType");
  }

  if (input.strategyType !== undefined) {
    patch.strategyType = normalizeEnum(input.strategyType, CRYPTO_STRATEGY_TYPES, "strategyType");
  }

  if (input.leverage !== undefined) {
    patch.leverage = normalizeNumber(input.leverage, "leverage");
  }

  if (input.gridLowerPrice !== undefined) {
    patch.gridLowerPrice = normalizeNumber(input.gridLowerPrice, "gridLowerPrice");
  }

  if (input.gridUpperPrice !== undefined) {
    patch.gridUpperPrice = normalizeNumber(input.gridUpperPrice, "gridUpperPrice");
  }

  if (input.gridCount !== undefined) {
    patch.gridCount = normalizeInteger(input.gridCount, "gridCount");
  }

  if (input.dualTargetPrice !== undefined) {
    patch.dualTargetPrice = normalizeNumber(input.dualTargetPrice, "dualTargetPrice");
  }

  if (input.dualSettlementDate !== undefined) {
    patch.dualSettlementDate = normalizeDate(input.dualSettlementDate, "dualSettlementDate");
  }

  if (input.status !== undefined) {
    patch.status = normalizeEnum(input.status, CRYPTO_POSITION_STATUSES, "status");
  }

  if (input.metadata !== undefined) {
    patch.metadata = normalizeMetadata(input.metadata);
  }

  if (Object.keys(patch).length === 0) {
    throw new PositionRequestError(400, "invalid_input", "No crypto fields to update.");
  }

  return patch;
}

function toMutationPayload(input: CryptoPositionUpdateInput): CryptoMutationPayload {
  return {
    ...(input.averageCost !== undefined ? { average_cost: input.averageCost } : {}),
    ...(input.currency !== undefined ? { currency: input.currency } : {}),
    ...(input.currentPrice !== undefined ? { current_price: input.currentPrice } : {}),
    ...(input.dualSettlementDate !== undefined
      ? { dual_settlement_date: input.dualSettlementDate }
      : {}),
    ...(input.dualTargetPrice !== undefined ? { dual_target_price: input.dualTargetPrice } : {}),
    ...(input.exchange !== undefined ? { exchange: input.exchange } : {}),
    ...(input.gridCount !== undefined ? { grid_count: input.gridCount } : {}),
    ...(input.gridLowerPrice !== undefined ? { grid_lower_price: input.gridLowerPrice } : {}),
    ...(input.gridUpperPrice !== undefined ? { grid_upper_price: input.gridUpperPrice } : {}),
    ...(input.leverage !== undefined ? { leverage: input.leverage } : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.positionType !== undefined ? { position_type: input.positionType } : {}),
    ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.strategyType !== undefined ? { strategy_type: input.strategyType } : {}),
    ...(input.symbol !== undefined ? { symbol: input.symbol } : {}),
  };
}

function toCryptoPosition(row: CryptoPositionRow): CryptoPosition {
  return {
    averageCost: row.average_cost,
    createdAt: row.created_at,
    currency: row.currency,
    currentPrice: row.current_price,
    dualSettlementDate: row.dual_settlement_date,
    dualTargetPrice: row.dual_target_price,
    exchange: row.exchange,
    gridCount: row.grid_count,
    gridLowerPrice: row.grid_lower_price,
    gridUpperPrice: row.grid_upper_price,
    id: row.id,
    leverage: row.leverage,
    metadata: row.metadata ?? {},
    name: row.name,
    portfolioId: row.portfolio_id,
    positionType: row.position_type,
    quantity: row.quantity,
    status: row.status,
    strategyType: row.strategy_type,
    symbol: row.symbol,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

function buildPositionSearch(userId: string, options?: { portfolioId?: string }) {
  const search = new URLSearchParams({
    order: "created_at.desc",
    select: CRYPTO_SELECT,
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
    select: CRYPTO_SELECT,
    user_id: `eq.${userId}`,
  });
}

export async function listCryptoPositions(
  authorizationHeader: string | null,
  options?: { portfolioId?: string },
): Promise<CryptoPosition[]> {
  const user = await getCurrentSupabaseUser(authorizationHeader, STORAGE_LABEL);

  if (options?.portfolioId) {
    await assertPortfolioOwnership(user, options.portfolioId, STORAGE_LABEL);
  }

  const rows = await positionFetch<CryptoPositionRow[]>(
    user,
    `crypto_positions?${buildPositionSearch(user.id, options)}`,
    {},
    STORAGE_LABEL,
  );

  return (Array.isArray(rows) ? rows : []).map(toCryptoPosition);
}

export async function getCryptoPositionById(
  authorizationHeader: string | null,
  id: string,
): Promise<CryptoPosition | null> {
  assertUuid(id, "Crypto position not found.");

  const user = await getCurrentSupabaseUser(authorizationHeader, STORAGE_LABEL);
  const rows = await positionFetch<CryptoPositionRow[]>(
    user,
    `crypto_positions?${buildPositionByIdSearch(user.id, id)}`,
    {},
    STORAGE_LABEL,
  );

  return Array.isArray(rows) && rows[0] ? toCryptoPosition(rows[0]) : null;
}

export async function createCryptoPosition(
  authorizationHeader: string | null,
  input: unknown,
): Promise<CryptoPosition> {
  const user = await getCurrentSupabaseUser(authorizationHeader, STORAGE_LABEL);
  const normalized = normalizeCreateInput(input);

  await assertPortfolioOwnership(user, normalized.portfolioId, STORAGE_LABEL);

  const rows = await positionFetch<CryptoPositionRow[]>(user, "crypto_positions", {
    body: JSON.stringify({
      average_cost: normalized.averageCost ?? null,
      currency: normalized.currency,
      current_price: normalized.currentPrice ?? null,
      dual_settlement_date: normalized.dualSettlementDate ?? null,
      dual_target_price: normalized.dualTargetPrice ?? null,
      exchange: normalized.exchange ?? null,
      grid_count: normalized.gridCount ?? null,
      grid_lower_price: normalized.gridLowerPrice ?? null,
      grid_upper_price: normalized.gridUpperPrice ?? null,
      leverage: normalized.leverage ?? null,
      metadata: normalized.metadata ?? {},
      name: normalized.name ?? null,
      portfolio_id: normalized.portfolioId,
      position_type: normalized.positionType,
      quantity: normalized.quantity ?? 0,
      status: "active",
      strategy_type: normalized.strategyType,
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
      "Crypto position could not be created.",
    );
  }

  return toCryptoPosition(rows[0]);
}

export async function updateCryptoPosition(
  authorizationHeader: string | null,
  id: string,
  input: unknown,
): Promise<CryptoPosition | null> {
  assertUuid(id, "Crypto position not found.");

  const user = await getCurrentSupabaseUser(authorizationHeader, STORAGE_LABEL);
  const normalized = normalizeUpdateInput(input);
  const rows = await positionFetch<CryptoPositionRow[]>(
    user,
    `crypto_positions?${buildPositionByIdSearch(user.id, id)}`,
    {
      body: JSON.stringify(toMutationPayload(normalized)),
      headers: {
        prefer: "return=representation",
      },
      method: "PATCH",
    },
    STORAGE_LABEL,
  );

  return Array.isArray(rows) && rows[0] ? toCryptoPosition(rows[0]) : null;
}

export async function archiveCryptoPosition(
  authorizationHeader: string | null,
  id: string,
): Promise<CryptoPosition | null> {
  return updateCryptoPosition(authorizationHeader, id, { status: "archived" });
}
