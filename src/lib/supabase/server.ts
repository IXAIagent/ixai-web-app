type SupabaseServerConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

export function getSupabaseServerConfig(): SupabaseServerConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey, serviceRoleKey };
}

export function isSupabaseServerConfigured(): boolean {
  return getSupabaseServerConfig() !== null;
}

export function createSupabaseServerClient() {
  const config = getSupabaseServerConfig();

  if (!config) {
    return null;
  }

  return {
    mode: "placeholder" as const,
    ...config,
  };
}

export function getSupabaseRestConfig({ write = false }: { write?: boolean } = {}) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return null;
  }

  const authKey = write ? config.serviceRoleKey : config.anonKey;

  if (!authKey) {
    return null;
  }

  return {
    restUrl: `${config.url.replace(/\/$/, "")}/rest/v1`,
    apiKey: config.anonKey,
    authKey,
  };
}
