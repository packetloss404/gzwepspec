# Art Pipeline Report

WepSpec's preview art is currently a hybrid of reviewed local renders, manifest-driven coverage, and procedural part placeholders. Keep that boundary explicit: the manifest records provenance, visual profiles position parts, and tests guard that previews remain coherent while the asset set is incomplete.

## Current Findings

- Explicit visual profiles cover every platform in the catalog, including platforms that still use procedural base silhouettes.
- The AR, AK, and Glock profiles use render-aligned anchors because their local weapon renders face the opposite direction from the original procedural fallback layout.
- Reviewed local art coverage is intentionally incomplete: 5 weapon platforms and 76 parts still fall back to representative renders or procedural shapes.
- Responsive framing is acceptable for the current app shell, but desktop and mobile screenshot baselines are still missing.

## Fixes In Place

- Base weapon renders and part renders resolve through manifest-derived lookup maps.
- Missing-art layers use slot-specific procedural silhouettes and a small proxy label, so fallback art is visible without pretending to be reviewed source art.
- `npm run build` runs `validate:assets` through `prebuild`, matching the architecture docs and preventing production bundles from skipping manifest checks.
- Data tests guard platform/profile mapping, anchor bounds, enabled slot coverage, known slot names, manifest path consistency, local coverage ids, and non-exact coverage notes.

## Tradeoffs

- Representative local renders keep the preview useful while avoiding unreviewed asset grabs, but they are not authoritative item art.
- Percent-based anchors are fast to tune and easy to review, but they are not a full attachment-socket rig. Fine-grained offsets will need per-asset metadata when art coverage grows.
- Procedural placeholders keep missing parts shippable, but they should be treated as UX placeholders rather than visual reference.

## Steam Install Discovery Boundary

Future local game install discovery should only locate the user's installed game directory or Steam library metadata for opt-in workflows. It must not extract game paks, scrape protected files, or auto-copy unlicensed assets into `public/assets/`.

Allowed v1-adjacent discovery work:

- detect whether Gray Zone Warfare appears installed through Steam library manifests,
- show the detected install path as diagnostic context,
- ask the user to provide separately reviewed or exported source images before adding local art,
- record provenance and coverage in `src/data/assetManifest.ts` for any accepted image.

Out of scope:

- pak extraction,
- runtime reads from game content archives,
- hidden ingestion of files from the local install,
- redistribution of Steam or game files without a source and terms review.

## Current QA Guards

- `src/data/visuals.test.ts` checks that every platform has an explicit profile, enabled slots are covered exactly once, anchors stay inside the preview stage, and reusable profile definitions do not grow duplicate slot anchors.
- `scripts/validate-assets.mjs` checks local manifest completeness, missing files, duplicate manifest ids, duplicate coverage ids, and unmanifested files in `public/assets/`.
- `src/data/assetManifest.test.ts` checks manifest path and MIME consistency, catalog coverage ids, non-exact coverage notes, and remote-only Steam media strategy.
- `WeaponPreview` reads renders through manifest-derived lookup maps and falls back to procedural shapes when reviewed art is missing.

## Review Checklist

- Map every new platform id in `weaponVisualProfiles` before adding it to the catalog.
- Confirm required and optional platform slots are visible in the active profile after `WeaponPreview` filters unsupported anchors.
- Keep anchor boxes fully inside the 0-100 percent stage coordinate system, including half-width and half-height extents.
- Prefer exact local renders. Use `representative` or `shared-render` only with plain-language `coverage.notes`.
- Keep placeholder shapes recognizable by slot: tubes for muzzles and shotgun magazines, tall shapes for grips and magazines, rail shapes for adapters and mounts.
- Check the preview at desktop and narrow widths whenever labels, meta text, or stage sizing changes.

## Next Steps

- Add Playwright screenshot smoke checks for one rifle, one pistol, one precision rifle, and one shotgun at desktop and mobile widths. These should verify that the stage is nonblank, anchors are clickable, and meta text does not wrap into neighboring content.
- Add a small fixture that selects one available part per enabled slot for each platform, then use it for both data tests and screenshot states.
- Extend the asset validator to report reviewed art coverage by slot and platform family, not only total missing part ids.
- Capture approved reference screenshots under `artifacts/preview-baselines/` once the visual treatment stabilizes.
- Replace procedural placeholders in priority order: required-slot parts first, then optics/mounts, then optional tactical accessories.
