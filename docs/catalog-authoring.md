# Catalog Authoring

The catalog lives in `src/data/armory.ts`. Keep data changes typed, explicit, and sourceable. WepSpec v1 should prefer clear prototype values over pretending the catalog is complete.

## Platforms

Add platforms to `platforms` with:

- stable `id`,
- player-facing `name`, `family`, `caliber`, and `role`,
- source/vendor information,
- optional `unlock`, `price`, and `skins`,
- base compatibility `tags`,
- complete `baseStats`,
- `requiredSlots` and `optionalSlots`.

Required slots are part of the baseline build. Optional slots are displayed and can be empty. If a platform supports a slot in-game but v1 lacks enough data to model it, leave it out and note the limitation in release docs or source notes.

## Parts

Add parts to `parts` with:

- stable `id`,
- player-facing `name`,
- one `slot`,
- `type`, `vendor`, and optional `unlock` or `price`,
- descriptive `tags`,
- optional `platformTags`,
- optional `requires`, `provides`, and `conflicts`,
- stat deltas in `stats`,
- optional `notes`, `color`, and `skins`.

`slot` determines where the part can be installed. A part should not appear in multiple slots; create separate records if the game exposes distinct install positions.

## Tags

Tags are the compatibility language. Use short snake-case strings that describe mechanical capabilities rather than UI concepts.

Common patterns:

- Platform family: `ar15`, `ak`, `glock`, `bolt_action`.
- Caliber or ammo family: `nato556`, `russian762`, `nine_mm`.
- Thread or mount capability: `thread_1_2x28`, `upper_picatinny`, `bottom_picatinny`, `m_lok_6`.
- Adapter outputs: `side_picatinny`, `offset_light_mount`.

Use `requires` when a part needs an existing capability. Use `provides` when installing a part unlocks a capability for later parts. Use `platformTags` when a part is family-specific even if the required tags are otherwise present.

## Stats

Stats use the keys in `StatKey`:

- `ergonomics`
- `recoil`
- `accuracy`
- `weight`
- `velocity`
- `ads`

The app knows whether higher or lower is better through `statDirection`. Keep deltas relative to the current prototype scale. If a value is estimated, prefer a conservative rounded number and leave a `notes` field explaining why.

## Prices And Unlocks

Prices are optional. Missing prices should not block a build or crash summaries. Use:

```ts
price: { amount: 790, currency: "USD" }
```

Unlocks are also optional. Use:

```ts
unlock: { vendor: "Gunny", level: 2, task: "Close-quarters supply chain" }
```

Vendor strings on parts can include loyalty level when that is the clearest display value, such as `Gunny LL2`. The structured `unlock` object is preferred when known.

## Visual And Asset Follow-Up

Catalog data and preview data are separate:

- Add gameplay records in `src/data/armory.ts`.
- Add preview anchors in `src/data/visuals.ts` only when a new platform needs a tailored layout.
- Add local image coverage in `src/data/assetManifest.ts` when a local render is added.
- Leave a part without image coverage if no reviewed asset exists; the preview will use procedural fallback shapes.

After editing catalog or asset data, run:

```bash
npm run validate:assets
npm run build
```

