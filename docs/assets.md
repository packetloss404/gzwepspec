# Asset Provenance

WepSpec uses a manifest-first asset policy. Local files may live in `public/assets/`, but `src/data/assetManifest.ts` is the canonical inventory for what each file is, where it came from, who owns it, and which armory records it represents.

## Manifest Policy

Every local image under `public/assets/` must have a matching `assetManifest.local` entry with:

- stable manifest `id`,
- `category` of `weapon` or `part`,
- display `label`,
- public `src` beginning with `/assets/`,
- `localPath` beginning with `public/assets/`,
- `mimeType`,
- `attribution`,
- `coverage.armoryIds`,
- `coverage.mode`,
- optional `coverage.notes`,
- optional descriptive `tags`.

Do not add local image files without manifest entries. Do not reference local assets directly from components when a manifest lookup exists.

## Coverage Modes

- `exact` means the image represents the named armory record directly.
- `representative` means the image is close enough for prototype display but not the exact item.
- `shared-render` means one image intentionally covers multiple armory records.

Use `coverage.notes` whenever coverage is not exact. The note should explain the approximation in plain language.

## Remote Media

Official Gray Zone Warfare Steam media is referenced remotely through `assetManifest.remote.gameMedia`. Policy is to keep those assets remote unless a future ingestion step stores reviewed local copies with attribution and source/terms notes.

Remote media still needs attribution. Source provenance confirms where the URL came from; it does not grant permission to redistribute the media. Steam media should not be copied into `public/assets/` without a deliberate manifest update and a source/terms review.

Do not use Steam store media as WepSpec branding. It may identify the game context and link users to the store page, but the surrounding copy must keep WepSpec's unofficial status clear.

## Attribution Requirements

Each asset attribution must capture:

- source name,
- source URL,
- owner,
- terms or license note,
- optional implementation notes.

For Fandom-derived renders, the project note should say that Fandom pages may include CC-BY-SA community content, but embedded game artwork or screenshots may have separate rights. Gray Zone Warfare game artwork remains owned by MADFINGER Games.

Do not extract or distribute packaged Gray Zone Warfare game files. If an image cannot be tied to a public source and a documented rights decision, use a procedural placeholder or original project-created art instead.

## Validation

Run:

```bash
npm run verify
```

`npm run verify` runs the asset validator and tests. The asset validator fails for incomplete local entries and missing files. It warns for coverage gaps and unmanifested public image files. Warnings are allowed for v1 because the catalog intentionally has broader part coverage than reviewed local art.

Preview-specific QA lives in [Art Pipeline](art-pipeline.md). Keep visual profile tests updated with any slot, platform, or anchor model changes.

## Known Limitations

- Local renders are prototype UI copies, not an authoritative official asset pack, and not permission to redistribute the underlying game artwork.
- Several catalog parts use procedural preview fallbacks because reviewed item art is unavailable.
- Some local part renders are representative or shared across related parts.
- Remote Steam URLs may change because they are external store media links.
- The manifest documents provenance but does not grant additional rights beyond the source terms.
- The current validator checks manifest consistency; it does not verify license status automatically.
