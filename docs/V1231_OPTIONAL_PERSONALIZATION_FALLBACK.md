# V12.3.1 Optional Personalization Fallback

## Background

V12.3 production API cleanup audit identified the remaining production Console `404` noise after PR #82:

- `ixai_profile_memory` readback selecting `onboarding_completed`.
- `ixai_user_preferences` readback selecting `preferred_categories`.

Workspace manual verification already showed Home, Settings, Copilot, and Intelligence stable with no `RESULT_CODE_HUNG`, gray screen, white screen, or authenticated `401` storm. The remaining issue was optional personalization table probing during root auth hydration.

## Root Cause

The optional personalization tables are historical/account-sync resources. They are documented in older persistence migrations, but current production context only confirms later Portfolio / FCN / Stock / Crypto migrations.

Because a browser cannot know that a PostgREST table is missing without making the request, the previous runtime flow could still create first-load network `404` entries before the optional-table cooldown was established.

## Why Fallback Instead Of Migration

This version intentionally does not add migrations, tables, schema, RLS, auth policy, or membership changes.

Reasons:

- The resources are optional account personalization sync, not required Workspace runtime infrastructure.
- Local preferences and personal memory already exist as the safe user-facing fallback.
- Applying identity/account persistence migrations needs a separate migration/RLS review.
- The goal is Console cleanup without changing product behavior.

## Implementation

`src/lib/personalization/persistence.ts` now treats optional personalization Supabase sync as disabled by default.

Remote optional personalization sync is only attempted when:

```txt
NEXT_PUBLIC_IXAI_OPTIONAL_PERSONALIZATION_SYNC=1
```

When that flag is absent, root auth hydration does not call:

- `GET /rest/v1/ixai_profile_memory?...onboarding_completed&limit=1`
- `GET /rest/v1/ixai_user_preferences?...preferred_categories&limit=1`
- `POST /rest/v1/ixai_profile_memory?on_conflict=user_id`
- `POST /rest/v1/ixai_user_preferences?on_conflict=user_id`

The existing optional Supabase helper remains in place behind the flag for future validated environments.

## Default Objects

Profile memory fallback:

```ts
{
  watched_symbols: [],
  recently_viewed_sections: [],
  last_visit_at: undefined,
  onboarding_completed: false,
}
```

Runtime object behavior:

- Reads local personal memory via `readPersonalMemory(userId)`.
- If no local memory exists, the existing default memory has `onboardingCompleted: false`.
- Writes remain local via `writePersonalMemory(...)`.

User preference fallback:

```ts
{
  preferred_categories: [],
}
```

Runtime object behavior:

- Reads local preferences via `getLocalPreferences(userId)`.
- If no local preferences exist, the default is `[]`.
- Writes remain local via `saveLocalPreferences(...)`.

## Error Policy

Default production path:

- No optional personalization network request.
- No production `console.error`.
- No production `console.warn`.
- No route blocking.
- No retry.
- No mount crash.

Future opt-in path with `NEXT_PUBLIC_IXAI_OPTIONAL_PERSONALIZATION_SYNC=1`:

- Missing table `404`, PostgREST relation missing, table-not-found, or schema-cache missing errors use the existing optional resource fallback.
- Network failure, `401`, `403`, `500`, and other non-missing-table errors continue through the existing optional helper behavior and are not converted into fake success.

Development logging:

- Development can warn once per optional personalization resource:

```txt
Optional personalization resource unavailable. Using defaults.
```

## Out Of Scope

- No product feature work.
- No auth behavior change.
- No RLS / schema / migration change.
- No Supabase table creation.
- No Workspace Runtime change.
- No Portfolio, FCN, Risk, Intelligence, Timeline, Settings Runtime, or Copilot Runtime change.
- No billing, broker, trading, recommendation, OpenAI, AI, scheduler, or notification delivery change.
- No declaration that V12 is complete; production should still be observed after deploy.

## Production Verification

After deploy to `https://app.ixuan.ai`:

- Log in.
- Open `/my-ixai/home`.
- Open `/my-ixai/portfolio`.
- Open `/my-ixai/settings`.
- Open `/my-ixai/copilot`.
- Open `/my-ixai/risk`.
- Open `/my-ixai/fcn`.
- Open `/my-ixai/intelligence`.
- Confirm Console / Network no longer shows:
  - `ixai_profile_memory` `404`
  - `ixai_user_preferences` `404`
  - `onboarding_completed&limit=1`
  - `preferred_categories&limit=1`
  - `completed&limit=1`
  - `categories&limit=1`
- Confirm Workspace behavior remains unchanged.
