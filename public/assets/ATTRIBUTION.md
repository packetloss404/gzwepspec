# Asset Attribution

WepSpec uses manifest-backed asset attribution. The canonical per-asset inventory is `src/data/assetManifest.ts`; this file summarizes the policy for local files served from `public/assets/`.

## Local Prototype Renders

Weapon and part inspect renders currently stored in this folder were sourced from the Gray Zone Warfare Wiki on Fandom.

- Source: https://gray-zone-warfare.fandom.com/
- Fandom community content is generally available under CC-BY-SA unless otherwise noted.
- Gray Zone Warfare and its game artwork belong to MADFINGER Games.
- Local copies are used for prototype UI rendering reliability instead of hotlinking Fandom CDN image URLs.

## Remote Official Media

Official Gray Zone Warfare Steam store images are referenced remotely from `src/data/assetManifest.ts` and are not redistributed in this folder.

- Source: https://store.steampowered.com/app/2479810/Gray_Zone_Warfare/
- Owner: MADFINGER Games.
- Strategy: keep remote unless a future reviewed ingestion step stores local copies with attribution.

## Per-Asset Manifest Policy

Every local image under `public/assets/` must be listed in `src/data/assetManifest.ts` with:

- file path and public URL,
- source URL and owner,
- terms or license note,
- covered platform or part ids,
- coverage mode of `exact`, `representative`, or `shared-render`,
- notes for any non-exact coverage.

Files without manifest entries should be treated as incomplete and should not ship in a release.

## Known Limitations

- The current asset set is incomplete and supports prototype display only.
- Some part renders are representative or shared across multiple catalog items.
- The manifest records provenance but does not automatically verify license status.
- Community wiki pages and CDN URLs can change over time.
- Missing catalog art should fall back to procedural preview shapes until reviewed assets are available.

