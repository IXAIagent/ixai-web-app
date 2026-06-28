# V12.1 Workspace Runtime Deadlock Investigation

## Status

V12.1 remains production-incomplete.

Production evidence later narrowed the issue:

- Service Worker / clear site data did not remove the hang.
- Settings and Copilot are the affected route pair.
- Intelligence is normal as a control route.

The active targeted fix is:

- `docs/V122_SETTINGS_COPILOT_RUNTIME_HANG_FIX.md`

Completion rule:

- Do not declare V12 complete until Settings / Copilot production manual verification passes after the targeted fix.
