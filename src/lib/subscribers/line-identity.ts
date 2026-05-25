// v1.36.4 — IXAI LINE identity bridge repository.
//
// Reads / writes `ixai_line_identities` via Supabase service role. Falls
// back to a memory buffer when env is missing so local dev still
// validates the API contract. The LINE link API + admin snapshot are the
// only consumers.

import { log } from "@/src/lib/log";

export type LineIdentityRecord = {
  id?: string;
  line_user_id: string;
  subscriber_email: string | null;
  normalized_email: string | null;
  display_name: string | null;
  linked_at: string;
  last_seen_at: string;
  source: string | null;
  metadata: Record<string, string>;
  created_at?: string;
  updated_at: string;
};

export type LineIdentitySnapshot = {
  mode: "supabase" | "memory";
  configured: boolean;
  linkedCount: number;
  recentlyActiveCount: number;
  uniqueEmailsLinked: number;
};

const TABLE_NAME = "ixai_line_identities";
const SUPABASE_TIMEOUT_MS = 6000;
const MAX_MEMORY_RECORDS = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let memoryIdentities: LineIdentityRecord[] = [];

function getSupabaseConfig() {
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

export function isLineIdentityPersistenceConfigured(): boolean {
  return Boolean(getSupabaseConfig());
}

async function supabaseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("line_identity_supabase_not_configured");
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
      throw new Error(`line_identity_supabase_failed:${response.status}:${body.slice(0, 160)}`);
    }
    if (response.status === 204) {
      return null as T;
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function sanitize(value: unknown, maxLength = 220): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || null;
}

export type UpsertLineIdentityInput = {
  lineUserId: string;
  email?: string;
  displayName?: string;
  source?: string;
  metadata?: Record<string, string>;
};

function normalizeEmail(value?: string) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  return EMAIL_PATTERN.test(trimmed) ? trimmed : null;
}

function buildRecord(
  input: UpsertLineIdentityInput,
  existing?: LineIdentityRecord,
): LineIdentityRecord {
  const now = new Date().toISOString();
  const normalizedEmail = normalizeEmail(input.email);
  return {
    line_user_id: input.lineUserId.trim().slice(0, 200),
    subscriber_email: sanitize(input.email, 240) ?? existing?.subscriber_email ?? null,
    normalized_email: normalizedEmail ?? existing?.normalized_email ?? null,
    display_name: sanitize(input.displayName, 160) ?? existing?.display_name ?? null,
    linked_at: existing?.linked_at ?? now,
    last_seen_at: now,
    source: sanitize(input.source, 80) ?? existing?.source ?? null,
    metadata: {
      ...(existing?.metadata ?? {}),
      ...(input.metadata ?? {}),
    },
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
}

async function findExisting(lineUserId: string): Promise<LineIdentityRecord | null> {
  if (!isLineIdentityPersistenceConfigured()) {
    return memoryIdentities.find((row) => row.line_user_id === lineUserId) ?? null;
  }

  try {
    const records = await supabaseFetch<LineIdentityRecord[]>(
      `${TABLE_NAME}?select=*&line_user_id=eq.${encodeURIComponent(lineUserId)}&limit=1`,
    );
    return records[0] ?? null;
  } catch (error) {
    log.warn("[ixai.lineIdentity] read failed", error);
    return null;
  }
}

export async function upsertLineIdentity(
  input: UpsertLineIdentityInput,
): Promise<LineIdentityRecord | null> {
  const cleanLineUserId = input.lineUserId?.trim();
  if (!cleanLineUserId) {
    return null;
  }

  const existing = (await findExisting(cleanLineUserId)) ?? undefined;
  const record = buildRecord(input, existing);

  if (!isLineIdentityPersistenceConfigured()) {
    memoryIdentities = [
      record,
      ...memoryIdentities.filter((row) => row.line_user_id !== record.line_user_id),
    ].slice(0, MAX_MEMORY_RECORDS);
    return record;
  }

  try {
    const saved = await supabaseFetch<LineIdentityRecord[]>(
      `${TABLE_NAME}?on_conflict=line_user_id`,
      {
        body: JSON.stringify(record),
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        method: "POST",
      },
    );
    return saved[0] ?? record;
  } catch (error) {
    log.warn("[ixai.lineIdentity] write failed", error);
    return null;
  }
}

export async function getLineIdentitySnapshot(): Promise<LineIdentitySnapshot> {
  if (!isLineIdentityPersistenceConfigured()) {
    return buildSnapshot(memoryIdentities, "memory", false);
  }

  try {
    const records = await supabaseFetch<LineIdentityRecord[]>(
      `${TABLE_NAME}?select=line_user_id,normalized_email,last_seen_at,linked_at&order=last_seen_at.desc&limit=1000`,
    );
    return buildSnapshot(records, "supabase", true);
  } catch (error) {
    log.warn("[ixai.lineIdentity] snapshot failed", error);
    return buildSnapshot([], "supabase", true);
  }
}

function buildSnapshot(
  records: LineIdentityRecord[],
  mode: "supabase" | "memory",
  configured: boolean,
): LineIdentitySnapshot {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let recentlyActive = 0;

  const uniqueEmails = new Set<string>();
  for (const record of records) {
    const lastSeenMs = Date.parse(record.last_seen_at ?? record.linked_at);
    if (Number.isFinite(lastSeenMs) && now - lastSeenMs < sevenDaysMs) {
      recentlyActive += 1;
    }
    if (record.normalized_email) {
      uniqueEmails.add(record.normalized_email);
    }
  }

  return {
    mode,
    configured,
    linkedCount: records.length,
    recentlyActiveCount: recentlyActive,
    uniqueEmailsLinked: uniqueEmails.size,
  };
}
