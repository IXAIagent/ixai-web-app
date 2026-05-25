# IXAI Identity Foundation

v1.36.1 upgrades IXAI analytics from anonymous-only events into
identity-aware subscriber analytics without changing auth, membership, or the
editorial workflow.

## Architecture

The flow remains lightweight:

1. Visitor opens IXAI Public App.
2. PostHog assigns an anonymous `distinct_id`.
3. Visitor submits an email capture form.
4. IXAI persists the subscriber through the distribution subscribe API.
5. The client aliases the anonymous id to the normalized email.
6. The client identifies the normalized email with subscriber properties.
7. Existing events continue to use the same analytics provider registry.

This preserves the existing distribution architecture while allowing PostHog to
stitch pre-subscription behavior to the known subscriber timeline.

## Alias vs Identify

`safeAlias(previousId, nextId)` connects the anonymous visitor timeline to the
known subscriber id. In IXAI, `previousId` is the current anonymous PostHog
distinct id and `nextId` is the normalized email.

`safeIdentify(distinctId, properties)` attaches safe person properties to the
known subscriber. The current subscriber payload includes:

- `email`
- `subscriber_status`
- `first_subscribed_surface`
- `subscribed_at`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `referrer`

Undefined, null, token-like, cookie-like, password-like, secret-like, and
oversized fields are removed before delivery.

## Why Not Auth Gate

This phase is deliberately not an auth overhaul. Email capture is the lowest-risk
way to understand article-to-subscriber conversion before adding membership,
paywalls, or IXAI Pro entitlement. Public content and distribution surfaces keep
their existing behavior.

## Anonymous To Known Flow

```text
anonymous visitor
  -> page_view / article_read_depth / share events
  -> email capture success
  -> alias(anonymous distinct_id, normalized email)
  -> identify(normalized email, subscriber properties)
  -> known subscriber analytics timeline
```

## Admin Metrics

`/api/admin/analytics/snapshot` now includes:

- known subscribers
- anonymous visitors
- subscriber conversion rate

If PostHog server aggregation is not configured, the admin UI shows a disabled
empty state instead of failing.

## Testing Checklist

Production with PostHog env:

1. Open a Daily or Weekly article.
2. Confirm `page_view` and `article_read_depth` events.
3. Submit the email capture form.
4. Confirm `email_capture_success`.
5. Confirm PostHog receives an alias call.
6. Confirm the normalized email appears as an identified person.
7. Confirm subscriber properties are attached.
8. Confirm admin snapshot shows known subscriber and conversion metrics.

Development or missing env:

1. App renders normally.
2. Email capture UX remains unchanged.
3. Identity helpers noop silently.
4. Admin snapshot shows disabled or empty state.

## Privacy Guardrails

- No session replay.
- No heatmaps.
- No feature flags.
- No ads pixels.
- No auth token storage changes.
- No distribution schema changes.
- No raw event stream in admin.
