# LINE Identity Bridge — v1.36.4

The IXAI LINE Identity Bridge is the foundation layer that links a
LINE user id (from a future LIFF / Messaging API integration) to the
IXAI subscriber profile graph. v1.36.4 ships the schema, the link API
and the UI placeholders — it deliberately does NOT include a real
OAuth / LIFF flow.

## Schema

Table: `public.ixai_line_identities` (migration `007_line_identity_bridge.sql`)

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | primary key |
| `line_user_id` | `text` | unique; treated as the canonical key (Bot OA / LIFF user id) |
| `subscriber_email` | `text` | raw email used to link the LINE id to the subscriber graph |
| `normalized_email` | `text` | indexed lower-case email; joins to `ixai_subscriber_profiles.normalized_email` |
| `display_name` | `text` | LINE display name (optional) |
| `linked_at`, `last_seen_at` | `timestamptz` | linkage lifecycle |
| `source` | `text` | how the linkage was created (`line_oa`, `liff`, `admin_manual`) |
| `metadata` | `jsonb` | freeform — channel id, region, etc. |
| `created_at`, `updated_at` | `timestamptz` | row lifecycle |

Indexes:
- `line_user_id` (unique)
- `normalized_email`
- `last_seen_at desc`

RLS: **enabled with no policies**. Service-role server writes only.

## Link API

`POST /api/line/link`

Headers:

```
x-ixai-line-secret: <IXAI_LINE_LINK_SECRET>
content-type: application/json
```

Body:

```json
{
  "lineUserId": "U1234567890",
  "email": "reader@example.com",
  "displayName": "I-Xuan Reader",
  "source": "line_oa",
  "metadata": { "channel_id": "..." }
}
```

Behavior:

1. Rejects (`401`) when `IXAI_LINE_LINK_SECRET` env is unset OR the
   header does not match. The endpoint is intentionally unreachable
   from the public internet until the secret is provisioned.
2. Upserts the `ixai_line_identities` row keyed on `line_user_id`.
3. When the payload includes a valid email:
   - Calls `upsertSubscriberProfile({ email })` to make sure an
     audience graph row exists.
   - Calls `setProfileTag({ email, tag: "line_connected", enabled: true })`
     so the LINE bridge owns the `line_connected` tag end-to-end.
4. Both subscriber-profile mutations are wrapped in try/catch — a
   profile-side failure must never block the LINE linkage write.
5. Response: `{ ok: true, lineUserId, linkedEmail }` or `{ ok: false, message }`.

## Subscriber profile tags

Canonical tag list managed by `setProfileTag` in
`src/lib/subscribers/profiles.ts`:

- `line_connected` — set by `POST /api/line/link` only.
- `high_engagement` — auto-set when `engagement_score >= 20`.
- `pro_candidate` — auto-set when `pro_candidate_score >= 20`.
- `crypto_reader` — reserved for a future crypto surface.
- `fcn_reader` — auto-set when favorite surface is `fcn`.
- `macro_reader` — auto-set when favorite surface is `market`.

The auto-derivation code (`deriveTags`) NEVER touches `line_connected`:
the LINE bridge owns it explicitly so a downstream LIFF disconnection
can clear it cleanly without fighting the engagement updater.

## Admin LINE snapshot

`GET /api/admin/audience/snapshot` now folds in a `line` block:

```json
{
  "snapshot": { ...audience aggregates },
  "line": {
    "mode": "supabase",
    "configured": true,
    "linkedCount": 0,
    "recentlyActiveCount": 0,
    "uniqueEmailsLinked": 0,
    "connectionRate": 0.0
  }
}
```

The connection rate is computed as
`linkedCount / totalProfiles * 100` and is rendered as a percentage
inside the LINE Identity Bridge card on the admin audience snapshot.

## LINE gateway UI

`components/distribution/line-oa-gateway.tsx` accepts an optional
`connected?: boolean` prop. When `connected` is true the gateway
renders:

- Emerald-tinted "LINE connected" badge
- "LINE intelligence sync coming soon" placeholder text

No real OAuth is exposed in this version. Consumers can already pass
`connected={true}` once a LINE-linked subscriber is identified (e.g.
the future LIFF callback page) — the UI contract is ready.

## Why no real OAuth yet

The v1.36.4 brief explicitly says "do not do real OAuth login". The
LINE Messaging API + LIFF integration is a meaningful surface that
needs:

- a verified LINE OA channel with a Messaging API token,
- a webhook signature verifier,
- a LIFF endpoint hosting,
- privacy / consent disclosure copy aligned with the IXAI legal note.

None of that lives in this commit. We ship the schema + bridge API +
admin surface so when those pieces are wired (LIFF callback or
Messaging API webhook will POST to `/api/line/link`), the rest of the
audience graph is already prepared for the new identity vertex.
