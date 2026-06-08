# v1.83.3 — Social Pack Export Unblock Fix

## Root Cause

v1.82.4 added a necessary Social Pack quality guard to prevent placeholder, editor-pending copy, generic fallback, and duplicate narrative from being exported as official PNG/caption assets.

After v1.83.0/v1.83.2, generated Daily and Weekly packs could pass the narrative source rules but still show:

- `Content quality: failed`
- `Quality issues: 2`
- `Export eligible: false`
- `Export disabled`

The blocker was too broad: the quality scan included caption, CTA label, fixed source labels, footer/disclaimer style text, and attribution-like repeated strings. Those are valid export metadata, not narrative content.

## Fixed Scan Scope

The quality guard now scans only Social Pack narrative content:

- slide title
- slide subtitle
- slide bullets
- core narrative text

The guard no longer uses the following as quality-blocking narrative text:

- `pack.cta.href`
- URLs
- footer
- disclaimer
- source attribution
- caption CTA/footer
- fixed section labels
- slide eyebrow
- `I-Xuan View`
- `一玄觀點`
- `I-Xuan Weekly View`
- `Weekly Intelligence`
- `Daily Brief`

## Duplicate Detection Changes

Duplicate sentence detection now checks only slide body text:

- slide subtitle
- slide bullets

It no longer compares:

- CTA vs caption
- source title vs attribution
- fixed labels
- URL / slug / `app.ixuan.ai`
- slide eyebrow / section label
- footer/disclaimer text

This keeps true repeated narrative blocked while avoiding false positives from repeated export metadata.

## Export Eligibility Rule

Export is allowed when all are true:

- source period guard passes
- Weekly canonical guard passes when active period is Weekly
- source is not fallback
- narrative body has no placeholder/editor-pending copy
- narrative body has no `Watch 1 / Watch 2 / Watch 3`
- narrative body has no `Market Pulse / Market Pulse`
- narrative body has no empty card or true repeated body sentence

If quality fails, preview is still allowed, but official export remains disabled:

- Export Current Pack
- Download PNG
- Copy caption

## Before / After

Before:

- Valid generated packs could be blocked because caption/CTA/footer/source metadata repeated.
- Download PNG and Copy caption remained disabled even when the cards themselves were acceptable.

After:

- Export quality is judged by card narrative content only.
- Metadata can repeat naturally without blocking official export.
- Real placeholder and generic narrative problems remain blockers.

## QA Checklist

- Daily pack with clean card body can become export eligible when source guard passes.
- Weekly published canonical pack with clean card body can become export eligible when source guard passes.
- Review/non-canonical Weekly source remains blocked by v1.82.3 canonical guard.
- Fallback source remains preview-only.
- `具體事件待 editor 審閱` remains blocked.
- `Watch 1 / Watch 2 / Watch 3` remains blocked.
- `TBD`, `TODO`, `placeholder`, `fallback` remain blocked when in narrative body.
- `Market Pulse / Market Pulse` remains blocked when in narrative body.
- URLs, captions, CTA text, source labels, and footer/disclaimer do not create duplicate blockers.

## Known Limitations

This version does not rewrite the Social Pack narrative generator. It only fixes false-positive export blocking in the quality guard. If the card body itself is weak, placeholder-like, or off-topic, export should still be blocked and the generator should be improved separately.
