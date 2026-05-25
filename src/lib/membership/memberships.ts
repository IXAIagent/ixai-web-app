import { getSupabaseRestConfig } from "@/src/lib/supabase/server";

export type MembershipPlan = "free" | "pro" | "enterprise";
export type MembershipStatus = "active" | "expired" | "cancelled" | "trial";
export type MembershipPersistenceMode = "supabase" | "memory";

export type MembershipRecord = {
  id?: string;
  normalized_email: string;
  plan: MembershipPlan;
  status: MembershipStatus;
  started_at: string;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
  metadata: Record<string, unknown>;
};

export type MembershipInput = {
  email: string;
  plan?: MembershipPlan;
  status?: MembershipStatus;
  startedAt?: string;
  expiresAt?: string | null;
  metadata?: Record<string, unknown>;
};

export type SavedMembership = {
  membership: MembershipRecord;
  persistence: MembershipPersistenceMode;
  configured: boolean;
};

export type MembershipSnapshot = {
  persistence: MembershipPersistenceMode;
  configured: boolean;
  totalMembers: number;
  activePro: number;
  trials: number;
  expired: number;
  conversionCandidates: number;
  freeMembers: number;
  proWaitlistCount: number;
  proCandidates: number;
  proConversionRate: number;
  topPlans: { label: string; count: number }[];
  topRequestedProFeatures: { label: string; count: number }[];
};

const TABLE_NAME = "ixai_memberships";
const SUPABASE_TIMEOUT_MS = 6000;
const MAX_MEMORY_RECORDS = 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

let memoryMemberships: MembershipRecord[] = [];

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateEmail(email: string) {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

function isConfigured() {
  return Boolean(getSupabaseRestConfig({ write: true }));
}

function sanitizeMetadata(metadata: Record<string, unknown> | undefined) {
  const clean: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(metadata ?? {}).slice(0, 24)) {
    const cleanKey = key.trim().slice(0, 80);

    if (!cleanKey) {
      continue;
    }

    if (typeof value === "string") {
      const trimmed = value.trim().slice(0, 240);
      if (trimmed) clean[cleanKey] = trimmed;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      clean[cleanKey] = value;
    } else if (typeof value === "boolean") {
      clean[cleanKey] = value;
    }
  }

  return clean;
}

function isPaidPlan(plan: MembershipPlan) {
  return plan === "pro" || plan === "enterprise";
}

function isExpired(record: MembershipRecord) {
  if (record.status === "expired" || record.status === "cancelled") {
    return true;
  }

  if (!record.expires_at) {
    return false;
  }

  const expiresAt = new Date(record.expires_at).getTime();
  return Number.isFinite(expiresAt) && expiresAt <= Date.now();
}

function buildRecord(input: MembershipInput, existing?: MembershipRecord): MembershipRecord {
  const now = new Date().toISOString();
  const normalizedEmail = normalizeEmail(input.email);
  const requestedPlan = input.plan ?? "free";
  const plan =
    existing && isPaidPlan(existing.plan) && requestedPlan === "free"
      ? existing.plan
      : requestedPlan;

  return {
    id: existing?.id,
    normalized_email: normalizedEmail,
    plan,
    status: input.status ?? existing?.status ?? "active",
    started_at: input.startedAt ?? existing?.started_at ?? now,
    expires_at: input.expiresAt ?? existing?.expires_at ?? null,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    metadata: {
      ...(existing?.metadata ?? {}),
      ...sanitizeMetadata(input.metadata),
    },
  };
}

async function membershipFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getSupabaseRestConfig({ write: true });

  if (!config) {
    throw new Error("membership_supabase_not_configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.restUrl}/${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        apikey: config.apiKey,
        authorization: `Bearer ${config.authKey}`,
        "content-type": "application/json",
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`membership_supabase_failed:${response.status}:${body.slice(0, 160)}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function findSupabaseMembership(normalizedEmail: string) {
  const records = await membershipFetch<MembershipRecord[]>(
    `${TABLE_NAME}?select=*&normalized_email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
  );

  return records[0] ?? null;
}

function findMemoryMembership(normalizedEmail: string) {
  return memoryMemberships.find((record) => record.normalized_email === normalizedEmail) ?? null;
}

function upsertMemoryMembership(input: MembershipInput): SavedMembership {
  const normalizedEmail = normalizeEmail(input.email);
  const existing = findMemoryMembership(normalizedEmail) ?? undefined;
  const record = buildRecord(input, existing);

  memoryMemberships = [
    record,
    ...memoryMemberships.filter((item) => item.normalized_email !== normalizedEmail),
  ].slice(0, MAX_MEMORY_RECORDS);

  return {
    membership: record,
    persistence: "memory",
    configured: false,
  };
}

function toSnapshot(
  records: MembershipRecord[],
  persistence: MembershipPersistenceMode,
  configured: boolean,
): MembershipSnapshot {
  const planCounts = new Map<string, number>();
  const featureCounts = new Map<string, number>();

  for (const record of records) {
    planCounts.set(record.plan, (planCounts.get(record.plan) ?? 0) + 1);
    const requestedFeature = String(record.metadata?.requested_feature ?? "").trim();
    if (requestedFeature) {
      featureCounts.set(requestedFeature, (featureCounts.get(requestedFeature) ?? 0) + 1);
    }
  }
  const activePro = records.filter(
    (record) => isPaidPlan(record.plan) && !isExpired(record) && record.status === "active",
  ).length;
  const freeMembers = records.filter((record) => record.plan === "free").length;
  const proWaitlistCount = records.filter(
    (record) => record.metadata?.intent === "pro_waitlist",
  ).length;

  return {
    persistence,
    configured,
    totalMembers: records.length,
    activePro,
    trials: records.filter((record) => record.status === "trial" && !isExpired(record)).length,
    expired: records.filter((record) => isExpired(record)).length,
    freeMembers,
    proWaitlistCount,
    proCandidates: proWaitlistCount,
    proConversionRate: records.length ? Number(((activePro / records.length) * 100).toFixed(1)) : 0,
    conversionCandidates: records.filter(
      (record) => record.plan === "free" && record.status === "active" && !isExpired(record),
    ).length,
    topPlans: [...planCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    topRequestedProFeatures: [...featureCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
}

export async function getMembershipByEmail(email: string): Promise<MembershipRecord | null> {
  if (!validateEmail(email)) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);

  if (!isConfigured()) {
    return findMemoryMembership(normalizedEmail);
  }

  return findSupabaseMembership(normalizedEmail);
}

export async function upsertMembership(input: MembershipInput): Promise<SavedMembership> {
  if (!validateEmail(input.email)) {
    throw new Error("invalid_membership_email");
  }

  if (!isConfigured()) {
    return upsertMemoryMembership(input);
  }

  const normalizedEmail = normalizeEmail(input.email);
  const existing = await findSupabaseMembership(normalizedEmail);
  const record = buildRecord(input, existing ?? undefined);
  const saved = await membershipFetch<MembershipRecord[]>(
    `${TABLE_NAME}?on_conflict=normalized_email`,
    {
      body: JSON.stringify(record),
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      method: "POST",
    },
  );

  return {
    membership: saved[0] ?? record,
    persistence: "supabase",
    configured: true,
  };
}

export async function isProMember(email: string) {
  const membership = await getMembershipByEmail(email);

  if (!membership) {
    return false;
  }

  return isPaidPlan(membership.plan) && !isExpired(membership) && membership.status !== "cancelled";
}

export async function getMembershipSnapshot(): Promise<MembershipSnapshot> {
  if (!isConfigured()) {
    return toSnapshot(memoryMemberships, "memory", false);
  }

  const records = await membershipFetch<MembershipRecord[]>(
    `${TABLE_NAME}?select=normalized_email,plan,status,started_at,expires_at,created_at,updated_at,metadata&order=created_at.desc&limit=1000`,
  );

  return toSnapshot(records, "supabase", true);
}
