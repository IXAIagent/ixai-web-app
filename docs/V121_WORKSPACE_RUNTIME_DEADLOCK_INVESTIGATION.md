# V12.1 Workspace Runtime Deadlock Investigation

## Status

This document records the V12.1 deadlock investigation status on `main`.

V12.1 remains production-incomplete. Production `https://app.ixuan.ai` still reports Chrome Renderer HUNG / `RESULT_CODE_HUNG` on Settings, Copilot, and Intelligence route-switch stress after PR #79 and PR #80.

V12.2 supersedes this investigation for root-cause evidence capture:

- `docs/V122_PRODUCTION_RUNTIME_ROOT_CAUSE_INVESTIGATION.md`

## V12.1 Findings Carried Forward

- Local production-like QA can pass while production still hangs.
- The crash is not proven to be a normal React throw.
- The crash is not proven to be only Supabase 401/404 behavior.
- Service Worker / stale cache / production-only app shell behavior remains a leading suspect.
- Next.js production runtime, RSC/Flight navigation, React render/effect loops, and main-thread CPU/memory pressure remain open suspects.
- Settings is high risk because it mounts many diagnostics surfaces.
- Copilot and Intelligence remain affected by route switching and shared Workspace runtime paths.

## V12.2 Required Next Step

Do not ship another guessed fallback as the next move.

Capture at least one concrete production evidence source before implementing a fix:

- Chrome Performance trace.
- Runtime diagnostics top key before hang.
- Network waterfall showing loop/stall.
- Service Worker disabled/unregistered result.
- Incognito clean-profile result.
- Different browser result.
- Preview deployment comparison.
- Production deployment commit/asset verification.

## Completion Rule

V12.1 must not be marked complete until production route-switch stress passes on `app.ixuan.ai` after the confirmed root-cause fix.
