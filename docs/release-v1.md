# v1 Release Scope

The v1 release should be a focused, honest armory planner: build a weapon, understand compatibility, inspect stats and source limitations, and share a configuration.

Community research reinforces that v1 should prioritize explanation over breadth. Players are asking for a tool that tells them why a part fits or fails, where it comes from, what vendor level it needs, how the stats change, and how to share or rebuild the result without buying parts blindly in-game.

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
- Manual rail-position simulation, freeform 3D gunsmith placement, or physical weapon modeling beyond the existing layered preview.
- Meta ranking, build upvotes, public build galleries, or account-backed community publishing.

## Economy And Vendor Needs

- Build totals should count the base weapon plus installed parts when prices are known.
- Vendor summaries should preserve loyalty-level labels, because players plan around required trader rep as much as raw price.
- Higher-loyalty parts may remain mountable in the planner, but UI copy should describe them as listings rather than hard locks unless player-owned vendor levels are modeled.
- Price and unlock values are prototype hints until a sourced catalog pass verifies each in-game vendor, loyalty level, task gate, and currency.
- v1 should support pasted share URLs and raw share codes so builds can move cleanly between chat, browser, and saved local presets.
- If vendor-level filters land, they should be optional planner filters rather than hard compatibility rules. A player may still want to design a future build above their current reputation.
- Catalog entries should prefer source dates and patch context where known, because official updates continue to change vendor stocks, economy, compatibility, highlighting, and stat calculations.

## Community-Prioritized Roadmap

Highest confidence for v1:

- Improve compatibility reasons so missing rails, adapters, optic mounts, base plates, platform families, and blocked slots are named in plain language.
- Add vendor/reputation planning: per-build highest required vendor level, unknown-source flags, and optional filters by owned vendor levels.
- Keep share URLs stable and make local rebuild workflows easy through presets or saved builds.
- Improve visual usability: selected-slot clarity, one-click part removal, background contrast, and mobile/touch behavior.
- Publish catalog limitations directly in release notes so players know which prices, unlocks, stats, and assets still need verification.

Good follow-ups after v1:

- Broader sourced catalog coverage for more platforms and weapon parts.
- Community correction workflow for prices, unlocks, stats, and compatibility bugs.
- Build comparison mode for recoil, ergonomics, MOA, RPM, weight, price, and vendor requirements.
- Optional role labels such as budget, suppressed, CQB, recce, and aesthetic/drip without forcing a single meta ranking.

## Acceptance Checks

Before cutting v1:

```bash
npm run verify
npm run build
```

Then smoke-test:

- load the app through `npm run dev`,
- switch through all platforms,
- apply each intent preset,
- select a locked part and confirm the lock reason is visible,
- confirm a missing rail/adapter/mount reason is understandable without reading catalog tags,
- add a rail or mount and confirm newly compatible parts unlock,
- remove a single installed part from the preview or slot UI without clearing the full build,
- copy a share link and reload it,
- open `/assets/ATTRIBUTION.md` from the settings menu,
- confirm missing art falls back cleanly instead of breaking layout.

## Release Notes

Use this short form for v1 notes:

- WepSpec v1 ships a layered Gray Zone Warfare weapon builder prototype.
- Compatibility is calculated from catalog tags rather than hardcoded slot exceptions.
- Builds can be shared through versioned URLs.
- Local assets are manifest-backed with attribution and validation.
- Vendor, price, unlock, and fit details are shown where known so players can plan before buying parts in-game.
- Catalog and artwork are incomplete prototype data and should be verified before gameplay-critical use.
