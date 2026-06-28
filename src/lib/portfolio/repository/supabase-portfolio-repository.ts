import type { SupabaseClient } from "@supabase/supabase-js";

import type { PortfolioAccount } from "@/src/lib/portfolio/data-model/portfolio-account-types";
import type { PortfolioAsset } from "@/src/lib/portfolio/data-model/portfolio-asset-types";
import type { PortfolioPosition } from "@/src/lib/portfolio/data-model/portfolio-position-types";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";
import type { PortfolioRepository } from "@/src/lib/portfolio/repository/portfolio-repository";
import type { PortfolioAssetCreateInput } from "@/src/lib/portfolio/repository/portfolio-asset-repository";
import {
  createAuthenticatedReadGate,
  isPrivateTableTemporarilyDisabled,
  isSupabaseUnauthorizedError,
  markPrivateTableUnauthorized,
  type AuthenticatedSupabaseReadState,
} from "@/src/lib/workspace/runtime-safety/authenticated-supabase";
import { logWorkspaceRuntimeWarning } from "@/src/lib/workspace/runtime-safety/runtime-logger";

type PortfolioAccountRow = {
  account_type: PortfolioAccount["accountType"];
  created_at: string;
  currency: string;
  id: string;
  is_active: boolean;
  name: string;
  provider: PortfolioAccount["provider"];
  region: PortfolioAccount["region"];
  updated_at: string;
  user_id: string;
};

type PortfolioAssetRow = {
  account_id: string;
  category: PortfolioAsset["category"];
  created_at: string;
  currency: string;
  id: string;
  metadata: PortfolioAsset["metadata"];
  name: string;
  region: PortfolioAsset["region"];
  symbol: string;
  updated_at: string;
  user_id: string;
};

type PortfolioPositionRow = {
  asset_id: string;
  cost_basis: number | null;
  created_at: string;
  id: string;
  market_value: number | null;
  quantity: number;
  unrealized_pnl: number | null;
  unrealized_pnl_pct: number | null;
  updated_at: string;
  user_id: string;
};

async function getSupabaseOrThrow(): Promise<{
  supabase: SupabaseClient;
  userId: string;
}> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase client is not configured");
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.id) {
    throw new Error("Authentication required");
  }

  return {
    supabase,
    userId: data.user.id,
  };
}

async function getSupabaseReadContext(): Promise<{
  authState: AuthenticatedSupabaseReadState;
  supabase: SupabaseClient;
  userId: string;
}> {
  const supabase = createSupabaseBrowserClient();
  const authState = await createAuthenticatedReadGate();

  if (!supabase || !authState.accessToken || !authState.userId) {
    throw new Error("Authentication required");
  }

  return {
    authState,
    supabase,
    userId: authState.userId,
  };
}

function handleRepositoryReadError(
  tableName: string,
  error: unknown,
  authState: AuthenticatedSupabaseReadState,
) {
  if (isSupabaseUnauthorizedError(error)) {
    markPrivateTableUnauthorized(tableName, "supabase_repository_unauthorized", authState);
    return;
  }

  logWorkspaceRuntimeWarning("portfolio-repository-read-fallback", error, { tableName });
}

function mapAccount(row: PortfolioAccountRow): PortfolioAccount {
  return {
    accountType: row.account_type,
    createdAt: row.created_at,
    currency: row.currency,
    id: row.id,
    isActive: row.is_active,
    name: row.name,
    provider: row.provider,
    region: row.region,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

function mapAsset(row: PortfolioAssetRow): PortfolioAsset {
  return {
    accountId: row.account_id,
    category: row.category,
    createdAt: row.created_at,
    currency: row.currency,
    id: row.id,
    metadata: row.metadata ?? {},
    name: row.name,
    region: row.region,
    symbol: row.symbol,
    updatedAt: row.updated_at,
  };
}

function mapPosition(row: PortfolioPositionRow): PortfolioPosition {
  return {
    assetId: row.asset_id,
    costBasis: row.cost_basis,
    createdAt: row.created_at,
    id: row.id,
    marketValue: row.market_value,
    quantity: row.quantity,
    unrealizedPnl: row.unrealized_pnl,
    unrealizedPnlPct: row.unrealized_pnl_pct,
    updatedAt: row.updated_at,
  };
}

function buildSymbol(input: PortfolioAssetCreateInput): string {
  const source = input.symbol || input.name;
  return source.trim().toUpperCase().replace(/\s+/g, "-");
}

async function ensureManualAccount(): Promise<{
  accountId: string;
  supabase: SupabaseClient;
  userId: string;
}> {
  const { supabase, userId } = await getSupabaseOrThrow();

  const { data: existingAccount, error: existingError } = await supabase
    .from("portfolio_accounts")
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "MANUAL")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error("Unable to read portfolio account");
  }

  if (existingAccount?.id) {
    return {
      accountId: existingAccount.id,
      supabase,
      userId,
    };
  }

  const { data: createdAccount, error: createError } = await supabase
    .from("portfolio_accounts")
    .insert({
      account_type: "manual",
      currency: "USD",
      is_active: true,
      name: "Manual Portfolio Account",
      provider: "MANUAL",
      region: "GLOBAL",
      user_id: userId,
    })
    .select("id")
    .single();

  if (createError || !createdAccount?.id) {
    throw new Error("Unable to create portfolio account");
  }

  return {
    accountId: createdAccount.id,
    supabase,
    userId,
  };
}

export const supabasePortfolioRepository: PortfolioRepository = {
  async createAsset(input) {
    const { accountId, supabase, userId } = await ensureManualAccount();

    const { data, error } = await supabase
      .from("portfolio_assets")
      .insert({
        account_id: accountId,
        category: input.category,
        currency: input.currency,
        metadata: input.metadata ?? {},
        name: input.name,
        region: input.region,
        symbol: buildSymbol(input),
        user_id: userId,
      })
      .select(
        "id,user_id,account_id,symbol,name,category,region,currency,metadata,created_at,updated_at",
      )
      .single();

    if (error || !data) {
      throw new Error("Unable to create portfolio asset");
    }

    return mapAsset(data as PortfolioAssetRow);
  },

  async createPosition() {
    throw new Error("Not implemented");
  },

  async deleteAsset() {
    throw new Error("Not implemented");
  },

  async deletePosition() {
    throw new Error("Not implemented");
  },

  async getAccounts() {
    const { authState, supabase, userId } = await getSupabaseReadContext();

    if (isPrivateTableTemporarilyDisabled("portfolio_accounts", authState)) {
      return [];
    }

    const { data, error } = await supabase
      .from("portfolio_accounts")
      .select(
        "id,user_id,name,provider,region,account_type,currency,is_active,created_at,updated_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      handleRepositoryReadError("portfolio_accounts", error, authState);
      return [];
    }

    return ((data ?? []) as PortfolioAccountRow[]).map(mapAccount);
  },

  async getAssets() {
    const { authState, supabase, userId } = await getSupabaseReadContext();

    if (isPrivateTableTemporarilyDisabled("portfolio_assets", authState)) {
      return [];
    }

    const { data, error } = await supabase
      .from("portfolio_assets")
      .select(
        "id,user_id,account_id,symbol,name,category,region,currency,metadata,created_at,updated_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      handleRepositoryReadError("portfolio_assets", error, authState);
      return [];
    }

    return ((data ?? []) as PortfolioAssetRow[]).map(mapAsset);
  },

  async getOwnershipValidationStatus() {
    const { authState, supabase, userId } = await getSupabaseReadContext();

    if (
      isPrivateTableTemporarilyDisabled("portfolio_accounts", authState) ||
      isPrivateTableTemporarilyDisabled("portfolio_assets", authState) ||
      isPrivateTableTemporarilyDisabled("portfolio_positions", authState)
    ) {
      return {
        accountCount: 0,
        assetCount: 0,
        currentAccountId: null,
        currentUserId: userId,
        positionCount: 0,
        repositorySource: "supabase_repository",
        rlsStatus: "unauthenticated",
      };
    }

    const [accountsResult, assetsResult, positionsResult] = await Promise.all([
      supabase
        .from("portfolio_accounts")
        .select("id", { count: "exact", head: false })
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1),
      supabase
        .from("portfolio_assets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("portfolio_positions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    if (accountsResult.error || assetsResult.error || positionsResult.error) {
      if (accountsResult.error) {
        handleRepositoryReadError("portfolio_accounts", accountsResult.error, authState);
      }
      if (assetsResult.error) {
        handleRepositoryReadError("portfolio_assets", assetsResult.error, authState);
      }
      if (positionsResult.error) {
        handleRepositoryReadError("portfolio_positions", positionsResult.error, authState);
      }

      return {
        accountCount: 0,
        assetCount: 0,
        currentAccountId: null,
        currentUserId: userId,
        positionCount: 0,
        repositorySource: "supabase_repository",
        rlsStatus: "unauthenticated",
      };
    }

    return {
      accountCount: accountsResult.count ?? 0,
      assetCount: assetsResult.count ?? 0,
      currentAccountId: accountsResult.data?.[0]?.id ?? null,
      currentUserId: userId,
      positionCount: positionsResult.count ?? 0,
      repositorySource: "supabase_repository",
      rlsStatus: "owner_scoped",
    };
  },

  async getPositions() {
    const { authState, supabase, userId } = await getSupabaseReadContext();

    if (isPrivateTableTemporarilyDisabled("portfolio_positions", authState)) {
      return [];
    }

    const { data, error } = await supabase
      .from("portfolio_positions")
      .select(
        "id,user_id,asset_id,quantity,cost_basis,market_value,unrealized_pnl,unrealized_pnl_pct,created_at,updated_at",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      handleRepositoryReadError("portfolio_positions", error, authState);
      return [];
    }

    return ((data ?? []) as PortfolioPositionRow[]).map(mapPosition);
  },

  async updateAsset() {
    throw new Error("Not implemented");
  },

  async updatePosition() {
    throw new Error("Not implemented");
  },
};
