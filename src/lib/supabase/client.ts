import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  url: string;
  anonKey: string;
};

let browserClient: SupabaseClient | null = null;

const supabaseSessionStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") {
      return null;
    }

    return window.sessionStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(key, value);
  },
  removeItem(key: string) {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.removeItem(key);
  },
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

  if (browserClient) {
    return browserClient;
  }

  browserClient = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storage: supabaseSessionStorage,
    },
  });

  return browserClient;
}

export async function getSupabaseAccessToken() {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    return null;
  }

  return data.session.access_token;
}
