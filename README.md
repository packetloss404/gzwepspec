# WepSpec Armory

WepSpec is a React + Three.js/Vite prototype for planning Gray Zone Warfare weapon builds. The current preview is a layered 2D armory workbench: a base weapon render sits under slot anchors and compatible part layers, while the surrounding UI shows fit status, stat changes, vendor/pricing hints, share links, and asset provenance.

This project is a fan-made planning aid. It is not affiliated with MADFINGER Games, and the starter catalog should be treated as prototype data until verified against an in-game export or curated source set.

## Current Scope

- Select weapon platforms and install compatible parts by slot.
- Calculate compatibility from platform tags, required tags, provided tags, and slot conflicts.
- Sanitize stale or invalid selections when switching platforms or importing shared builds.
- Preview builds with layered local weapon/part renders plus procedural fallbacks for missing art.
- Apply quick build intents: Factory, Assault, Recce, and Suppressed.
- Copy and load versioned build share URLs.
- Show build summary, known prices, vendors, unlock hints, installed tags, and first lock reason.
- Validate the local asset manifest before production builds.

## Commands

```bash
npm install
npm run dev
npm run validate:assets
npm run build
npm run preview
```

- `npm run dev` starts Vite on `http://127.0.0.1:5173`.
- `npm run validate:assets` checks local files against `src/data/assetManifest.ts`.
- `npm run build` runs asset validation, TypeScript project build, and Vite production build.
- `npm run preview` serves the production build locally.

## Project Map

- `src/App.tsx` - main armory shell, platform/slot state, search, intent presets, share UI.
- `src/components/WeaponPreview.tsx` - layered preview stage, slot anchors, selected part layers.
- `src/components/BuildSummary.tsx` - installed part summary, known price totals, vendor grouping.
- `src/components/PartInspector.tsx` - selected part details, compatibility reason, stats, pricing.
- `src/components/AssetImage.tsx` - image rendering helper with manifest-aware fallback behavior.
- `src/data/armory.ts` - weapon platforms, parts, slots, stats, unlocks, prices, compatibility tags.
- `src/data/visuals.ts` - weapon preview anchors and layer positions.
- `src/data/assetManifest.ts` - canonical local and remote asset provenance manifest.
- `src/data/gameAssets.ts` - app-facing asset lookup tables derived from the manifest.
- `src/lib/build.ts` - compatibility, sanitization, starter selections, stat aggregation.
- `src/lib/share.ts` - versioned share-code encode/decode helpers.
- `scripts/validate-assets.mjs` - manifest/file coverage validation used by `prebuild`.
- `public/assets/` - local prototype renders and attribution notes.

## Documentation

- [Architecture](docs/architecture.md)
- [Catalog Authoring](docs/catalog-authoring.md)
- [Asset Provenance](docs/assets.md)
- [v1 Release Scope](docs/release-v1.md)
- [Community Research Notes](docs/community-research.md)
- [Contributing](CONTRIBUTING.md)
- [Asset Attribution](public/assets/ATTRIBUTION.md)

## v1 Direction

The v1 line should keep the app useful as a focused build planner rather than a full game database. Priorities are stable compatibility behavior, a documented catalog format, honest provenance, and a shippable UI for building, inspecting, sharing, and validating weapon configurations.

