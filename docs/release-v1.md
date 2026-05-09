# v1 Release Scope

The v1 release should be a focused, honest armory planner: build a weapon, understand compatibility, inspect stats and source limitations, and share a configuration.

## In Scope

- Layered weapon preview with clickable slot anchors.
- Platform switching with sanitized starter selections.
- Required and optional slot support.
- Tag-based compatibility for platform families, rails, adapters, muzzle threads, calibers, providers, requirements, and conflicts.
- Stash search and locked-part reasons.
- Part inspector with fit state, stat deltas, vendor, price, unlock, and notes where known.
- Build summary with known price total and missing-price tolerance.
- Intent presets for Factory, Assault, Recce, and Suppressed builds.
- Versioned share URLs with stale-build sanitization.
- Manifest-backed local asset provenance and build-time validation.
- Documentation for architecture, catalog authoring, assets, contribution rules, and release limitations.

## Out Of Scope

- Full in-game item database parity.
- Player accounts, saved cloud builds, squad collaboration, or persistence beyond share URLs.
- Live market/vendor data.
- Hotlinking community wiki images at runtime.
- Automated license verification.
- Physics-accurate or fully 3D part placement.
- Guaranteed exact item art for every catalog entry.

## Acceptance Checks

Before cutting v1:

```bash
npm run validate:assets
npm run build
```

Then smoke-test:

- load the app through `npm run dev`,
- switch through all platforms,
- apply each intent preset,
- select a locked part and confirm the lock reason is visible,
- add a rail or mount and confirm newly compatible parts unlock,
- copy a share link and reload it,
- open `/assets/ATTRIBUTION.md` from the settings menu,
- confirm missing art falls back cleanly instead of breaking layout.

## Release Notes

Use this short form for v1 notes:

- WepSpec v1 ships a layered Gray Zone Warfare weapon builder prototype.
- Compatibility is calculated from catalog tags rather than hardcoded slot exceptions.
- Builds can be shared through versioned URLs.
- Local assets are manifest-backed with attribution and validation.
- Catalog and artwork are incomplete prototype data and should be verified before gameplay-critical use.

