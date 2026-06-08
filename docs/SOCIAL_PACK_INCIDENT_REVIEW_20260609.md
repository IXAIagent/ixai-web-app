# Social Pack Incident Review — 2026-06-09

This document records the v1.82-v1.83.8d Social Pack / Weekly Export incident and the prevention rules that must govern future Social Pack work.

## Incident Summary

From v1.82.4 through v1.83.8d, IXAI repeatedly hotfixed Social Pack and Weekly Export behavior. The issue was not one isolated bug. It was a failure of QA scope, verification standards, and project governance.

The recurring pattern was:

- A fixture passed, build passed, or mobile smoke passed.
- The agent declared the issue fixed.
- Production still failed.
- The user provided production screenshots showing `Content quality: failed`, `Export eligible: false`, disabled Download PNG / Copy Caption / Export controls, or repeated Weekly Social Pack text.

This damaged trust because the AI agent repeatedly treated a local or partial signal as proof of production readiness. The incident must be remembered as a process correction, not as a normal sequence of successful hotfixes.

## What Went Wrong

Root cause was judged too early and too narrowly. The failure was successively attributed to quality guard scope, canonical source selection, renderer fallback, `Market Pulse` fallback, duplicate sentences, and narrative allocation. Each diagnosis explained one symptom, but none initially proved the whole Weekly Social Pack path.

Specific failures:

- Each patch solved a visible symptom without establishing a regression system that could prevent the next weekly source from failing.
- Fixture validation was treated as production truth, even though fixtures did not cover the actual production weekly source, review/canonical switching, rendered slide text, caption text, and export eligibility together.
- Build, lint, and mobile smoke checks were used as completion signals for a content/export workflow they cannot validate.
- Weekly Social Pack was not verified end to end across selected review source, same-week published canonical source, generator output, rendered slide text, quality guard, and export buttons.
- When Social Pack was still unstable, the project nearly shifted back to App / Pro work, increasing user frustration and context switching cost.
- Version naming fragmented from v1.82.x into v1.83.8d, making it harder to understand what had actually changed.
- The failed process was not written into governance docs soon enough.

## What Was Changed

The following changes were part of the stabilization attempt:

- v1.82.4 Quality Guard: added content quality checks to block placeholder, editor-pending, generic fallback, and repeated Social Pack content from formal export.
- v1.82.5 Narrative Rewrite: rewrote Daily / Weekly Social Pack narrative contracts to reduce placeholder output and make slides more period-specific.
- v1.82.7 Narrative Depth: introduced strategist-style narrative expectations, cross-market chain framing, and FCN-native intelligence language.
- v1.83.0 Extraction Layer: added an Intelligence Extraction Layer between Daily / Weekly Briefs and Social Packs.
- v1.83.2 Release Patch: tightened sentence dedupe, Weekly AI / Tech source selection, visible weekly chain grouping, and quality guard false positives.
- v1.83.3 Daily Export Unblock: narrowed quality scan scope so CTA, URL, fixed labels, and metadata did not incorrectly block Daily export.
- v1.83.4 Weekly Canonical Export Source: required Weekly formal export to use published canonical weekly source, not review / non-canonical draft source.
- v1.83.4b Fixture Validation: added fixture validation for selected review weekly plus same-week published canonical source.
- v1.83.4c Metadata Separation: separated selected source metadata from export source metadata in Weekly Social Pack UI.
- v1.83.5 Weekly Narrative Dedup: attempted to prevent repeated Weekly narrative sentences across cards.
- v1.83.6 MarketPulse Render Fallback: fixed renderer fallback labels that could create `Market Pulse / Market Pulse`.
- v1.83.8 Diagnostics: exposed structured quality diagnostics so failures showed issue type, slide id, offending text, matched rule, and source.
- v1.83.8b Weekly Sentence Allocation: added allocation constraints so the same sentence was not reused across Weekly cards.
- v1.83.8c Market Review Internal Dedup: targeted duplicate sentences inside the Weekly Market Review card.
- v1.83.8d Market Review Sentence Dedup: added sentence-level dedupe in Weekly market review body allocation.

## Actual Root Cause Pattern

Social Pack failures usually were not caused by one bad function. They emerged from an untested chain:

```text
Weekly source selection
→ selected review / canonical published relationship
→ weekly narrative extraction and allocation
→ renderer fallback labels
→ rendered slide text
→ caption text
→ quality guard diagnostics
→ export eligibility
→ actual Download PNG / Copy Caption controls
```

Weekly Social Pack is especially high risk because it depends on all of the following at once:

- canonical weekly source
- review revision state
- weekly source content shape
- Social Pack generator
- renderer output
- quality guard
- export eligibility
- production Admin UI behavior

Any future fix that validates only one layer is insufficient.

## New Governance Rule

Social Pack cannot be called done from build, lint, or mobile smoke alone.

Required rules:

- Social Pack changes require production-like regression.
- Weekly Social Pack must test selected review weekly plus same-week published canonical weekly.
- Weekly source selection must prove canonical export source selection.
- Selected source metadata and export source metadata must be visibly separated.
- Rendered slide text must be inspected, not only generated slide objects.
- Caption text must be inspected separately from slide text.
- `quality issues = 0` must be verified.
- `export eligible = true` must be verified.
- Download PNG must be enabled and the downloaded PNG must be visually checked.
- Copy caption must be enabled and the caption must be checked.
- If production screenshots show failure, do not attribute it to cache unless production HEAD SHA, route, rendered diagnostics, and actual issue text have been verified.
- Every Social Pack hotfix must update the incident log or governance docs. Do not leave only scattered version notes.
- Do not switch back to App / Pro mainline while Social Pack export remains blocked.

## Definition of Done

Social Pack / Weekly Export is complete only when all of the following are true:

- production HEAD SHA confirmed
- production Admin UI confirms `Content quality: passed`
- `Quality issues = 0`
- `Source eligible = true`
- `Export eligible = true`
- Export Current Pack enabled
- Download PNG enabled
- Copy caption enabled
- actual downloaded PNG visually checked
- same-week review/canonical case checked
- docs updated
- user confirms production result

Fixture pass, build pass, lint pass, and mobile smoke pass are supporting checks. They are not completion criteria.

## User Impact

This incident consumed user time, attention, and Codex token budget. The project lost momentum because the agent repeatedly overclaimed success before production proof existed.

The user had to provide screenshots, restate the same failure, and redirect the agent away from new features multiple times. That is not acceptable project stewardship.

Future AI agents must protect user time before proposing another hotfix. The correct posture is:

- verify before claiming
- show the actual failing diagnostic
- avoid speculative root-cause certainty
- update governance when a process failure is discovered
- stop feature work when the current release is not actually stable

## No-Touch Reminder

This incident review does not authorize new Social Pack code changes. It defines the governance required before future Social Pack work can be called complete.

Social Pack is a distribution asset. IXAI's core product remains the intelligence workflow: Daily / Weekly intelligence, account memory, future Portfolio / FCN monitoring, and Pro workflow. Distribution assets must not destabilize or distract from that core.
