# Backlog

This backlog tracks the practical path from the current prototype to a useful v1. Keep detailed rationale in `docs/`; keep this file focused on work that can be picked up.

## Now

- Improve compatibility explanations so missing rails, adapters, optic mounts, base plates, platform families, and blocked slots are named in player language.
- Add a per-build vendor requirement summary: highest required vendor/loyalty listing, unknown-source flags, and prototype-data warnings.
- Add optional owned-vendor-level filters without treating vendor levels as hard compatibility rules.
- Add one-click removal from the preview/slot UI for installed parts.
- Add screenshot smoke checks for rifle, pistol, precision, and shotgun previews at desktop and mobile widths.

## Next

- Expand source-backed catalog coverage for more weapons, parts, vendor listings, prices, unlocks, and stats.
- Add source date, patch context, and confidence metadata to catalog entries that affect gameplay decisions.
- Replace procedural placeholders in priority order: required-slot parts, optics/mounts, magazines, then tactical accessories.
- Add build comparison for recoil, ergonomics, ADS, weight, price, and vendor requirements.
- Improve saved-build workflows around naming, duplicate handling, import warnings, and local rebuild flow.

## Later

- Add a community correction workflow for catalog bugs, price updates, unlocks, and compatibility issues.
- Add role labels such as budget, suppressed, CQB, recce, and aesthetic without forcing a single meta ranking.
- Add richer mobile/touch interactions once the core desktop planner is stable.
- Consider a reviewed 3D preview only after rights-cleared model/art sourcing exists.

## Release Gates

- `npm run verify` passes.
- `npm run build` passes.
- Browser smoke test passes with no console errors.
- Asset validation warnings are reviewed and accepted in release notes.
- README, CHANGELOG, and v1 release notes are current.
- No unreviewed packaged game assets are extracted, copied, or redistributed.
