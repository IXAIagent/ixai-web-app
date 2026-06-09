import { getSupabaseServerConfig } from "@/src/lib/supabase/server";

type SupabaseUserResponse = {
  id?: string | null;
  email?: string | null;
};

export type CurrentSupabaseUser = {
  accessToken: string;
  email: string | null;
  id: string;
};

type SupabaseRestConfig = {
  anonKey: string;
  restUrl: string;
};

export class PositionRequestError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "PositionRequestError";
    this.status = status;
    this.code = code;
  }
}

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getBearerToken(authorizationHeader: string | null): string | null {
  return authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? null;
}

function getRestConfig(storageLabel: string): SupabaseRestConfig {
  const config = getSupabaseServerConfig();

  if (!config) {
    throw new PositionRequestError(
      503,
      "supabase_not_configured",
      `${storageLabel} storage is not configured.`,
    );
  }

  return {
    anonKey: config.anonKey,
    restUrl: `${config.url.replace(/\/$/, "")}/rest/v1`,
  };
}

export function assertUuid(id: string, message: string) {
  if (!UUID_PATTERN.test(id)) {
    throw new PositionRequestError(404, "not_found", message);
  }
}

export function normalizeText(
  value: unknown,
  fieldName: string,
  options: { maxLength?: number; required?: boolean; uppercase?: boolean } = {},
): string | null {
  const maxLength = options.maxLength ?? 120;

  if (value === undefined || value === null) {
    if (options.required) {
      throw new PositionRequestError(400, "invalid_input", `${fieldName} is required.`);
    }

    return null;
  }

  if (typeof value !== "string") {
    throw new PositionRequestError(400, "invalid_input", `${fieldName} must be text.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    if (options.required) {
      throw new PositionRequestError(400, "invalid_input", `${fieldName} is required.`);
    }

    return null;
  }

  if (normalized.length > maxLength) {
    throw new PositionRequestError(
      400,
      "invalid_input",
      `${fieldName} must be ${maxLength} characters or fewer.`,
    );
  }

  return options.uppercase ? normalized.toUpperCase() : normalized;
}

export function normalizeNumber(
  value: unknown,
  fieldName: string,
  fallback?: number,
): number | null {
  if (value === undefined || value === null || value === "") {
    return fallback ?? null;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new PositionRequestError(
      400,
      "invalid_input",
      `${fieldName} must be a non-negative number.`,
    );
  }

  return value;
}

export function normalizeInteger(value: unknown, fieldName: string): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new PositionRequestError(
      400,
      "invalid_input",
      `${fieldName} must be a non-negative integer.`,
    );
  }

  return value;
}

export function normalizeDate(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    throw new PositionRequestError(400, "invalid_input", `${fieldName} must be YYYY-MM-DD.`);
  }

  return value;
}

export function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (value === undefined || value === null) {
    return {};
  }

  if (!isRecord(value)) {
    throw new PositionRequestError(400, "invalid_input", "metadata must be an object.");
  }

  return value;
}

export function normalizeEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fieldName: string,
  fallback?: T,
): T {
  if (value === undefined || value === null || value === "") {
    if (fallback !== undefined) {
      return fallback;
    }

    throw new PositionRequestError(400, "invalid_input", `${fieldName} is required.`);
  }

  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new PositionRequestError(
      400,
      "invalid_input",
      `${fieldName} must be one of: ${allowed.join(", ")}.`,
    );
  }

  return value as T;
}

async function readPositionResponse(response: Response) {
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

export async function positionFetch<T>(
  user: CurrentSupabaseUser,
  path: string,
  init: RequestInit = {},
  storageLabel = "Position",
): Promise<T> {
  const config = getRestConfig(storageLabel);
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
      throw new PositionRequestError(
        401,
        "not_authenticated",
        `Sign in before managing ${storageLabel.toLowerCase()} positions.`,
      );
    }

    throw new PositionRequestError(
      502,
      "position_storage_failed",
      `${storageLabel} storage request failed.`,
    );
  }

  return (await readPositionResponse(response)) as T;
}

export async function getCurrentSupabaseUser(
  authorizationHeader: string | null,
  storageLabel = "Position",
): Promise<CurrentSupabaseUser> {
  const accessToken = getBearerToken(authorizationHeader);
  const config = getSupabaseServerConfig();

  if (!accessToken || !config) {
    throw new PositionRequestError(
      401,
      "not_authenticated",
      `Sign in before managing ${storageLabel.toLowerCase()} positions.`,
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
    throw new PositionRequestError(
      401,
      "not_authenticated",
      `Sign in before managing ${storageLabel.toLowerCase()} positions.`,
    );
  }

  const user = (await response.json().catch(() => null)) as SupabaseUserResponse | null;

  if (!user?.id) {
    throw new PositionRequestError(
      401,
      "not_authenticated",
      `Sign in before managing ${storageLabel.toLowerCase()} positions.`,
    );
  }

  return {
    accessToken,
    email: typeof user.email === "string" ? user.email : null,
    id: user.id,
  };
}

export async function assertPortfolioOwnership(
  user: CurrentSupabaseUser,
  portfolioId: string,
  storageLabel = "Position",
) {
  assertUuid(portfolioId, "Portfolio not found.");

  const search = new URLSearchParams({
    id: `eq.${portfolioId}`,
    limit: "1",
    select: "id",
    user_id: `eq.${user.id}`,
  });
  const rows = await positionFetch<Array<{ id: string }>>(
    user,
    `portfolios?${search}`,
    {},
    storageLabel,
  );

  if (!Array.isArray(rows) || !rows[0]) {
    throw new PositionRequestError(404, "portfolio_not_found", "Portfolio not found.");
  }
}
