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

Official Gray Zone Warfare Steam media is referenced remotely through `assetManifest.remote.gameMedia`. Current policy is to keep those assets remote unless a future ingestion step stores reviewed local copies with attribution.

Remote media still needs attribution. It should not be copied into `public/assets/` without a deliberate manifest update and a source/terms review.

## Attribution Requirements

Each asset attribution must capture:

- source name,
- source URL,
- owner,
- terms or license note,
- optional implementation notes.

For Fandom-derived renders, the current project note is that community content is generally CC-BY-SA unless otherwise noted, while Gray Zone Warfare game artwork remains owned by MADFINGER Games.

## Validation

Run:

```bash
npm run validate:assets
```

The validator fails for incomplete local entries and missing files. It warns for coverage gaps and unmanifested public image files. Warnings are allowed for v1 because the catalog intentionally has broader part coverage than reviewed local art.

## Known Limitations

- Local renders are prototype UI copies, not an authoritative official asset pack.
- Several catalog parts use procedural preview fallbacks because reviewed item art is unavailable.
- Some local part renders are representative or shared across related parts.
- Remote Steam URLs may change because they are external store media links.
- The manifest documents provenance but does not grant additional rights beyond the source terms.
- The current validator checks manifest consistency; it does not verify license status automatically.

