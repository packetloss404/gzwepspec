# Asset Attribution

WepSpec uses manifest-backed asset attribution. The canonical per-asset inventory is `src/data/assetManifest.ts`; this file summarizes the policy for local files served from `public/assets/`.

## Local Prototype Renders

Weapon and part inspect renders stored in this folder were gathered from public Gray Zone Warfare Wiki pages on Fandom for prototype display. They should be treated as rights-sensitive review material, not as a reusable asset pack.

- Source: https://gray-zone-warfare.fandom.com/
- Fandom pages may include community content under CC-BY-SA, but that does not by itself confirm rights for embedded game artwork or screenshots.
- Gray Zone Warfare and its game artwork belong to MADFINGER Games.
- Local copies are used for prototype UI rendering reliability instead of hotlinking Fandom CDN image URLs.
- Do not extract, upload, or redistribute packaged Gray Zone Warfare game files through this project.

## Remote Official Media

Official Gray Zone Warfare Steam store images are referenced remotely from `src/data/assetManifest.ts` and are not redistributed in this folder.

- Source: https://store.steampowered.com/app/2479810/Gray_Zone_Warfare/
- Owner: MADFINGER Games.
- Strategy: keep remote unless a future reviewed ingestion step stores local copies with attribution and a source/terms review.
- Note: Steam source provenance is not permission to redistribute the media.

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
- Public releases should replace, remove, or explicitly rights-review local copied renders before distribution.
- Community wiki pages and CDN URLs can change over time.
- Missing catalog art should fall back to procedural preview shapes until reviewed assets are available.
