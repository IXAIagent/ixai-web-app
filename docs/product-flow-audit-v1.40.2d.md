# IXAI v1.40.2d Product Flow Audit & Simplification

Status: Audit only  
Scope: Product flow, CTA hierarchy, page purpose, onboarding/account/pro/share relationship  
Decision: No product code, route, navigation, API, analytics, auth, LINE, or UI implementation changes in this pass.

## Executive Answer

IXAI 使用者真正應該走的主路徑是：

```text
Public Landing (/)
→ Onboarding (/onboarding)
→ Account / AI Intelligence Workspace (/account)
→ Future Pro Interest (/pro)
→ Pro Preview only when user asks for deeper context (/pro-preview)
```

Recommended public acquisition side path:

```text
Share Intelligence (/share/intelligence/*)
→ Onboarding (/onboarding)
→ Account / AI Intelligence Workspace (/account)
```

Recommended LINE side path:

```text
Account or Onboarding
→ LINE Intelligence connection
→ future delivery opt-in
```

The current product became complex because multiple surfaces now compete to be the "next step":

- Landing wants to send users to welcome, onboarding, preview, and LINE.
- Pro surfaces want to send users to waitlist, preview, Pro Intelligence, Daily Brief, and LINE.
- Account is both workspace, delivery setup, CRM profile, Pro interest, and LINE hub.
- Share pages are acquisition routes but can visually feel like product routes.
- `/pro-intelligence` is a future gated shell but can be reached too early, making it feel like a broken or locked main product.

The simplification target is not fewer features. It is fewer primary decisions per moment.

## Page Map

| Page | Purpose | Target User | Entry Source | Recommended Next Step | Classification |
| --- | --- | --- | --- | --- | --- |
| `/` | Explain what IXAI is and why the user should start an intelligence relationship. | New public visitor, returning unidentified visitor. | Direct domain, search/social, brand sharing. | Primary: `/onboarding`. Secondary: `/pro-preview`. Tertiary: LINE. | Core Flow |
| `/welcome` | Transitional welcome surface before structured onboarding. | New visitor who clicked a softer "start" CTA. | Landing hero. | `/onboarding`. | Secondary Flow |
| `/onboarding` | Build initial investor profile, interests, watchlist seed, and LINE readiness. | New user ready to personalize IXAI. | Landing, welcome, share pages, account prompts. | `/account`. Secondary: `/pro-preview` after completion. | Core Flow |
| `/account` | AI Intelligence Workspace: identity, preferences, watchlist readiness, LINE, Pro interest. | Identified user, returning user, user after onboarding. | Onboarding completion, nav, login/account CTA. | Daily usage hub; LINE connection; Pro interest if relevant. | Core Flow |
| `/pro` | Explain IXAI Pro and capture Pro intent. | Higher-intent user evaluating future paid layer. | Landing secondary CTA, account Pro modules, footer/nav. | Join Pro waitlist or view preview. | Secondary Flow |
| `/pro-preview` | Show sample future Pro intelligence without implying live paid access. | Pro-curious user, high-intent lead. | `/pro`, landing secondary CTA, account/upgrade cards. | Join waitlist or return to public/account. | Secondary Flow |
| `/pro-intelligence` | Future gated Pro Intelligence shell. Demonstrates locked surfaces and entitlement model. | Internal/demo/high-intent user only. | Pro preview, gated cards, developer demos. | Join waitlist or view preview. | Future Flow |
| `/share` | Index of shareable intelligence samples. | Internal growth/testing, possibly social recipients who land on index. | Direct link, internal route. | Specific `/share/intelligence/*` or `/`. | Secondary Flow |
| `/share/intelligence/*` | Acquisition landing for a specific shareable intelligence concept. | Social/LINE recipient unfamiliar with IXAI. | Shared link from LINE/Facebook/Threads/X. | `/onboarding`. Secondary: `/pro-preview`; LINE optional. | Secondary Flow |
| `/liff` | LINE in-app identity/readiness entry. | LINE in-app browser users, future LIFF identity users. | LINE OA, LIFF URL, LINE login flow. | Account/onboarding/LINE readiness depending state. | Future Flow |

## CTA Audit

### High-Impact CTAs

| CTA | Page/Component | Target | Assessment |
| --- | --- | --- | --- |
| `開始建立我的 Intelligence Layer` | Landing hero | `/welcome` | Strong wording, but adds an extra step before onboarding. Consider routing directly to `/onboarding` or renaming `/welcome` as an onboarding intro. |
| `查看 Intelligence Preview` | Landing hero, welcome, onboarding completion, share pages | `/pro-preview` | Useful secondary CTA, but overexposed. It can pull new users away before they complete onboarding. |
| `加入 LINE 接收情報` | Landing hero | LINE OA URL | Useful but too early as a top-level hero CTA. Better as delivery/context CTA after user understands IXAI. |
| `設定我的 Intelligence Preferences` | Landing delivery section | `/onboarding` | Good, clear, aligned with habit-loop direction. |
| `開始 Onboarding` | Landing bottom, welcome, share page | `/onboarding` | Clear product action, should become canonical primary CTA. |
| `建立 Intelligence Layer` | `/pro` hero anchor | `#pro-waitlist` | Fine for Pro page, but conflicts with public onboarding meaning. |
| `開啟 AI Intelligence Workspace` | `/pro`, identify session card | `/pro-intelligence` | Risky: sounds like a live workspace but lands on future gated shell. Should be lower exposure. |
| `Join/加入 Pro Waitlist` | Pro surfaces | subscribe/waitlist | Appropriate on Pro pages, but should not be the primary CTA for brand-new users. |
| `連接 LINE 接收情報` | ConnectLineCard/account/pro surfaces | LINE/session connect | Good when contextualized as delivery setup. Confusing if mixed with consultation CTA. |
| `建立我的 Intelligence Layer` | Share CTA row | `/onboarding` | Excellent for acquisition share pages. |

### CTA Overload

1. `/` currently offers welcome, Pro preview, LINE, onboarding, LINE again, and Pro preview again. This is too many first-session decisions.
2. `/pro` offers waitlist, Daily Brief, Pro Preview, and Pro Intelligence. Pro should likely have one primary action and one secondary preview action.
3. `/pro-preview` contains identity session, LINE, delivery preview, waitlist, upgrade CTA, and sample dashboard. The page should answer "what is Pro?" before asking for multiple actions.
4. `/account` contains many valuable modules, but they compete: profile, LINE, delivery preferences, morning preview, Pro upgrade, watchlist, feedback.
5. `/share/intelligence/*` has three CTAs. This is acceptable for acquisition if visual hierarchy makes onboarding clearly primary.

### CTA Conflicts

- `建立 Intelligence Layer` can mean onboarding, waitlist, or account session depending page.
- `查看 Intelligence Preview` and `開啟 AI Intelligence Workspace` sound similar but land in different conceptual layers.
- `加入 LINE 諮詢` and `連接 LINE 接收情報` mix consultation with delivery identity. They should remain distinct.
- `Pro Preview`, `Pro Intelligence`, and `IXAI Pro` are three related but different ideas. Current exposure makes them feel like parallel products.

### CTA Loops

- `/` → `/welcome` → `/onboarding`, while `/` also offers direct `/onboarding` later.
- `/pro` → `/pro-preview` → waitlist/upgrade → `/pro` style loop.
- `/pro-preview` → `/pro-intelligence` → gated overlay → `/pro-preview`/waitlist loop.
- `/share/intelligence/*` → `/pro-preview` can bypass onboarding and then loop into Pro surfaces before the user has an identity profile.

### Potential Dead Ends

- `/liff` can be a dead end if LINE env/config is incomplete and the fallback does not clearly send users to onboarding/account.
- `/share` index is not a natural user destination unless used as a gallery; it should not be promoted in main nav.
- `/pro-intelligence` can feel like a locked product dead end if the user lands there before understanding preview vs Pro.

## User Journey Audit

### Case A: Completely New User From app.ixuan.ai

Current likely experience:

1. User sees a stronger landing than the old login gate.
2. User can understand IXAI is AI investment intelligence, not a broker or news site.
3. User immediately faces three large choices: build layer, preview, LINE.
4. Additional lower sections repeat onboarding, LINE, and preview.

Finding:

The landing now communicates value, but it still asks for too much too soon. A completely new user should see one clear next action:

```text
Start onboarding and build my intelligence layer.
```

Recommended primary path:

```text
/ → /onboarding → /account
```

### Case B: Investment-Interested New User

Current likely experience:

1. User understands the categories: market, watchlist, FCN, LINE delivery, Pro.
2. User may jump to Pro Preview because it looks more advanced.
3. User may not understand why account/onboarding matters before seeing Pro.

Finding:

This user should be guided to onboarding first, because the promise of IXAI depends on remembering markets, style, risk preference, and watchlist.

Recommended message:

```text
先建立你的市場輪廓，IXAI 才能把情報變成與你有關的 intelligence。
```

### Case C: Identified / Logged-In Returning User

Current likely experience:

1. User can reach `/account`, but it is not obviously the daily workspace.
2. Public content pages still feel like separate media surfaces.
3. The account page has many modules, but no singular "today's next action" hierarchy.

Finding:

Returning users need a daily home. For now, `/account` should be treated as "AI Intelligence Workspace" until a true daily workspace exists.

Recommended returning path:

```text
/account
→ check preferences/watchlist/LINE status
→ open daily/market intelligence as needed
```

## Simplification Proposal

### Recommended Core Flow

```text
1. Public Landing (/)
   Purpose: explain IXAI and create intent.
   Primary CTA: 開始建立 Intelligence Layer

2. Onboarding (/onboarding)
   Purpose: collect investor profile, interests, watchlist seed, LINE interest.
   Primary CTA: 完成並進入 AI Intelligence Workspace

3. Account (/account)
   Purpose: identity workspace and daily intelligence control center.
   Primary CTA: 設定 LINE / Delivery / Watchlist readiness.

4. Pro (/pro)
   Purpose: explain future paid layer and collect waitlist intent.
   Primary CTA: 加入 Pro 等候名單.

5. Pro Preview (/pro-preview)
   Purpose: sample-only proof of future Pro experience.
   Primary CTA: 加入 Pro 等候名單 or return to account.
```

### Pages To Move Out Of Main Flow

| Page | Recommendation | Reason |
| --- | --- | --- |
| `/welcome` | Keep temporarily, but reduce exposure or fold into `/onboarding`. | It adds one extra decision step between landing and activation. |
| `/share` | Keep, but do not place in main nav. | It is a growth/acquisition index, not core app navigation. |
| `/share/intelligence/*` | Keep as acquisition entry. | These pages are useful for social continuity and should route primarily to onboarding. |
| `/pro-intelligence` | Keep as Future Flow, lower exposure. | It is not a live product workspace yet and can confuse new users. |
| `/liff` | Keep as Future/LINE technical entry. | It should not be a main product destination. |

### CTAs To Keep

Canonical primary CTA:

```text
開始建立 Intelligence Layer
```

Canonical action CTA for onboarding:

```text
開始 Onboarding
```

Canonical secondary CTA:

```text
查看 Intelligence Preview
```

Canonical LINE delivery CTA:

```text
連接 LINE 接收情報
```

Canonical LINE consultation CTA:

```text
加入 LINE 諮詢
```

Canonical Pro CTA:

```text
加入 Pro 等候名單
```

### CTAs To Reduce Or Move Lower

- `開啟 AI Intelligence Workspace` when it links to `/pro-intelligence`; it overpromises a live workspace.
- Hero-level LINE CTA on `/`; move LINE to delivery section or account/onboarding context.
- `/pro` hero link to `/daily-brief`; useful but not aligned with Pro conversion.
- Repeated `查看 Intelligence Preview` in every section; keep once per page unless the page is long.

## UX Cohesion Findings

### High Priority

1. **Primary user path is not singular enough.**  
   `/` should push one main action: onboarding.

2. **Pro surfaces are exposed too early.**  
   `/pro-preview` and `/pro-intelligence` should support conversion, not compete with activation.

3. **CTA vocabulary is overloaded.**  
   "Intelligence Layer", "Preview", "Workspace", "Pro Intelligence", and "LINE Intelligence" are all valid, but need hierarchy.

4. **Account is not yet clearly positioned as the daily workspace.**  
   It contains many modules but should be described as the user's AI Intelligence Workspace.

5. **LINE consultation and LINE intelligence delivery are visually and semantically close.**  
   They must remain distinct: consultation is communication; delivery is future intelligence habit loop.

### Medium Priority

6. **`/welcome` may be redundant.**  
   It is useful as a soft landing but slows the intended path.

7. **Share pages have the right acquisition logic but too many equal-weight exits.**  
   Onboarding should dominate; preview and LINE should be secondary.

8. **`/pro-intelligence` can read as a broken locked dashboard.**  
   It should clearly say "future gated intelligence shell" and stay out of main user flow.

9. **Returning-user behavior is underdefined.**  
   Identified users need a clear daily destination: likely `/account` for now.

10. **Preview/sample language varies.**  
   Every sample-only Pro surface should use the same preview disclaimer and avoid sounding like live data.

### Low Priority

11. **Route count is high but manageable if route roles are explicit.**

12. **Some acquisition pages may not need public nav exposure.**

13. **Future delivery and Pro features should remain visible but not equal to core activation.**

## Recommended Next Implementation Order

No implementation is included in v1.40.2d. If approved later, the safest order is:

1. Make `/` primary CTA route directly to `/onboarding`; keep `/welcome` as secondary or remove from primary path.
2. Reduce hero CTAs on `/` to primary onboarding and secondary preview.
3. Reposition `/account` as the canonical AI Intelligence Workspace for identified users.
4. Lower exposure of `/pro-intelligence`; keep it linked only from Pro preview/gated contexts.
5. Standardize CTA labels across landing, onboarding, account, Pro, and share pages.
6. Split LINE wording into "LINE consultation" vs "LINE intelligence delivery" consistently.
7. Keep `/share/intelligence/*` as acquisition pages, with onboarding as the dominant next step.

## Product Principle

IXAI should not ask users to understand every layer at once.

The product should first earn the right to personalize:

```text
Understand IXAI
→ tell IXAI what you care about
→ let IXAI remember it
→ return daily
→ consider Pro
```

That is the simplest durable path from public awareness to future monetization.
