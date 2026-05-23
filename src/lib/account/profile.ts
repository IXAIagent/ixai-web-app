import {
  getSupabaseAccessToken,
  getSupabaseClientConfig,
} from "@/src/lib/supabase/client";
import type { IXAISession } from "@/src/types/identity";

export type IxaiUserProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  phone: string | null;
  source: string;
  proInterest: boolean;
  onboardingCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type IxaiUserProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  phone: string | null;
  source: string | null;
  pro_interest: boolean | null;
  onboarding_completed: boolean | null;
  created_at?: string;
  updated_at?: string;
};

type SaveProfileInput = {
  displayName: string;
  phone: string;
  proInterest: boolean;
};

function toProfile(row: IxaiUserProfileRow): IxaiUserProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    phone: row.phone,
    source: row.source ?? "public_app",
    proInterest: Boolean(row.pro_interest),
    onboardingCompleted: Boolean(row.onboarding_completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function profileHeaders() {
  const config = getSupabaseClientConfig();
  const accessToken = await getSupabaseAccessToken();

  if (!config || !accessToken) {
    return null;
  }

  return {
    apikey: config.anonKey,
    authorization: `Bearer ${accessToken}`,
    "content-type": "application/json",
  };
}

export async function bootstrapUserProfile(session: IXAISession) {
  if (session.mode !== "authenticated" || !session.user?.id) {
    return;
  }

  const config = getSupabaseClientConfig();
  const headers = await profileHeaders();

  if (!config || !headers) {
    return;
  }

  try {
    const response = await fetch(`${config.url}/rest/v1/ixai_user_profiles?on_conflict=id`, {
      method: "POST",
      headers: {
        ...headers,
        prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        id: session.user.id,
        email: session.user.email ?? null,
        source: "public_app",
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Profile bootstrap failed with status ${response.status}`);
    }
  } catch (error) {
    console.warn("[IXAI PROFILE] bootstrap failed", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
  }
}

export async function loadUserProfile(session: IXAISession): Promise<IxaiUserProfile | null> {
  if (session.mode !== "authenticated" || !session.user?.id) {
    return null;
  }

  const config = getSupabaseClientConfig();
  const headers = await profileHeaders();

  if (!config || !headers) {
    return null;
  }

  try {
    const query = new URLSearchParams({
      id: `eq.${session.user.id}`,
      select: "id,email,display_name,phone,source,pro_interest,onboarding_completed,created_at,updated_at",
      limit: "1",
    });
    const response = await fetch(`${config.url}/rest/v1/ixai_user_profiles?${query.toString()}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Profile load failed with status ${response.status}`);
    }

    const rows = await response.json() as IxaiUserProfileRow[];

    if (rows[0]) {
      return toProfile(rows[0]);
    }

    await bootstrapUserProfile(session);
    return {
      id: session.user.id,
      email: session.user.email ?? null,
      displayName: session.user.name ?? null,
      phone: null,
      source: "public_app",
      proInterest: false,
      onboardingCompleted: false,
    };
  } catch (error) {
    console.warn("[IXAI PROFILE] load failed", {
      message: error instanceof Error ? error.message : "unknown_error",
    });
    return null;
  }
}

export async function saveUserProfile(
  session: IXAISession,
  input: SaveProfileInput,
): Promise<{ ok: boolean; profile?: IxaiUserProfile; message: string }> {
  if (session.mode !== "authenticated" || !session.user?.id) {
    return {
      ok: false,
      message: "請先登入 IXAI Account。",
    };
  }

  const config = getSupabaseClientConfig();
  const headers = await profileHeaders();

  if (!config || !headers) {
    return {
      ok: false,
      message: "IXAI Account profile sync 尚未設定。",
    };
  }

  try {
    const response = await fetch(`${config.url}/rest/v1/ixai_user_profiles?on_conflict=id`, {
      method: "POST",
      headers: {
        ...headers,
        prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        id: session.user.id,
        email: session.user.email ?? null,
        display_name: input.displayName.trim() || null,
        phone: input.phone.trim() || null,
        source: "public_app",
        pro_interest: input.proInterest,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Profile save failed with status ${response.status}`);
    }

    const rows = await response.json() as IxaiUserProfileRow[];

    return {
      ok: true,
      profile: rows[0] ? toProfile(rows[0]) : undefined,
      message: "基本資料已更新。",
    };
  } catch (error) {
    console.warn("[IXAI PROFILE] save failed", {
      message: error instanceof Error ? error.message : "unknown_error",
    });

    return {
      ok: false,
      message: "目前無法更新基本資料，請稍後再試。",
    };
  }
}
