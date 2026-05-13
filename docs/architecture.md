# Architecture

WepSpec is a single-page Vite application built with React. The app is organized around a small set of typed data modules and pure build helpers, with the UI treating those helpers as the source of truth for compatibility and stats.

## Runtime Layers

- `src/App.tsx` owns selected platform, selected parts, active slot, search text, modal state, settings state, inspected part, and share-link status.
- `src/lib/build.ts` owns build behavior: starter selections, compatible part lookup, availability checks, tag aggregation, selection sanitizing, selected part lookup, stat deltas, and total stat calculation.
- `src/lib/share.ts` owns versioned share-code encoding/decoding. Imported builds are passed through `sanitizeSelections` before use.
- `src/data/armory.ts` owns catalog types and data for platforms, parts, slots, stats, prices, unlocks, tags, requirements, providers, and conflicts.
- `src/data/visuals.ts` owns preview anchors for each weapon profile.
- `src/data/assetManifest.ts` owns asset provenance and coverage.
- `src/data/gameAssets.ts` exposes app-friendly image lookup tables.

## UI Composition

- `WeaponPreview` renders the current weapon platform as a base image, selected parts as ordered layers, and clickable slot anchors as the interaction surface.
- `BuildSummary` presents installed parts, known total price, vendor counts, and missing-price tolerance.
- `PartInspector` presents the inspected part, fit state, first lock reason, stat deltas, vendor/unlock data, and apply/clear actions.
- `AssetImage` centralizes image rendering so local manifest assets and fallback content behave consistently.

## Compatibility Model

Compatibility is tag-driven. A platform starts with its own tags. Installed parts can add tags through `provides`, require tags through `requires`, restrict families through `platformTags`, and prevent pairings through `conflicts`.

The important rule is that UI code should not hand-code attachment chains. Add rails, adapters, muzzle threads, or platform families to the catalog, then let `checkAvailability`, `compatibleParts`, and `sanitizeSelections` enforce the rules.

## Preview Model

The preview is layered, not physically simulated. Each platform maps to a visual profile with:

- a base weapon render or fallback shape,
- an overall scale and vertical offset,
- one anchor per visible slot,
- a layer number used to order selected part artwork,
- a fallback shape for missing part art.

This keeps v1 predictable: catalog authors can add gameplay data without needing new art, while designers can improve specific weapon profiles as assets arrive.

## Share Payloads

Build links use `wsp1_` tokens. The encoded payload is JSON with:

- `version: 1`,
- `platformId`,
- `selections` keyed by slot.

Decoding rejects unknown versions, unknown platforms, malformed selections, and slot/part mismatches. Valid payloads are still sanitized, so stale or newly incompatible parts are removed with a warning.

## Validation

`npm run verify` runs `npm run validate:assets` and the Vitest suite. `npm run build` runs TypeScript project checks and the Vite production build. The asset validator imports the TypeScript asset manifest and catalog, then checks:

- required manifest fields,
- local source paths under `/assets/`,
- local file paths under `public/assets/`,
- missing files,
- declared PNG/WebP MIME types against file extensions and image headers,
- duplicate asset ids and duplicate coverage ids,
- platform and part coverage gaps,
- public image files missing from the manifest.

Coverage gaps are currently warnings because the catalog intentionally has more parts than local images.
