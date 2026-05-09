# Contributing

Thanks for helping with WepSpec. The short version: keep changes scoped, preserve provenance, and make data edits easy to review.

## Working Rules

- Check `git status` before editing so you do not overwrite another worker's changes.
- Keep implementation, catalog, asset, and documentation changes separated when possible.
- Prefer existing types and helper functions over one-off UI logic.
- Do not add local image files without updating `src/data/assetManifest.ts`.
- Do not remove attribution or source notes when replacing assets.
- Treat catalog values as prototype data unless they are tied to a clear source.

## Documentation Changes

Update the README when user-facing behavior changes. Update the deeper doc that owns the detail when architecture, catalog rules, asset policy, or release scope changes.

Useful docs:

- `docs/architecture.md`
- `docs/catalog-authoring.md`
- `docs/assets.md`
- `docs/release-v1.md`
- `public/assets/ATTRIBUTION.md`

## Catalog Changes

When changing `src/data/armory.ts`, keep ids stable unless there is a migration reason. If a part or platform changes compatibility, confirm that `requires`, `provides`, `platformTags`, and `conflicts` express the rule without special UI handling.

After catalog edits, run:

```bash
npm run build
```

## Asset Changes

Every local file under `public/assets/` needs a manifest entry. Use `coverage.mode` honestly:

- `exact`
- `representative`
- `shared-render`

Add `coverage.notes` for representative or shared coverage.

After asset edits, run:

```bash
npm run validate:assets
```

## Pull Request Checklist

- README or docs updated when behavior changed.
- Asset manifest updated for every local asset change.
- Attribution reviewed for new or replaced assets.
- `npm run validate:assets` passes.
- `npm run build` passes for release-facing changes.

