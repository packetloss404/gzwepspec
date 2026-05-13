# SteamDev-1 UI Review Notes

Date: 2026-05-12
Owner lane: frontend architecture and interaction quality in `src/App.tsx`, `src/components/*`, and targeted CSS.

## Findings

- The core inspect -> preview -> apply flow was understandable, but the final apply action lived only inside the lower workbench inspector. On desktop this created a split-attention moment after the weapon preview changed.
- Clipboard copy could fail without visible recovery, leaving the share action feeling inert in browser contexts that deny clipboard access.
- The workbench status messaging was visually useful but not consistently exposed as live state for assistive tech.
- Mobile workbench controls were dense; the swap status could compete with action buttons instead of getting a clean row.
- Hover lift and smooth scrolling should respect reduced-motion preferences for a public companion tool.

## Debates And Tradeoffs

- I did not make higher-loyalty parts impossible to mount. The current app appears to support planning future vendor builds, so I kept those as labeled listings rather than hard locks.
- I avoided changing the asset/rendering pipeline. There are active asset format edits in the tree, and copyrighted asset extraction is out of scope.
- I kept the direct mount affordance in the workbench header instead of adding apply buttons to every locker tile. Per-tile apply would be faster, but it also raises misclick risk in a dense inventory grid.

## Fixed

- Added a direct "Mount preview" action when an inspected compatible part is being previewed in the weapon scene.
- Added blocked-part feedback in the workbench header when the inspected part cannot currently fit.
- Added a polite live region for preview/share state changes.
- Added clipboard failure handling with a visible warning that points users back to the share code field.
- Improved small-screen workbench wrapping so preview status and actions do not fight for the same narrow line.
- Added reduced-motion handling for smooth section jumps and hover transforms.

## V1 Recommendations

- Add roving keyboard focus or explicit shortcuts for locker grid navigation once the part catalog grows.
- Consider a compare drawer or side-by-side stat delta for the currently installed part versus previewed part.
- Add a confirm or undo affordance for deleting saved builds.
- Add visual regression checks for desktop, tablet, and mobile viewports because this UI is dense and stateful.
- Keep the current generated/proxy art labels until reviewed assets exist for every supported part.
