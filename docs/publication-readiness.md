# Publication Readiness

WepSpec can be shared publicly only if it stays clearly positioned as an unofficial fan planning aid and avoids distributing unreviewed game assets.

## Positioning Rules

- Use "fan-made", "unofficial", "prototype", and "planning aid" for WepSpec.
- Do not describe WepSpec as official, partnered, authorized, endorsed, or affiliated with MADFINGER Games, Valve, or Steam.
- Use "Gray Zone Warfare" only to identify the game being planned for. Do not imply ownership of the game, artwork, marks, store assets, or community wiki content.
- Keep Steam store media remote and label it as Steam store media, not as WepSpec branding.
- Treat catalog stats, prices, vendors, and unlocks as prototype data unless each value has a source note or in-game verification trail.

## Asset Rules

- Do not extract or distribute packaged Gray Zone Warfare game assets.
- Do not copy Steam CDN media into `public/assets/`.
- Do not add local wiki, screenshot, or game-art renders unless the manifest records source, owner, terms notes, coverage mode, and a reviewer decision.
- Prefer procedural placeholders or original project-created art when exact reviewed item art is unavailable.
- Before a public v1 release, either remove local copied renders or document a rights decision for each retained file.

## Public Repo Checklist

- README includes the unofficial fan-project disclaimer.
- `public/assets/ATTRIBUTION.md` and `src/data/assetManifest.ts` agree on source and rights notes.
- `npm run validate:assets` passes with no missing manifest entries.
- `npm run build` passes.
- No packaged game files, extracted archives, datamined files, or generated asset dumps are present.
- Release notes state that WepSpec is incomplete prototype data and not gameplay authority.
- Repository licensing is explicit before accepting external contributions.

## Source Notes

- The Steam store identifies Gray Zone Warfare as a MADFINGER Games title: https://store.steampowered.com/app/2479810/Gray_Zone_Warfare/
- Fandom states that wiki text is generally CC-BY-SA, but contributors should only upload material they own/control or have compatible rights to: https://www.fandom.com/licensing
- WepSpec's current community/product notes also reference public player requests and adjacent community tools in [Community Research](community-research.md).
