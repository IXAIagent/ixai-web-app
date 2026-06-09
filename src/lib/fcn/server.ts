import { getSupabaseServerConfig } from "@/src/lib/supabase/server";
import { calculateFcnWorstOf } from "@/src/lib/fcn/risk";
import {
  FCN_CURRENCIES,
  FCN_STATUSES,
  type FCNCurrency,
  type FCNObservationScheduleItem,
  type FCNPosition,
  type FCNPositionCreateInput,
  type FCNPositionRow,
  type FCNPositionUpdateInput,
  type FCNStatus,
  type FCNUnderlying,
  type FCNUnderlyingInput,
  type FCNUnderlyingRow,
} from "@/src/types/fcn-position";

type SupabaseUserResponse = {
  id?: string | null;
  email?: string | null;
};

type CurrentSupabaseUser = {
  accessToken: string;
  email: string | null;
  id: string;
};

type SupabaseRestConfig = {
  anonKey: string;
  restUrl: string;
};

type FcnMutationPayload = {
  coupon_rate_pct?: number | null;
  currency?: FCNCurrency;
  issuer?: string | null;
  ki_pct?: number | null;
  ko_pct?: number | null;
  maturity_date?: string | null;
  metadata?: Record<string, unknown>;
  name?: string;
  notional_amount?: number | null;
  observation_schedule?: FCNObservationScheduleItem[];
  start_date?: string | null;
  status?: FCNStatus;
  strike_pct?: number | null;
};

export class FcnRequestError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "FcnRequestError";
    this.status = status;
    this.code = code;
  }
}

const FCN_POSITION_SELECT =
  "id,user_id,portfolio_id,name,issuer,currency,notional_amount,coupon_rate_pct,ko_pct,ki_pct,strike_pct,start_date,maturity_date,status,observation_schedule,metadata,created_at,updated_at";
const FCN_UNDERLYING_SELECT =
  "id,user_id,fcn_position_id,symbol,name,market,initial_price,current_price,ki_price,ko_price,strike_price,weight_pct,metadata,created_at,updated_at";
const NAME_MAX_LENGTH = 100;
const TEXT_MAX_LENGTH = 120;
const SYMBOL_MAX_LENGTH = 32;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getBearerToken(authorizationHeader: string | null): string | null {
  return authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? null;
}

function getRestConfig(): SupabaseRestConfig {
  const config = getSupabaseServerConfig();

  if (!config) {
    throw new FcnRequestError(503, "supabase_not_configured", "FCN storage is not configured.");
  }

  return {
    anonKey: config.anonKey,
    restUrl: `${config.url.replace(/\/$/, "")}/rest/v1`,
  };
}

function assertUuid(id: string, message = "FCN position not found.") {
  if (!UUID_PATTERN.test(id)) {
    throw new FcnRequestError(404, "not_found", message);
  }
}

function normalizeText(
  value: unknown,
  fieldName: string,
  options: { maxLength?: number; required?: boolean } = {},
) {
  const maxLength = options.maxLength ?? TEXT_MAX_LENGTH;

  if (value === undefined || value === null) {
    if (options.required) {
      throw new FcnRequestError(400, "invalid_input", `${fieldName} is required.`);
    }

    return null;
  }

  if (typeof value !== "string") {
    throw new FcnRequestError(400, "invalid_input", `${fieldName} must be text.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    if (options.required) {
      throw new FcnRequestError(400, "invalid_input", `${fieldName} is required.`);
    }

    return null;
  }

  if (normalized.length > maxLength) {
    throw new FcnRequestError(
      400,
      "invalid_input",
      `${fieldName} must be ${maxLength} characters or fewer.`,
    );
  }

  return normalized;
}

function normalizeCurrency(value: unknown, fallback: FCNCurrency = "USD") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value !== "string" || !FCN_CURRENCIES.includes(value as FCNCurrency)) {
    throw new FcnRequestError(400, "invalid_input", "currency must be USD, TWD, or USDT.");
  }

  return value as FCNCurrency;
}

function normalizeStatus(value: unknown) {
  if (typeof value !== "string" || !FCN_STATUSES.includes(value as FCNStatus)) {
    throw new FcnRequestError(
      400,
      "invalid_input",
      "status must be active, matured, called, or archived.",
    );
  }

  return value as FCNStatus;
}

function normalizeNumber(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new FcnRequestError(
      400,
      "invalid_input",
      `${fieldName} must be a non-negative number.`,
    );
  }

  return value;
}

function normalizeDate(value: unknown, fieldName: string) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw new FcnRequestError(400, "invalid_input", `${fieldName} must be YYYY-MM-DD.`);
  }

  return value;
}

function normalizeMetadata(value: unknown) {
  if (value === undefined || value === null) {
    return {};
  }

  if (!isRecord(value)) {
    throw new FcnRequestError(400, "invalid_input", "metadata must be an object.");
  }

  return value;
}

function normalizeObservationSchedule(value: unknown): FCNObservationScheduleItem[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new FcnRequestError(400, "invalid_input", "observationSchedule must be an array.");
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new FcnRequestError(
        400,
        "invalid_input",
        `observationSchedule[${index}] must be an object.`,
      );
    }

    return {
      couponPaymentDate: normalizeDate(item.couponPaymentDate, "couponPaymentDate") ?? undefined,
      observationEnd: normalizeDate(item.observationEnd, "observationEnd") ?? undefined,
      observationStart: normalizeDate(item.observationStart, "observationStart") ?? undefined,
      periodLabel: normalizeText(item.periodLabel, "periodLabel") ?? undefined,
      status: normalizeText(item.status, "status") ?? undefined,
    };
  });
}

function normalizeUnderlyingInput(input: unknown, index: number): FCNUnderlyingInput {
  if (!isRecord(input)) {
    throw new FcnRequestError(400, "invalid_input", `underlyings[${index}] must be an object.`);
  }

  return {
    currentPrice: normalizeNumber(input.currentPrice, "currentPrice"),
    initialPrice: normalizeNumber(input.initialPrice, "initialPrice"),
    kiPrice: normalizeNumber(input.kiPrice, "kiPrice"),
    koPrice: normalizeNumber(input.koPrice, "koPrice"),
    market: normalizeText(input.market, "market"),
    metadata: normalizeMetadata(input.metadata),
    name: normalizeText(input.name, "underlying name"),
    strikePrice: normalizeNumber(input.strikePrice, "strikePrice"),
    symbol:
      normalizeText(input.symbol, "symbol", {
        maxLength: SYMBOL_MAX_LENGTH,
        required: true,
      })?.toUpperCase() ?? "",
    weightPct: normalizeNumber(input.weightPct, "weightPct"),
  };
}

function normalizeCreateInput(input: unknown): FCNPositionCreateInput {
  if (!isRecord(input)) {
    throw new FcnRequestError(400, "invalid_input", "FCN payload is required.");
  }

  const portfolioId = normalizeText(input.portfolioId, "portfolioId", { required: true });

  if (!portfolioId || !UUID_PATTERN.test(portfolioId)) {
    throw new FcnRequestError(404, "portfolio_not_found", "Portfolio not found.");
  }

  return {
    couponRatePct: normalizeNumber(input.couponRatePct, "couponRatePct"),
    currency: normalizeCurrency(input.currency),
    issuer: normalizeText(input.issuer, "issuer"),
    kiPct: normalizeNumber(input.kiPct, "kiPct"),
    koPct: normalizeNumber(input.koPct, "koPct"),
    maturityDate: normalizeDate(input.maturityDate, "maturityDate"),
    metadata: normalizeMetadata(input.metadata),
    name:
      normalizeText(input.name, "FCN name", {
        maxLength: NAME_MAX_LENGTH,
        required: true,
      }) ?? "",
    notionalAmount: normalizeNumber(input.notionalAmount, "notionalAmount"),
    observationSchedule: normalizeObservationSchedule(input.observationSchedule),
    portfolioId,
    startDate: normalizeDate(input.startDate, "startDate"),
    strikePct: normalizeNumber(input.strikePct, "strikePct"),
    underlyings: Array.isArray(input.underlyings)
      ? input.underlyings.map(normalizeUnderlyingInput)
      : [],
  };
}

function normalizeUpdateInput(input: unknown): FCNPositionUpdateInput {
  if (!isRecord(input)) {
    throw new FcnRequestError(400, "invalid_input", "FCN payload is required.");
  }

  const patch: FCNPositionUpdateInput = {};

  if (input.name !== undefined) {
    patch.name =
      normalizeText(input.name, "FCN name", {
        maxLength: NAME_MAX_LENGTH,
        required: true,
      }) ?? "";
  }

  if (input.issuer !== undefined) {
    patch.issuer = normalizeText(input.issuer, "issuer");
  }

  if (input.currency !== undefined) {
    patch.currency = normalizeCurrency(input.currency);
  }

  if (input.notionalAmount !== undefined) {
    patch.notionalAmount = normalizeNumber(input.notionalAmount, "notionalAmount");
  }

  if (input.couponRatePct !== undefined) {
    patch.couponRatePct = normalizeNumber(input.couponRatePct, "couponRatePct");
  }

  if (input.koPct !== undefined) {
    patch.koPct = normalizeNumber(input.koPct, "koPct");
  }

  if (input.kiPct !== undefined) {
    patch.kiPct = normalizeNumber(input.kiPct, "kiPct");
  }

  if (input.strikePct !== undefined) {
    patch.strikePct = normalizeNumber(input.strikePct, "strikePct");
  }

  if (input.startDate !== undefined) {
    patch.startDate = normalizeDate(input.startDate, "startDate");
  }

  if (input.maturityDate !== undefined) {
    patch.maturityDate = normalizeDate(input.maturityDate, "maturityDate");
  }

  if (input.status !== undefined) {
    patch.status = normalizeStatus(input.status);
  }

  if (input.observationSchedule !== undefined) {
    patch.observationSchedule = normalizeObservationSchedule(input.observationSchedule);
  }

  if (input.metadata !== undefined) {
    patch.metadata = normalizeMetadata(input.metadata);
  }

  if (Object.keys(patch).length === 0) {
    throw new FcnRequestError(400, "invalid_input", "No FCN fields to update.");
  }

  return patch;
}

function toMutationPayload(input: FCNPositionUpdateInput): FcnMutationPayload {
  return {
    ...(input.couponRatePct !== undefined ? { coupon_rate_pct: input.couponRatePct } : {}),
    ...(input.currency !== undefined ? { currency: input.currency } : {}),
    ...(input.issuer !== undefined ? { issuer: input.issuer } : {}),
    ...(input.kiPct !== undefined ? { ki_pct: input.kiPct } : {}),
    ...(input.koPct !== undefined ? { ko_pct: input.koPct } : {}),
    ...(input.maturityDate !== undefined ? { maturity_date: input.maturityDate } : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.notionalAmount !== undefined ? { notional_amount: input.notionalAmount } : {}),
    ...(input.observationSchedule !== undefined
      ? { observation_schedule: input.observationSchedule }
      : {}),
    ...(input.startDate !== undefined ? { start_date: input.startDate } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.strikePct !== undefined ? { strike_pct: input.strikePct } : {}),
  };
}

function toUnderlying(row: FCNUnderlyingRow): FCNUnderlying {
  return {
    createdAt: row.created_at,
    currentPrice: row.current_price,
    fcnPositionId: row.fcn_position_id,
    id: row.id,
    initialPrice: row.initial_price,
    kiPrice: row.ki_price,
    koPrice: row.ko_price,
    market: row.market,
    metadata: row.metadata ?? {},
    name: row.name,
    strikePrice: row.strike_price,
    symbol: row.symbol,
    updatedAt: row.updated_at,
    userId: row.user_id,
    weightPct: row.weight_pct,
  };
}

function toPosition(row: FCNPositionRow, underlyings: FCNUnderlying[] = []): FCNPosition {
  const position = {
    couponRatePct: row.coupon_rate_pct,
    createdAt: row.created_at,
    currency: row.currency,
    id: row.id,
    issuer: row.issuer,
    kiPct: row.ki_pct,
    koPct: row.ko_pct,
    maturityDate: row.maturity_date,
    metadata: row.metadata ?? {},
    name: row.name,
    notionalAmount: row.notional_amount,
    observationSchedule: Array.isArray(row.observation_schedule)
      ? row.observation_schedule
      : [],
    portfolioId: row.portfolio_id,
    startDate: row.start_date,
    status: row.status,
    strikePct: row.strike_pct,
    underlyings,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };

  return {
    ...position,
    worstOfSummary: calculateFcnWorstOf(position),
  };
}

async function readFcnResponse(response: Response) {
  const text = await response.text().catch(() => "");

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function fcnFetch<T>(
  user: CurrentSupabaseUser,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const config = getRestConfig();
  const headers = new Headers(init.headers);

  headers.set("apikey", config.anonKey);
  headers.set("authorization", `Bearer ${user.accessToken}`);

  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${config.restUrl}/${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new FcnRequestError(401, "not_authenticated", "Sign in before managing FCNs.");
    }

    throw new FcnRequestError(502, "fcn_storage_failed", "FCN storage request failed.");
  }

  return (await readFcnResponse(response)) as T;
}

export async function getCurrentSupabaseUser(
  authorizationHeader: string | null,
): Promise<CurrentSupabaseUser> {
  const accessToken = getBearerToken(authorizationHeader);
  const config = getSupabaseServerConfig();

  if (!accessToken || !config) {
    throw new FcnRequestError(401, "not_authenticated", "Sign in before managing FCNs.");
  }

  const response = await fetch(`${config.url.replace(/\/$/, "")}/auth/v1/user`, {
    cache: "no-store",
    headers: {
      apikey: config.anonKey,
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new FcnRequestError(401, "not_authenticated", "Sign in before managing FCNs.");
  }

  const user = (await response.json().catch(() => null)) as SupabaseUserResponse | null;

  if (!user?.id) {
    throw new FcnRequestError(401, "not_authenticated", "Sign in before managing FCNs.");
  }

  return {
    accessToken,
    email: typeof user.email === "string" ? user.email : null,
    id: user.id,
  };
}

function buildPortfolioSearch(userId: string, portfolioId: string) {
  return new URLSearchParams({
    id: `eq.${portfolioId}`,
    limit: "1",
    select: "id",
    user_id: `eq.${userId}`,
  });
}

async function assertPortfolioOwnership(user: CurrentSupabaseUser, portfolioId: string) {
  assertUuid(portfolioId, "Portfolio not found.");

  const rows = await fcnFetch<Array<{ id: string }>>(
    user,
    `portfolios?${buildPortfolioSearch(user.id, portfolioId)}`,
  );

  if (!Array.isArray(rows) || !rows[0]) {
    throw new FcnRequestError(404, "portfolio_not_found", "Portfolio not found.");
  }
}

function buildPositionSearch(userId: string, options?: { portfolioId?: string }) {
  const search = new URLSearchParams({
    order: "created_at.desc",
    select: FCN_POSITION_SELECT,
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
    select: FCN_POSITION_SELECT,
    user_id: `eq.${userId}`,
  });
}

function buildUnderlyingSearch(userId: string, positionIds: string[]) {
  return new URLSearchParams({
    fcn_position_id: `in.(${positionIds.join(",")})`,
    order: "created_at.asc",
    select: FCN_UNDERLYING_SELECT,
    user_id: `eq.${userId}`,
  });
}

async function loadUnderlyings(user: CurrentSupabaseUser, positionIds: string[]) {
  if (positionIds.length === 0) {
    return new Map<string, FCNUnderlying[]>();
  }

  const rows = await fcnFetch<FCNUnderlyingRow[]>(
    user,
    `fcn_underlyings?${buildUnderlyingSearch(user.id, positionIds)}`,
  );
  const grouped = new Map<string, FCNUnderlying[]>();

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const existing = grouped.get(row.fcn_position_id) ?? [];
    existing.push(toUnderlying(row));
    grouped.set(row.fcn_position_id, existing);
  });

  return grouped;
}

export async function listFCNPositions(
  authorizationHeader: string | null,
  options?: { portfolioId?: string },
): Promise<FCNPosition[]> {
  const user = await getCurrentSupabaseUser(authorizationHeader);

  if (options?.portfolioId) {
    await assertPortfolioOwnership(user, options.portfolioId);
  }

  const rows = await fcnFetch<FCNPositionRow[]>(
    user,
    `fcn_positions?${buildPositionSearch(user.id, options)}`,
  );
  const positions = Array.isArray(rows) ? rows : [];
  const underlyingsByPosition = await loadUnderlyings(
    user,
    positions.map((position) => position.id),
  );

  return positions.map((position) =>
    toPosition(position, underlyingsByPosition.get(position.id) ?? []),
  );
}

export async function getFCNPositionById(
  authorizationHeader: string | null,
  id: string,
): Promise<FCNPosition | null> {
  assertUuid(id);

  const user = await getCurrentSupabaseUser(authorizationHeader);
  const rows = await fcnFetch<FCNPositionRow[]>(
    user,
    `fcn_positions?${buildPositionByIdSearch(user.id, id)}`,
  );
  const position = Array.isArray(rows) ? rows[0] : null;

  if (!position) {
    return null;
  }

  const underlyingsByPosition = await loadUnderlyings(user, [position.id]);

  return toPosition(position, underlyingsByPosition.get(position.id) ?? []);
}

async function insertUnderlyings(
  user: CurrentSupabaseUser,
  fcnPositionId: string,
  underlyings: FCNUnderlyingInput[],
) {
  if (underlyings.length === 0) {
    return [];
  }

  const rows = await fcnFetch<FCNUnderlyingRow[]>(user, "fcn_underlyings", {
    body: JSON.stringify(
      underlyings.map((underlying) => ({
        current_price: underlying.currentPrice ?? null,
        fcn_position_id: fcnPositionId,
        initial_price: underlying.initialPrice ?? null,
        ki_price: underlying.kiPrice ?? null,
        ko_price: underlying.koPrice ?? null,
        market: underlying.market ?? null,
        metadata: underlying.metadata ?? {},
        name: underlying.name ?? null,
        strike_price: underlying.strikePrice ?? null,
        symbol: underlying.symbol,
        user_id: user.id,
        weight_pct: underlying.weightPct ?? null,
      })),
    ),
    headers: {
      prefer: "return=representation",
    },
    method: "POST",
  });

  return (Array.isArray(rows) ? rows : []).map(toUnderlying);
}

async function deletePositionBestEffort(user: CurrentSupabaseUser, id: string) {
  await fcnFetch(user, `fcn_positions?${buildPositionByIdSearch(user.id, id)}`, {
    method: "DELETE",
  }).catch(() => null);
}

export async function createFCNPosition(
  authorizationHeader: string | null,
  input: unknown,
): Promise<FCNPosition> {
  const user = await getCurrentSupabaseUser(authorizationHeader);
  const normalized = normalizeCreateInput(input);

  await assertPortfolioOwnership(user, normalized.portfolioId);

  const rows = await fcnFetch<FCNPositionRow[]>(user, "fcn_positions", {
    body: JSON.stringify({
      coupon_rate_pct: normalized.couponRatePct ?? null,
      currency: normalized.currency,
      issuer: normalized.issuer ?? null,
      ki_pct: normalized.kiPct ?? null,
      ko_pct: normalized.koPct ?? null,
      maturity_date: normalized.maturityDate ?? null,
      metadata: normalized.metadata ?? {},
      name: normalized.name,
      notional_amount: normalized.notionalAmount ?? null,
      observation_schedule: normalized.observationSchedule ?? [],
      portfolio_id: normalized.portfolioId,
      start_date: normalized.startDate ?? null,
      status: "active",
      strike_pct: normalized.strikePct ?? null,
      user_id: user.id,
    }),
    headers: {
      prefer: "return=representation",
    },
    method: "POST",
  });
  const position = Array.isArray(rows) ? rows[0] : null;

  if (!position) {
    throw new FcnRequestError(502, "fcn_storage_failed", "FCN position could not be created.");
  }

  try {
    const underlyings = await insertUnderlyings(user, position.id, normalized.underlyings ?? []);
    return toPosition(position, underlyings);
  } catch (error) {
    await deletePositionBestEffort(user, position.id);
    throw error;
  }
}

export async function updateFCNPosition(
  authorizationHeader: string | null,
  id: string,
  input: unknown,
): Promise<FCNPosition | null> {
  assertUuid(id);

  const user = await getCurrentSupabaseUser(authorizationHeader);
  const normalized = normalizeUpdateInput(input);
  const rows = await fcnFetch<FCNPositionRow[]>(
    user,
    `fcn_positions?${buildPositionByIdSearch(user.id, id)}`,
    {
      body: JSON.stringify(toMutationPayload(normalized)),
      headers: {
        prefer: "return=representation",
      },
      method: "PATCH",
    },
  );
  const position = Array.isArray(rows) ? rows[0] : null;

  if (!position) {
    return null;
  }

  const underlyingsByPosition = await loadUnderlyings(user, [position.id]);

  return toPosition(position, underlyingsByPosition.get(position.id) ?? []);
}

export async function archiveFCNPosition(
  authorizationHeader: string | null,
  id: string,
): Promise<FCNPosition | null> {
  return updateFCNPosition(authorizationHeader, id, { status: "archived" });
}
