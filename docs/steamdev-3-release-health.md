# SteamDev-3 Release Health

Run date: 2026-05-12 America/Chicago

## Findings

- `npm run verify` and `npm run build` are currently green.
- `npm run verify` covers asset manifest validation plus Vitest. The passing run covered 5 test files and 27 tests.
- `npm run build` now invokes `prebuild`, so asset validation runs before TypeScript and Vite production bundling.
- Asset validation still reports expected v1 coverage warnings: 5 weapon platforms and 76 of 92 parts do not have reviewed local manifest coverage.
- The worktree contains many in-progress edits from other contributors, especially the PNG-to-WebP asset migration, preview UI work, package metadata, and new tests. Those were not reverted.

## Fixes Applied

- Hardened `scripts/validate-assets.mjs` so local PNG/WebP manifest entries are checked against file headers, not only paths and declared MIME types.
- Added explicit TypeScript return types in `src/lib/share.ts` so recursive share URL parsing passes `tsc -b`.
- Tightened `src/components/BuildSummary.tsx` price typing around base-platform pricing, preserving the base weapon in totals and vendor summaries.
- Updated release and architecture docs so v1 acceptance checks call `npm run verify` before `npm run build`, and validation docs mention image-header checks.

## Remaining Risks

- Asset coverage is intentionally incomplete for v1. Missing local coverage should remain visible in release notes and QA because placeholders are part of the current product surface.
- Automated visual QA is still missing. Playwright screenshot smoke checks for rifle, pistol, precision rifle, shotgun, desktop, and mobile states should be added before a broader release.
- Asset provenance is documented, but license status is not automatically verified.
- `npm run verify` does not run `tsc -b`; build remains the authoritative type-safety gate.

## v1 Checklist

- [x] Asset manifest validates without blocking errors.
- [x] Unit/data/share tests pass.
- [x] TypeScript project build passes.
- [x] Vite production bundle builds.
- [x] Build runs asset validation via `prebuild`.
- [x] Release docs call out incomplete prototype catalog and artwork.
- [ ] Manual smoke test through `npm run dev`: switch all platforms, apply all presets, inspect locked parts, test rail unlocks, reload a share link, and confirm missing art fallbacks.
- [ ] Add automated screenshot smoke checks for preview states.
- [ ] Decide whether the known asset coverage warnings are acceptable for the v1 tag or require a minimum reviewed-art threshold.
