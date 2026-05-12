# Community Research Notes

These notes capture public feedback that can shape WepSpec builder UX. They are intentionally short so the product decisions stay tied to the linked sources.

## Requests to Support

- Save and quickly re-apply full weapon builds. One linked Reddit suggestion asks for a blueprint system because rebuilding configurations is click-heavy.
- Share builds outside the app. The sampled community threads compare the desired experience to a gunsmith/loadout builder and ask for comprehensive weapon/part references.
- Explain compatibility. Players call out confusion around which rails, adapters, mounts, and platform families are needed before an attachment will fit.
- Summarize vendors and prices. Sampled community database work includes item price/detail collection, and forum posts discuss whether vendor builds or individual parts are cheaper.

## Product Implications

- Presets should be platform-scoped, sanitize stale or incompatible parts on apply, and return warnings rather than failing silently.
- Share codes should contain the platform id plus slot-to-part selections, then run through the same compatibility sanitizer when imported.
- Build summaries should tolerate missing prices until a richer catalog lands, while still exposing vendor counts and known price totals.
- Part inspection should show fit status, first lock reason, stat deltas, vendor, optional price, and attachment tags such as required rails or provided mounting points.

## Sources

- Gray Zone Warfare Wiki, "Weapon Parts" - notes that weapon parts alter firearm performance and are grouped into parts and attachments: https://gray-zone-warfare.fandom.com/wiki/Weapon_Parts
- Steam store page for Gray Zone Warfare - store copy reviewed during research referenced new weapons, hundreds of weapon parts, and gear pieces: https://store.steampowered.com/app/2479810/Gray_Zone_Warfare/
- Reddit, "Confused about weapon parts/attachments in Gray Warfare" - players ask for lists of compatible attachments, needed rails/adapters, vendor-only vs loot-only sources, and M-LOK/Picatinny clarity: https://www.reddit.com/r/GrayZoneWarfare/comments/1p5j10m/confused_about_weapon_partsattachments_in_gray/
- Reddit, "[Suggestion] I'd love to see a blueprint mechanism so that we can save and quickly rebuild weapon configurations" - direct request for saved weapon configurations: https://www.reddit.com/r/GrayZoneWarfare/comments/1ha6db9
- Reddit, "Weapon Building" - asks for a comprehensive weapon-building guide and clearer compatibility information: https://www.reddit.com/r/GrayZoneWarfare/comments/1g8ldtn
- Reddit, "Help us complete the GZW Items database" - community request around item price and detail coverage: https://www.reddit.com/r/GrayZoneWarfare/comments/1sgxnh2/help_us_complete_the_gzw_items_database
- GZW Armory - public community weapon builder describing community-verified stats from in-game screenshots: https://www.gzwarmory.com/
