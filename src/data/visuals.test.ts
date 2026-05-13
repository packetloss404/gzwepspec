import { describe, expect, it } from "vitest";
import { platforms, slotLabels, type Slot } from "./armory";
import { fallbackWeaponVisual, getWeaponVisualProfile, weaponVisualProfiles, type WeaponVisualProfile } from "./visuals";

const allProfiles = [fallbackWeaponVisual, ...Object.values(weaponVisualProfiles)];
const allSlots = Object.keys(slotLabels) as Slot[];

describe("weapon visual profiles", () => {
  it("keeps every explicit platform mapped to a named visual profile", () => {
    const missingProfiles = platforms
      .map((platform) => platform.id)
      .filter((platformId) => !weaponVisualProfiles[platformId]);

    expect(missingProfiles).toEqual([]);
  });

  it("keeps anchor boxes inside the preview stage", () => {
    const outOfBoundsAnchors = allProfiles.flatMap((profile) =>
      profile.anchors
        .map((anchor) => ({
          profileId: profile.id,
          slot: anchor.slot,
          left: anchor.x - anchor.width / 2,
          right: anchor.x + anchor.width / 2,
          top: anchor.y - anchor.height / 2,
          bottom: anchor.y + anchor.height / 2,
        }))
        .filter((box) => box.left < 0 || box.right > 100 || box.top < 0 || box.bottom > 100),
    );

    expect(outOfBoundsAnchors).toEqual([]);
  });

  it("covers required and optional platform slots exactly once after profile filtering", () => {
    const coverageErrors = platforms.flatMap((platform) => {
      const profile = getWeaponVisualProfile(platform);
      const enabledSlots = new Set<Slot>(["receiver", ...platform.requiredSlots, ...platform.optionalSlots]);
      const visibleAnchors = profile.anchors.filter((anchor) => enabledSlots.has(anchor.slot));
      const visibleSlots = visibleAnchors.map((anchor) => anchor.slot);
      const missingSlots = [...enabledSlots].filter((slot) => !visibleSlots.includes(slot));
      const duplicateSlots = findDuplicates(visibleSlots);

      return [
        ...missingSlots.map((slot) => `${platform.id}:${profile.id} missing ${slot}`),
        ...duplicateSlots.map((slot) => `${platform.id}:${profile.id} duplicates ${slot}`),
      ];
    });

    expect(coverageErrors).toEqual([]);
  });

  it("does not define impossible duplicate anchors inside reusable profiles", () => {
    const duplicateProfileAnchors = allProfiles.flatMap((profile) =>
      findDuplicates(profile.anchors.map((anchor) => anchor.slot)).map((slot) => `${profile.id}:${slot}`),
    );

    expect(duplicateProfileAnchors).toEqual([]);
  });

  it("uses declared armory slots for every anchor", () => {
    const unknownAnchorSlots = allProfiles.flatMap((profile) =>
      profile.anchors
        .filter((anchor) => !allSlots.includes(anchor.slot))
        .map((anchor) => `${profile.id}:${anchor.slot}`),
    );

    expect(unknownAnchorSlots).toEqual([]);
  });
});

function findDuplicates<T>(values: T[]) {
  const seen = new Set<T>();
  const duplicates = new Set<T>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return [...duplicates];
}
