# Changelog

All notable project changes should be recorded here. Dates use the local project timezone.

## Unreleased

- No pending unreleased changes.

## 0.1.0 - 2026-05-13

### Added

- Layered 2D weapon preview with platform-specific anchor maps, clickable slots, selected part layers, and procedural placeholders for missing art.
- Weapon platform and part catalog for the current prototype, including compatibility tags, stat deltas, prices where known, vendor/loyalty hints, presets, and shareable build URLs.
- Build workbench with part inspection, build summary, known-price totals, vendor grouping, save/import controls, and stale-build sanitization.
- Manifest-backed local/remote asset lookup, attribution notes, and asset validation.
- Tests for build compatibility, build presets, share/import handling, asset-manifest integrity, and preview-profile integrity.
- Documentation for architecture, catalog authoring, assets, art pipeline, publication readiness, v1 release scope, and community research.
- Public-readiness guardrails that mark the app as unofficial and prevent overclaiming asset rights.

### Changed

- Renamed local prototype renders from `.png` to `.webp` to match their actual file format.
- Hardened production builds so `npm run build` runs asset validation before TypeScript/Vite build.
- Improved preview and inventory visuals: denser part cards, clearer platform art, calmer sockets/glow, readable proxy states, and mobile-friendly layout.
- Improved build economy handling so known totals include the base weapon plus installed parts.
- Improved share/import so pasted build URLs and raw share codes are both accepted.
- Made vendor/loyalty levels informational planner data rather than hidden hard compatibility locks.

### Fixed

- Prevented AKM 7.62x39 magazines from fitting AK-74N/Vityaz-style platforms.
- Moved muzzle-thread capability from bare platforms to barrels so muzzle devices depend on the correct barrel chain.
- Fixed preview anchor bounds and added tests to catch off-stage anchors.
- Fixed type/build issues in share parsing and price summary typing.

### Known Limitations

- Reviewed local art coverage is incomplete: the validator currently warns about 5 weapon platforms and 76 of 92 parts without exact local render coverage.
- Prices, vendor unlocks, stats, and compatibility remain prototype data until verified against source-dated in-game or trusted community references.
- Preview placement is a tuned 2D anchor system, not a physics-accurate or full 3D gunsmith.

## 0.0.3 - 2026-05-12

### Changed

- Cleaned up primary navigation, copy, terminology, settings behavior, and top-level UI polish.
- Removed unused Three.js/GunModel code and dependencies.
- Added shared formatting helpers and safer selection/share validation.
- Clarified asset provenance language and release risks.

## 0.0.2 - 2026-05-12

### Added

- Advanced the app toward v1 with saved builds, share URLs, asset manifest coverage, improved weapon preview, and focused docs.

## 0.0.1 - 2026-05-12

### Added

- Initial WepSpec armory builder prototype.
