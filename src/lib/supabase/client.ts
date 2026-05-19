type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export function getSupabaseClientConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseClientConfigured(): boolean {
  return getSupabaseClientConfig() !== null;
}

export function createSupabaseBrowserClient() {
  const config = getSupabaseClientConfig();

  if (!config) {
    return null;
  }

  return {
    mode: "placeholder" as const,
    ...config,
  };
}
