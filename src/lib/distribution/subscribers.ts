type PersistenceMode = "supabase" | "memory";

export type SubscriberStatus = "active" | "unsubscribed" | "bounced" | "complained";

export type SubscriberInput = {
  email: string;
  surface?: string;
  path?: string;
  attribution?: Record<string, string>;
  metadata?: Record<string, string>;
  userAgent?: string;
  referrer?: string;
};

export type SavedSubscriber = {
  email: string;
  status: SubscriberStatus;
  persistence: PersistenceMode;
};

export type SubscriberStats = {
  persistence: PersistenceMode;
  configured: boolean;
  activeSubscribers: number;
  totalCaptured: number;
  last7DaysCaptures: number;
  topSurfaces: { label: string; count: number }[];
  topUtmSources: { label: string; count: number }[];
};

type SubscriberRecord = {
  id?: string;
  email: string;
  normalized_email: string;
  status: SubscriberStatus;
  source_surface?: string | null;
  source_path?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
  created_at?: string;
  updated_at: string;
  last_subscribed_at: string;
  metadata: Record<string, string>;
};

const TABLE_NAME = "ixai_distribution_subscribers";
const SUPABASE_TIMEOUT_MS = 6000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MEMORY_RECORDS = 500;

let memorySubscribers: SubscriberRecord[] = [];

function getDistributionSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    restUrl: `${url.replace(/\/$/, "")}/rest/v1`,
    serviceRoleKey,
  };
}

function sanitize(value: unknown, maxLength = 220): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || undefined;
}

function pickAttribution(attribution: Record<string, string> | undefined, key: string) {
  return sanitize(attribution?.[key], 160);
}

function toMetadata(input: SubscriberInput) {
  const metadata: Record<string, string> = {};

  for (const [key, value] of Object.entries(input.attribution ?? {})) {
    const cleanKey = key.trim().slice(0, 48);
    const cleanValue = sanitize(value, 220);

    if (cleanKey && cleanValue) {
      metadata[cleanKey] = cleanValue;
    }
  }

  for (const [key, value] of Object.entries(input.metadata ?? {})) {
    const cleanKey = key.trim().slice(0, 48);
    const cleanValue = sanitize(value, 220);

    if (cleanKey && cleanValue) {
      metadata[cleanKey] = cleanValue;
    }
  }

  return metadata;
}

function buildRecord(input: SubscriberInput, existing?: SubscriberRecord): SubscriberRecord {
  const now = new Date().toISOString();
  const normalizedEmail = normalizeEmail(input.email);
  const metadata = {
    ...(existing?.metadata ?? {}),
    ...toMetadata(input),
  };
  const referrer = sanitize(input.referrer, 300) ?? pickAttribution(input.attribution, "referrer");

  return {
    email: input.email.trim(),
    normalized_email: normalizedEmail,
    status: "active",
    source_surface: sanitize(input.surface, 80) ?? existing?.source_surface ?? null,
    source_path:
      sanitize(input.path, 240) ??
      pickAttribution(input.attribution, "landing_path") ??
      existing?.source_path ??
      null,
    utm_source: pickAttribution(input.attribution, "utm_source") ?? existing?.utm_source ?? null,
    utm_medium: pickAttribution(input.attribution, "utm_medium") ?? existing?.utm_medium ?? null,
    utm_campaign: pickAttribution(input.attribution, "utm_campaign") ?? existing?.utm_campaign ?? null,
    utm_content: pickAttribution(input.attribution, "utm_content") ?? existing?.utm_content ?? null,
    utm_term: pickAttribution(input.attribution, "utm_term") ?? existing?.utm_term ?? null,
    referrer: referrer ?? existing?.referrer ?? null,
    user_agent: sanitize(input.userAgent, 500) ?? existing?.user_agent ?? null,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    last_subscribed_at: now,
    metadata,
  };
}

async function supabaseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getDistributionSupabaseConfig();

  if (!config) {
    throw new Error("distribution_supabase_not_configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.restUrl}/${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        apikey: config.serviceRoleKey,
        authorization: `Bearer ${config.serviceRoleKey}`,
        "content-type": "application/json",
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`distribution_supabase_failed:${response.status}:${body.slice(0, 160)}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function findSupabaseSubscriber(normalizedEmail: string) {
  const records = await supabaseFetch<SubscriberRecord[]>(
    `${TABLE_NAME}?select=*&normalized_email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
  );

  return records[0];
}

function saveSubscriberToMemory(input: SubscriberInput): SavedSubscriber {
  const normalizedEmail = normalizeEmail(input.email);
  const existing = memorySubscribers.find((record) => record.normalized_email === normalizedEmail);
  const next = buildRecord(input, existing);

  memorySubscribers = [
    next,
    ...memorySubscribers.filter((record) => record.normalized_email !== normalizedEmail),
  ].slice(0, MAX_MEMORY_RECORDS);

  return {
    email: next.normalized_email,
    status: next.status,
    persistence: "memory",
  };
}

function countBy(records: SubscriberRecord[], selector: (record: SubscriberRecord) => string | null | undefined) {
  const counts = new Map<string, number>();

  for (const record of records) {
    const label = selector(record)?.trim();

    if (!label) {
      continue;
    }

    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function toStats(records: SubscriberRecord[], persistence: PersistenceMode, configured: boolean): SubscriberStats {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return {
    persistence,
    configured,
    activeSubscribers: records.filter((record) => record.status === "active").length,
    totalCaptured: records.length,
    last7DaysCaptures: records.filter((record) => {
      const value = new Date(record.last_subscribed_at ?? record.created_at ?? 0).getTime();
      return Number.isFinite(value) && value >= sevenDaysAgo;
    }).length,
    topSurfaces: countBy(records, (record) => record.source_surface),
    topUtmSources: countBy(records, (record) => record.utm_source),
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string) {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

export function isDistributionSupabaseConfigured() {
  return Boolean(getDistributionSupabaseConfig());
}

export async function saveSubscriber(input: SubscriberInput): Promise<SavedSubscriber> {
  if (!validateEmail(input.email)) {
    throw new Error("invalid_email");
  }

  if (!isDistributionSupabaseConfigured()) {
    return saveSubscriberToMemory(input);
  }

  const normalizedEmail = normalizeEmail(input.email);
  const existing = await findSupabaseSubscriber(normalizedEmail);
  const record = buildRecord(input, existing);
  const saved = await supabaseFetch<SubscriberRecord[]>(
    `${TABLE_NAME}?on_conflict=normalized_email`,
    {
      body: JSON.stringify(record),
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      method: "POST",
    },
  );
  const subscriber = saved[0] ?? record;

  return {
    email: subscriber.normalized_email,
    status: subscriber.status,
    persistence: "supabase",
  };
}

export async function listSubscriberStats(): Promise<SubscriberStats> {
  if (!isDistributionSupabaseConfigured()) {
    return toStats(memorySubscribers, "memory", false);
  }

  const records = await supabaseFetch<SubscriberRecord[]>(
    `${TABLE_NAME}?select=normalized_email,status,source_surface,utm_source,created_at,last_subscribed_at&order=created_at.desc&limit=1000`,
  );

  return toStats(records, "supabase", true);
}
