// v1.36.2 — IXAI Subscriber Profile repository.
//
// Aggregation layer above ixai_distribution_subscribers (raw capture).
// Each profile tracks per-surface read counts, share counts, average
// read depth, favorite surface and engagement / pro-candidate scores.
//
// Service-role server-side writes only. When Supabase env is missing,
// a memory-mode buffer preserves the contract for local dev — the
// admin snapshot will simply read counts of zero until env is wired.

import { log } from "@/src/lib/log";

export type SubscriberSurface = "weekly" | "daily" | "market" | "fcn";

export type SubscriberTag =
  | "line_connected"
  | "pro_waitlist"
  | "high_engagement"
  | "pro_candidate"
  | "crypto_reader"
  | "fcn_reader"
  | "macro_reader";

export type SubscriberProfile = {
  email: string;
  normalizedEmail: string;
  subscriberStatus: "active" | "unsubscribed" | "bounced" | "complained";
  firstSeenAt: string;
  lastSeenAt: string;
  totalReads: number;
  weeklyReads: number;
  dailyReads: number;
  marketReads: number;
  fcnReads: number;
  totalShares: number;
  avgReadDepth: number;
  favoriteSurface: SubscriberSurface | null;
  engagementScore: number;
  proCandidateScore: number;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  tags: SubscriberTag[];
  metadata: Record<string, string>;
};

export type AudienceSnapshot = {
  mode: "supabase" | "memory";
  configured: boolean;
  totalProfiles: number;
  activeProfiles: number;
  highEngagementCount: number;
  proCandidateCount: number;
  returningReaderCount: number;
  lineConnectedCount: number;
  avgReadDepth: number;
  favoriteSurfaceDistribution: { surface: SubscriberSurface; count: number }[];
  topSegments: { label: string; count: number }[];
  recentlyActiveCount: number;
};

type ProfileRecord = {
  id?: string;
  email: string | null;
  normalized_email: string | null;
  subscriber_status: SubscriberProfile["subscriberStatus"];
  first_seen_at: string;
  last_seen_at: string;
  total_reads: number;
  weekly_reads: number;
  daily_reads: number;
  market_reads: number;
  fcn_reads: number;
  total_shares: number;
  avg_read_depth: number;
  favorite_surface: SubscriberSurface | null;
  engagement_score: number;
  pro_candidate_score: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  tags: SubscriberTag[];
  metadata: Record<string, string>;
  created_at?: string;
  updated_at: string;
};

const TABLE_NAME = "ixai_subscriber_profiles";
const SUPABASE_TIMEOUT_MS = 6000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_MEMORY_RECORDS = 500;

// In-memory fallback. Resets per Vercel function instance — for local dev
// only. Admin readers see counts of zero when env is missing.
let memoryProfiles: ProfileRecord[] = [];

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

export function isProfilePersistenceConfigured(): boolean {
  return Boolean(getSupabaseConfig());
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

function sanitize(value: unknown, maxLength = 220): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || undefined;
}

async function supabaseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("profile_supabase_not_configured");
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
      throw new Error(`profile_supabase_failed:${response.status}:${body.slice(0, 160)}`);
    }
    if (response.status === 204) {
      return null as T;
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function recordToProfile(record: ProfileRecord): SubscriberProfile {
  return {
    email: record.email ?? record.normalized_email ?? "",
    normalizedEmail: record.normalized_email ?? "",
    subscriberStatus: record.subscriber_status,
    firstSeenAt: record.first_seen_at,
    lastSeenAt: record.last_seen_at,
    totalReads: record.total_reads,
    weeklyReads: record.weekly_reads,
    dailyReads: record.daily_reads,
    marketReads: record.market_reads,
    fcnReads: record.fcn_reads,
    totalShares: record.total_shares,
    avgReadDepth: Number(record.avg_read_depth ?? 0),
    favoriteSurface: record.favorite_surface,
    engagementScore: Number(record.engagement_score ?? 0),
    proCandidateScore: Number(record.pro_candidate_score ?? 0),
    utmSource: record.utm_source,
    utmMedium: record.utm_medium,
    utmCampaign: record.utm_campaign,
    tags: Array.isArray(record.tags) ? record.tags : [],
    metadata: record.metadata && typeof record.metadata === "object" ? record.metadata : {},
  };
}

function emptyRecord(normalizedEmail: string, email: string): ProfileRecord {
  const now = new Date().toISOString();
  return {
    email,
    normalized_email: normalizedEmail,
    subscriber_status: "active",
    first_seen_at: now,
    last_seen_at: now,
    total_reads: 0,
    weekly_reads: 0,
    daily_reads: 0,
    market_reads: 0,
    fcn_reads: 0,
    total_shares: 0,
    avg_read_depth: 0,
    favorite_surface: null,
    engagement_score: 0,
    pro_candidate_score: 0,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    tags: [],
    metadata: {},
    created_at: now,
    updated_at: now,
  };
}

export function computeFavoriteSurface(record: ProfileRecord): SubscriberSurface | null {
  const counts: Array<[SubscriberSurface, number]> = [
    ["weekly", record.weekly_reads ?? 0],
    ["daily", record.daily_reads ?? 0],
    ["market", record.market_reads ?? 0],
    ["fcn", record.fcn_reads ?? 0],
  ];
  let best: SubscriberSurface | null = null;
  let bestCount = 0;
  for (const [surface, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      best = surface;
    }
  }
  return best;
}

// Engagement score per spec:
//   weekly_open +2 / daily_open +1 / market_open +1 / fcn_open +2
//   article_read_depth_100 +4 / share +6 / subscribe +10 / return_visit +5
//
// Pro-candidate score amplifies engagement when the favourite surface is
// FCN / market AND the reader has multiple deep reads, so future
// segmentation can pick "looks like a Pro buyer" without hand-tagging.
export function computeEngagementScore(record: ProfileRecord): {
  engagementScore: number;
  proCandidateScore: number;
} {
  const score =
    record.weekly_reads * 2 +
    record.daily_reads * 1 +
    record.market_reads * 1 +
    record.fcn_reads * 2 +
    record.total_shares * 6 +
    // article_read_depth_100 contribution. avg_read_depth is a 0..100
    // value; a perfect reader gets +4, scaled linearly per profile.
    Math.min(record.total_reads, 30) * (record.avg_read_depth / 100) * 4 +
    // Subscribe bonus only when this row is a real subscriber (has an
    // email). Pre-email profiles still aggregate reads but stay below
    // the subscribe threshold.
    (record.email ? 10 : 0);

  // Return visits = total_reads > 1 across sessions. We approximate by
  // saying any reader with 3+ surface visits and last_seen_at within
  // 7 days has demonstrated returning behavior.
  const lastSeenMs = Date.parse(record.last_seen_at ?? record.first_seen_at);
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const isReturning =
    record.total_reads >= 3 &&
    Number.isFinite(lastSeenMs) &&
    Date.now() - lastSeenMs < sevenDaysMs * 2;
  const returnBonus = isReturning ? 5 : 0;

  const engagementScore = Math.round((score + returnBonus) * 100) / 100;

  const fcnDepth = record.fcn_reads * 1.5;
  const marketDepth = record.market_reads * 1.0;
  const proCandidateScore = Math.round((engagementScore * 0.6 + fcnDepth + marketDepth) * 100) / 100;

  return { engagementScore, proCandidateScore };
}

const TAG_DEFINITIONS: SubscriberTag[] = [
  "line_connected",
  "pro_waitlist",
  "high_engagement",
  "pro_candidate",
  "crypto_reader",
  "fcn_reader",
  "macro_reader",
];

function ensureTagsArray(tags: unknown): SubscriberTag[] {
  if (!Array.isArray(tags)) {
    return [];
  }
  return tags.filter((tag): tag is SubscriberTag => TAG_DEFINITIONS.includes(tag as SubscriberTag));
}

function deriveTags(record: ProfileRecord, existingTags: SubscriberTag[]): SubscriberTag[] {
  const next = new Set<SubscriberTag>(existingTags);

  // line_connected is managed explicitly by the LINE link API; never
  // auto-add or remove here so the LINE bridge owns it.
  if (record.engagement_score >= 20) {
    next.add("high_engagement");
  } else {
    next.delete("high_engagement");
  }

  if (record.pro_candidate_score >= 20) {
    next.add("pro_candidate");
  } else {
    next.delete("pro_candidate");
  }

  const favorite = record.favorite_surface;
  next.delete("fcn_reader");
  next.delete("crypto_reader");
  next.delete("macro_reader");
  if (favorite === "fcn") {
    next.add("fcn_reader");
  } else if (favorite === "market") {
    next.add("macro_reader");
  } else if (Number(record.metadata?.crypto_reads ?? 0) > 0) {
    // Reserved for a future crypto-specific surface; harmless when zero.
    next.add("crypto_reader");
  }

  return [...next];
}

function refreshAggregates(record: ProfileRecord): ProfileRecord {
  const favorite = computeFavoriteSurface(record);
  const updated: ProfileRecord = { ...record, favorite_surface: favorite };
  const scores = computeEngagementScore(updated);
  updated.engagement_score = scores.engagementScore;
  updated.pro_candidate_score = scores.proCandidateScore;
  updated.tags = deriveTags(updated, ensureTagsArray(updated.tags));
  updated.updated_at = new Date().toISOString();
  return updated;
}

async function findProfileRecord(normalizedEmail: string): Promise<ProfileRecord | null> {
  if (!isProfilePersistenceConfigured()) {
    return memoryProfiles.find((row) => row.normalized_email === normalizedEmail) ?? null;
  }

  try {
    const records = await supabaseFetch<ProfileRecord[]>(
      `${TABLE_NAME}?select=*&normalized_email=eq.${encodeURIComponent(normalizedEmail)}&limit=1`,
    );
    return records[0] ?? null;
  } catch (error) {
    log.warn("[ixai.profiles] read failed", error);
    return null;
  }
}

async function writeProfileRecord(record: ProfileRecord): Promise<ProfileRecord> {
  if (!isProfilePersistenceConfigured()) {
    memoryProfiles = [
      record,
      ...memoryProfiles.filter((row) => row.normalized_email !== record.normalized_email),
    ].slice(0, MAX_MEMORY_RECORDS);
    return record;
  }

  try {
    const saved = await supabaseFetch<ProfileRecord[]>(
      `${TABLE_NAME}?on_conflict=normalized_email`,
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
    log.warn("[ixai.profiles] write failed", error);
    return record;
  }
}

export type UpsertProfileInput = {
  email: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  metadata?: Record<string, string>;
};

export async function upsertSubscriberProfile(input: UpsertProfileInput): Promise<SubscriberProfile | null> {
  const normalizedEmail = normalizeEmail(input.email);
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return null;
  }

  const existing = (await findProfileRecord(normalizedEmail)) ?? emptyRecord(normalizedEmail, input.email.trim());

  const now = new Date().toISOString();
  const next: ProfileRecord = {
    ...existing,
    email: existing.email ?? input.email.trim(),
    normalized_email: normalizedEmail,
    last_seen_at: now,
    utm_source: existing.utm_source ?? sanitize(input.utmSource, 160) ?? null,
    utm_medium: existing.utm_medium ?? sanitize(input.utmMedium, 160) ?? null,
    utm_campaign: existing.utm_campaign ?? sanitize(input.utmCampaign, 160) ?? null,
    metadata: {
      ...existing.metadata,
      ...(input.metadata ?? {}),
    },
  };

  const aggregated = refreshAggregates(next);
  const saved = await writeProfileRecord(aggregated);
  return recordToProfile(saved);
}

async function applyDelta(
  normalizedEmail: string,
  mutate: (record: ProfileRecord) => ProfileRecord,
): Promise<SubscriberProfile | null> {
  const existing = await findProfileRecord(normalizedEmail);
  if (!existing) {
    return null;
  }
  const next = mutate({ ...existing });
  const aggregated = refreshAggregates(next);
  const saved = await writeProfileRecord(aggregated);
  return recordToProfile(saved);
}

export async function incrementProfileRead({
  email,
  surface,
}: {
  email: string;
  surface: SubscriberSurface;
}): Promise<SubscriberProfile | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return null;
  }

  return applyDelta(normalizedEmail, (record) => {
    const next = { ...record };
    next.total_reads += 1;
    next.last_seen_at = new Date().toISOString();
    if (surface === "weekly") next.weekly_reads += 1;
    else if (surface === "daily") next.daily_reads += 1;
    else if (surface === "market") next.market_reads += 1;
    else if (surface === "fcn") next.fcn_reads += 1;
    return next;
  });
}

export async function incrementProfileShare(email: string): Promise<SubscriberProfile | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return null;
  }
  return applyDelta(normalizedEmail, (record) => ({
    ...record,
    total_shares: record.total_shares + 1,
    last_seen_at: new Date().toISOString(),
  }));
}

export async function updateProfileReadDepth({
  email,
  depthPercent,
}: {
  email: string;
  depthPercent: number;
}): Promise<SubscriberProfile | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return null;
  }
  const clamped = Math.max(0, Math.min(100, Math.round(depthPercent)));
  return applyDelta(normalizedEmail, (record) => {
    // Running average: weight existing avg by total_reads and fold in the
    // new depth observation. total_reads is incremented separately by the
    // read counter; here we only adjust the average.
    const reads = Math.max(record.total_reads, 1);
    const nextAvg = (record.avg_read_depth * (reads - 1) + clamped) / reads;
    return {
      ...record,
      avg_read_depth: Math.round(nextAvg * 100) / 100,
      last_seen_at: new Date().toISOString(),
    };
  });
}

// Server-managed tag mutator used by the LINE link API to set
// "line_connected". Callers must pass the canonical tag list; we never
// allow arbitrary strings.
export async function setProfileTag({
  email,
  tag,
  enabled,
}: {
  email: string;
  tag: SubscriberTag;
  enabled: boolean;
}): Promise<SubscriberProfile | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return null;
  }
  if (!TAG_DEFINITIONS.includes(tag)) {
    return null;
  }
  return applyDelta(normalizedEmail, (record) => {
    const existingTags = ensureTagsArray(record.tags);
    const next = new Set(existingTags);
    if (enabled) {
      next.add(tag);
    } else {
      next.delete(tag);
    }
    return {
      ...record,
      tags: [...next] as SubscriberTag[],
      last_seen_at: new Date().toISOString(),
    };
  });
}

export async function listTopProfiles(limit = 5): Promise<SubscriberProfile[]> {
  if (!isProfilePersistenceConfigured()) {
    return [...memoryProfiles]
      .sort((a, b) => (b.engagement_score ?? 0) - (a.engagement_score ?? 0))
      .slice(0, limit)
      .map(recordToProfile);
  }

  try {
    const records = await supabaseFetch<ProfileRecord[]>(
      `${TABLE_NAME}?select=*&order=engagement_score.desc&limit=${limit}`,
    );
    return records.map(recordToProfile);
  } catch (error) {
    log.warn("[ixai.profiles] listTop failed", error);
    return [];
  }
}

function buildSnapshot(records: ProfileRecord[], mode: "supabase" | "memory", configured: boolean): AudienceSnapshot {
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  let totalDepthSum = 0;
  let totalDepthCount = 0;
  let highEngagement = 0;
  let proCandidate = 0;
  let returning = 0;
  let lineConnected = 0;
  let active = 0;
  let recentlyActive = 0;

  const surfaceCounts: Record<SubscriberSurface, number> = {
    weekly: 0,
    daily: 0,
    market: 0,
    fcn: 0,
  };

  const segmentCounts = new Map<string, number>();

  for (const record of records) {
    if (record.subscriber_status === "active") active += 1;
    if (record.engagement_score >= 20) highEngagement += 1;
    if (record.pro_candidate_score >= 20) proCandidate += 1;

    const lastSeenMs = Date.parse(record.last_seen_at ?? record.first_seen_at);
    if (Number.isFinite(lastSeenMs)) {
      if (now - lastSeenMs < sevenDaysMs * 2 && record.total_reads >= 2) returning += 1;
      if (now - lastSeenMs < sevenDaysMs) recentlyActive += 1;
    }

    if (record.avg_read_depth > 0) {
      totalDepthSum += record.avg_read_depth;
      totalDepthCount += 1;
    }

    const tags = ensureTagsArray(record.tags);
    if (tags.includes("line_connected")) lineConnected += 1;

    for (const tag of tags) {
      segmentCounts.set(tag, (segmentCounts.get(tag) ?? 0) + 1);
    }

    if (record.favorite_surface && surfaceCounts[record.favorite_surface] !== undefined) {
      surfaceCounts[record.favorite_surface] += 1;
    }
  }

  return {
    mode,
    configured,
    totalProfiles: records.length,
    activeProfiles: active,
    highEngagementCount: highEngagement,
    proCandidateCount: proCandidate,
    returningReaderCount: returning,
    lineConnectedCount: lineConnected,
    avgReadDepth: totalDepthCount
      ? Math.round((totalDepthSum / totalDepthCount) * 100) / 100
      : 0,
    favoriteSurfaceDistribution: (
      Object.entries(surfaceCounts) as Array<[SubscriberSurface, number]>
    )
      .map(([surface, count]) => ({ surface, count }))
      .sort((a, b) => b.count - a.count),
    topSegments: [...segmentCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    recentlyActiveCount: recentlyActive,
  };
}

export async function getAudienceSnapshot(): Promise<AudienceSnapshot> {
  if (!isProfilePersistenceConfigured()) {
    return buildSnapshot(memoryProfiles, "memory", false);
  }

  try {
    const records = await supabaseFetch<ProfileRecord[]>(
      `${TABLE_NAME}?select=*&order=engagement_score.desc&limit=1000`,
    );
    return buildSnapshot(records, "supabase", true);
  } catch (error) {
    log.warn("[ixai.profiles] snapshot failed", error);
    return buildSnapshot([], "supabase", true);
  }
}

export function getAttributionLandingFor(record: ProfileRecord): string | null {
  return record.metadata?.landing_path ?? null;
}
