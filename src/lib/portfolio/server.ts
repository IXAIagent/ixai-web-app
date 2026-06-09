import { getSupabaseServerConfig } from "@/src/lib/supabase/server";
import {
  PORTFOLIO_BASE_CURRENCIES,
  PORTFOLIO_STATUSES,
  type BaseCurrency,
  type Portfolio,
  type PortfolioCreateInput,
  type PortfolioRow,
  type PortfolioStatus,
  type PortfolioUpdateInput,
} from "@/src/types/portfolio";

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

type PortfolioMutationPayload = {
  base_currency?: BaseCurrency;
  description?: string | null;
  name?: string;
  status?: PortfolioStatus;
};

export class PortfolioRequestError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "PortfolioRequestError";
    this.status = status;
    this.code = code;
  }
}

const PORTFOLIO_SELECT =
  "id,user_id,name,base_currency,description,status,created_at,updated_at";
const NAME_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 500;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getBearerToken(authorizationHeader: string | null): string | null {
  return authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? null;
}

function getRestConfig(): SupabaseRestConfig {
  const config = getSupabaseServerConfig();

  if (!config) {
    throw new PortfolioRequestError(
      503,
      "supabase_not_configured",
      "Portfolio storage is not configured.",
    );
  }

  return {
    anonKey: config.anonKey,
    restUrl: `${config.url.replace(/\/$/, "")}/rest/v1`,
  };
}

function assertPortfolioId(id: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new PortfolioRequestError(404, "not_found", "Portfolio not found.");
  }
}

function normalizeOptionalText(value: unknown, maxLength: number, fieldName: string) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw new PortfolioRequestError(400, "invalid_input", `${fieldName} must be text.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.length > maxLength) {
    throw new PortfolioRequestError(
      400,
      "invalid_input",
      `${fieldName} must be ${maxLength} characters or fewer.`,
    );
  }

  return normalized;
}

function normalizeRequiredName(value: unknown) {
  if (typeof value !== "string") {
    throw new PortfolioRequestError(400, "invalid_input", "Portfolio name is required.");
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new PortfolioRequestError(400, "invalid_input", "Portfolio name is required.");
  }

  if (normalized.length > NAME_MAX_LENGTH) {
    throw new PortfolioRequestError(
      400,
      "invalid_input",
      `Portfolio name must be ${NAME_MAX_LENGTH} characters or fewer.`,
    );
  }

  return normalized;
}

function normalizeBaseCurrency(value: unknown, fallback: BaseCurrency = "USD") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (
    typeof value !== "string" ||
    !PORTFOLIO_BASE_CURRENCIES.includes(value as BaseCurrency)
  ) {
    throw new PortfolioRequestError(
      400,
      "invalid_input",
      "baseCurrency must be USD, TWD, or USDT.",
    );
  }

  return value as BaseCurrency;
}

function normalizeStatus(value: unknown) {
  if (
    typeof value !== "string" ||
    !PORTFOLIO_STATUSES.includes(value as PortfolioStatus)
  ) {
    throw new PortfolioRequestError(
      400,
      "invalid_input",
      "status must be active or archived.",
    );
  }

  return value as PortfolioStatus;
}

function normalizeCreateInput(input: unknown): PortfolioCreateInput {
  if (!isRecord(input)) {
    throw new PortfolioRequestError(400, "invalid_input", "Portfolio payload is required.");
  }

  return {
    baseCurrency: normalizeBaseCurrency(input.baseCurrency),
    description: normalizeOptionalText(input.description, DESCRIPTION_MAX_LENGTH, "description"),
    name: normalizeRequiredName(input.name),
  };
}

function normalizeUpdateInput(input: unknown): PortfolioUpdateInput {
  if (!isRecord(input)) {
    throw new PortfolioRequestError(400, "invalid_input", "Portfolio payload is required.");
  }

  const patch: PortfolioUpdateInput = {};

  if (input.name !== undefined) {
    patch.name = normalizeRequiredName(input.name);
  }

  if (input.baseCurrency !== undefined) {
    patch.baseCurrency = normalizeBaseCurrency(input.baseCurrency);
  }

  if (input.description !== undefined) {
    patch.description = normalizeOptionalText(
      input.description,
      DESCRIPTION_MAX_LENGTH,
      "description",
    );
  }

  if (input.status !== undefined) {
    patch.status = normalizeStatus(input.status);
  }

  if (Object.keys(patch).length === 0) {
    throw new PortfolioRequestError(400, "invalid_input", "No portfolio fields to update.");
  }

  return patch;
}

function toMutationPayload(input: PortfolioUpdateInput): PortfolioMutationPayload {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.baseCurrency !== undefined ? { base_currency: input.baseCurrency } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  };
}

function toPortfolio(row: PortfolioRow): Portfolio {
  return {
    baseCurrency: row.base_currency,
    createdAt: row.created_at,
    description: row.description,
    id: row.id,
    name: row.name,
    status: row.status,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

function buildPortfolioSearch(userId: string, options?: { includeArchived?: boolean }) {
  const search = new URLSearchParams({
    order: "created_at.desc",
    select: PORTFOLIO_SELECT,
    user_id: `eq.${userId}`,
  });

  if (!options?.includeArchived) {
    search.set("status", "eq.active");
  }

  return search;
}

function buildPortfolioByIdSearch(userId: string, id: string) {
  return new URLSearchParams({
    id: `eq.${id}`,
    limit: "1",
    select: PORTFOLIO_SELECT,
    user_id: `eq.${userId}`,
  });
}

async function readPortfolioResponse(response: Response) {
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

async function portfolioFetch<T>(
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
      throw new PortfolioRequestError(
        401,
        "not_authenticated",
        "Sign in before managing portfolios.",
      );
    }

    throw new PortfolioRequestError(
      502,
      "portfolio_storage_failed",
      "Portfolio storage request failed.",
    );
  }

  return (await readPortfolioResponse(response)) as T;
}

export async function getCurrentSupabaseUser(
  authorizationHeader: string | null,
): Promise<CurrentSupabaseUser> {
  const accessToken = getBearerToken(authorizationHeader);
  const config = getSupabaseServerConfig();

  if (!accessToken || !config) {
    throw new PortfolioRequestError(
      401,
      "not_authenticated",
      "Sign in before managing portfolios.",
    );
  }

  const response = await fetch(`${config.url.replace(/\/$/, "")}/auth/v1/user`, {
    cache: "no-store",
    headers: {
      apikey: config.anonKey,
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new PortfolioRequestError(
      401,
      "not_authenticated",
      "Sign in before managing portfolios.",
    );
  }

  const user = (await response.json().catch(() => null)) as SupabaseUserResponse | null;

  if (!user?.id) {
    throw new PortfolioRequestError(
      401,
      "not_authenticated",
      "Sign in before managing portfolios.",
    );
  }

  return {
    accessToken,
    email: typeof user.email === "string" ? user.email : null,
    id: user.id,
  };
}

export async function listPortfolios(
  authorizationHeader: string | null,
  options?: { includeArchived?: boolean },
): Promise<Portfolio[]> {
  const user = await getCurrentSupabaseUser(authorizationHeader);
  const rows = await portfolioFetch<PortfolioRow[]>(
    user,
    `portfolios?${buildPortfolioSearch(user.id, options)}`,
  );

  return Array.isArray(rows) ? rows.map(toPortfolio) : [];
}

export async function getPortfolioById(
  authorizationHeader: string | null,
  id: string,
): Promise<Portfolio | null> {
  assertPortfolioId(id);

  const user = await getCurrentSupabaseUser(authorizationHeader);
  const rows = await portfolioFetch<PortfolioRow[]>(
    user,
    `portfolios?${buildPortfolioByIdSearch(user.id, id)}`,
  );

  return Array.isArray(rows) && rows[0] ? toPortfolio(rows[0]) : null;
}

export async function createPortfolio(
  authorizationHeader: string | null,
  input: unknown,
): Promise<Portfolio> {
  const user = await getCurrentSupabaseUser(authorizationHeader);
  const normalized = normalizeCreateInput(input);
  const rows = await portfolioFetch<PortfolioRow[]>(user, "portfolios", {
    body: JSON.stringify({
      base_currency: normalized.baseCurrency,
      description: normalized.description ?? null,
      name: normalized.name,
      status: "active",
      user_id: user.id,
    }),
    headers: {
      prefer: "return=representation",
    },
    method: "POST",
  });

  if (!Array.isArray(rows) || !rows[0]) {
    throw new PortfolioRequestError(
      502,
      "portfolio_storage_failed",
      "Portfolio could not be created.",
    );
  }

  return toPortfolio(rows[0]);
}

export async function updatePortfolio(
  authorizationHeader: string | null,
  id: string,
  input: unknown,
): Promise<Portfolio | null> {
  assertPortfolioId(id);

  const user = await getCurrentSupabaseUser(authorizationHeader);
  const normalized = normalizeUpdateInput(input);
  const rows = await portfolioFetch<PortfolioRow[]>(
    user,
    `portfolios?${buildPortfolioByIdSearch(user.id, id)}`,
    {
      body: JSON.stringify(toMutationPayload(normalized)),
      headers: {
        prefer: "return=representation",
      },
      method: "PATCH",
    },
  );

  return Array.isArray(rows) && rows[0] ? toPortfolio(rows[0]) : null;
}

export async function archivePortfolio(
  authorizationHeader: string | null,
  id: string,
): Promise<Portfolio | null> {
  return updatePortfolio(authorizationHeader, id, { status: "archived" });
}
