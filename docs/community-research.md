# Community Research Notes

Research date: 2026-05-13. These notes capture public player feedback that can shape WepSpec's weapon-builder UX. The goal is not to mirror every community tool, but to keep v1 decisions tied to repeated player pain.

## Player-Requested Features

- Gunsmith-style build planning outside the stash UI. Recent Reddit discussion around GZW Loadout framed the need clearly: players want to plan builds without juggling vendor windows, remembering compatibility chains, buying parts to test, or rebuilding manually in-game.
- Compatibility explanation, not just filtering. Reddit and Steam posts repeatedly ask why a highlighted part still will not attach, which adapter/rail is missing, and whether the issue is M-LOK, Picatinny, KeyMod, a base plate, a blocked slot, or a bug.
- Vendor, reputation, and price visibility. GZW Loadout users praised per-vendor inventory by reputation level, while GZW Items exists specifically because players want patch-current item values and sell/keep decisions.
- Shareable and reusable builds. Players respond positively to link sharing, blueprint/preset concepts, community build sharing, and recommended builds for new players or mission roles.
- Visual confidence. Players care about the look of the assembled gun as well as stats. Feedback on third-party builders asks for clearer 3D/render backgrounds, clickable weapon pieces, and enough visual fidelity to preview "drip" builds.
- Search and fast part discovery. Players ask for Tarkov-like search/build options and for ways to understand what looted parts can be used with.

## Pain Points

- The in-game attachment system is realistic enough to reward firearms knowledge but can be cumbersome for players without that background.
- Highlighting can feel insufficient when it does not identify the missing intermediate part or lock reason.
- Attachment position and slot blocking are contested. Players cite examples such as MAWL/flashlight rail blocking, grips placed too far back, optics/magnifiers/sights that appear physically plausible but fail in-game, and rails that should accept accessories but do not.
- Vendor progression creates planning friction. Players want to know whether a build is possible at their trader levels before they spend money or grind reputation.
- Patch churn matters. Official changelogs include repeated fixes to weapon part compatibility, stat calculation, vendor stocks, item highlighting, tactical device clipping, and attachment UI behavior, so any community catalog needs source dates and verification status.
- Mobile usability matters for community tools. At least one GZW Loadout commenter tested on mobile and immediately hit attachment-removal friction.

## Debates To Represent Honestly

- Meta vs. aesthetics: some players want optimal recoil/ergonomics/cost builds; others explicitly want cosmetic or roleplay builds. WepSpec should support both by making stats visible without ranking every build as "best."
- Realism vs. game constraints: players with firearm experience argue for more physical placement freedom, while others accept some restrictions as balance, implementation, or known game bugs.
- 2D vs. 3D preview: 3D is attractive, but v1 can still be useful if the 2D preview is clear, clickable, source-honest, and paired with strong compatibility reasons.
- Full database vs. focused planner: community tools are already pursuing large item databases. WepSpec v1 should specialize in understandable build assembly unless catalog coverage catches up.

## What WepSpec Already Does Well

- Platform-scoped weapon selection with starter builds gives players a faster path than manual stash assembly.
- Tag-based compatibility, required/provided tags, conflicts, and stale-build sanitization map well to the adapter-chain problem players describe.
- First lock reasons, fit state, vendor, price, unlock hints, and stat deltas already answer the "why won't this attach?" and "where do I get it?" questions better than a silent filter.
- Versioned share URLs align with community demand for build sharing without accounts.
- Layered local preview and slot anchors support the visual-planning need while keeping asset provenance explicit.
- Asset validation and catalog documentation are important because the live game is still changing and community data can drift.

## Product Implications

- Keep lock reasons front and center. Missing requirements should name the required rail, adapter, mount, or platform family in player language.
- Add vendor-level filtering before deeper optimization. The highest-confidence economy ask is "can I buy this at my current vendors?"
- Treat visual preview controls as usability, not decoration. Background contrast, clickable part removal, and clear selected-slot affordances deserve v1 attention.
- Preserve share links and local presets as separate concepts: links for community discussion, presets for repeated personal rebuilds.
- Record source date, patch version, and confidence on catalog entries when possible.
- Avoid claiming exact parity until parts, prices, stats, and vendor levels have a sourced verification pass.

## Priority v1 Roadmap

1. Compatibility clarity: improve missing-requirement language, blocked-slot reasons, and selected-part dependency display.
2. Vendor planning: add vendor/reputation filters and a per-build "highest required vendor level" summary.
3. Build reuse: keep share URLs stable and add local saved builds/imported presets if time allows.
4. Visual UX: improve contrast, part removal, selected-slot navigation, and mobile touch behavior.
5. Catalog verification: expand source-backed platform/part coverage with source dates and patch notes.
6. Community handoff: publish known limitations, invite corrections, and keep asset provenance visible.

## Sources

- Official Gray Zone Warfare Spearhead changelog - adds 8 weapons, 380+ weapon parts, 150+ gear pieces, and reworked vendor stocks/economy, confirming the scale and volatility of the catalog: https://www.grayzonewarfare.com/news/spearhead-out-now-changelog
- Official Gray Zone Warfare Update 0.3 changelog - lists fixes for weapon-part compatibility, tactical device clipping, stat calculation, vendor UI, compatible ammo highlighting, and attachment behavior: https://www.grayzonewarfare.com/news/update-03-changelog
- Gray Zone Warfare Wiki/Fandom changelog - records later fixes including compatible-item highlighting, weapon stat display, weapon part access, attachment effects, and tactical-device issues: https://gray-zone-warfare.fandom.com/wiki/Changelog
- Gray Zone Warfare Wiki, "Weapon Parts" - notes that weapon parts alter firearm performance and are grouped into parts and attachments: https://gray-zone-warfare.fandom.com/wiki/Weapon_Parts
- Steam discussion, "Red lock?" - player confusion around locked attachments, magazines, and whether the behavior is mechanic or bug: https://steamcommunity.com/app/2479810/discussions/0/4358998116394910161/
- Steam discussion, "Help with a gun build" - players advise building from scratch or adjusting premade builds around play style, mission, area, and vendor progression: https://steamcommunity.com/app/2479810/discussions/0/6513974885816258233/
- Steam discussion, "Spitfire 5x - How to mount?" - players ask how to mount an optic, what vendor-level part is needed, and whether a secondary sight should work: https://steamcommunity.com/app/2479810/discussions/0/603031150125996018/
- Reddit, "GZW Loadout - The Weapon Builder" - community builder launch and feedback around live stats, 3D preview, vendor rep, share links, mobile removal, background contrast, recommended builds, and clickable part UI: https://www.reddit.com/r/GrayZoneWarfare/comments/1sz7x6e/gzw_loadout_the_weapon_builder/
- Reddit, "Confused about weapon parts/attachments in Gray Zone Warfare" - asks for compatible attachments, required rails/adapters, vendor-only vs loot-only sources, and M-LOK/Picatinny clarity: https://www.reddit.com/r/GrayZoneWarfare/comments/1p5j10m/confused_about_weapon_partsattachments_in_gray/
- Reddit, "Weapon attachment compatibility information" - player reports highlighted parts failing to attach, with comments explaining M-LOK-to-Picatinny rails and optic base plates: https://www.reddit.com/r/GrayZoneWarfare/comments/1l362om/weapon_attachment_compatibility_information/
- Reddit, "Attachments Guide/Help?" - new player asks how to add basic/multiple attachments and understand looted parts; comments explain rail systems and highlighting: https://www.reddit.com/r/GrayZoneWarfare/comments/1l3pe4e/attachments_guidehelp/
- Reddit, "Refined Weapon Attachment System" - debate about rail placement, pressure pads, optic/magnifier behavior, Tarkov/Ground Branch comparisons, and desire for a stronger gunsmith: https://www.reddit.com/r/GrayZoneWarfare/comments/1suzvl5/refined_weapon_attachment_system/
- Reddit, "Attachment system needs a drastic overhaul..." - asks for manual rail placement and less surprising blocked-slot behavior: https://www.reddit.com/r/GrayZoneWarfare/comments/1si0en5/attachment_system_needs_a_drastic_overhaul/
- GZW Armory - public community weapon builder/loadout calculator emphasizing live stats, carry weight, and community-verified data: https://www.gzwarmory.com/
- GZW Items documentation - community-driven price-tracking database with player-submitted updates after patches: https://docs.gzwitems.com/
- Gray Zone Warfare Community Hub, "Weapon Builds & Loadouts" forum - dedicated forum category for sharing builds, attachments, loadout strategies, and feedback: https://www.grayzonewarfare.net/forums/gray-zone-warfare-weapon-builds-loadouts.22/
