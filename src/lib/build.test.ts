import { afterEach, describe, expect, it } from "vitest";
import { parts, platforms, type Part, type WeaponPlatform } from "../data/armory";
import { checkAvailability, isSlot, sanitizeSelections, totalStats, type BuildSelections } from "./build";
import { formatSigned, formatSlotCode, formatTag, statKeys } from "./formatting";

const m4 = platforms.find((platform) => platform.id === "m4a1")!;

const addedParts: Part[] = [];

afterEach(() => {
  while (addedParts.length) {
    const part = addedParts.pop()!;
    const index = parts.findIndex((candidate) => candidate.id === part.id);
    if (index >= 0) {
      parts.splice(index, 1);
    }
  }
});

describe("sanitizeSelections", () => {
  it("removes unknown keys, wrong-slot ids, duplicate ids, and incompatible stale parts", () => {
    const selections = {
      barrel: "m4-145-barrel",
      magazine: "m4-145-barrel",
      optic: "rmr-dot",
      staleSlot: "stanag-30",
      tactical: "missing-part",
    } as BuildSelections;

    expect(sanitizeSelections(m4, selections)).toEqual({
      barrel: "m4-145-barrel",
    });
  });
});

describe("slot validation and formatting", () => {
  it("validates slots before selection keys are treated as typed slots", () => {
    expect(isSlot("barrel")).toBe(true);
    expect(isSlot("staleSlot")).toBe(false);
    expect(isSlot("__proto__")).toBe(false);
  });

  it("shares stat, slot, signed, and rich tag labels", () => {
    expect(statKeys).toEqual(["accuracy", "recoil", "ads", "ergonomics", "weight", "velocity"]);
    expect(formatSlotCode("opticMount")).toBe("MNT");
    expect(formatSigned(1.234)).toBe("+1.23");
    expect(formatSigned(-2)).toBe("-2");
    expect(formatTag("m_lok")).toBe("M-LOK");
    expect(formatTag("thread_1_2x28")).toBe("1/2x28 muzzle thread");
  });
});

describe("checkAvailability", () => {
  it("matches platformTags against the platform identity instead of dynamic selected tags", () => {
    const dynamicOnlyPart = addPart({
      id: "test-dynamic-platform-mag",
      name: "Dynamic Platform Magazine",
      slot: "magazine",
      type: "Magazine",
      vendor: "Test",
      tags: ["magazine"],
      platformTags: ["gas_carbine"],
      stats: {},
    });

    const availability = checkAvailability(m4, dynamicOnlyPart, { barrel: "m4-145-barrel" });

    expect(availability.available).toBe(false);
    expect(availability.reasons).toContain("Fits carbine-length AR gas system platforms only.");
  });

  it("detects conflicts declared by already selected parts", () => {
    const conflictingBarrel = addPart({
      id: "test-conflicting-barrel",
      name: "Conflicting Barrel",
      slot: "barrel",
      type: "Barrel",
      vendor: "Test",
      tags: ["ar15_barrel"],
      platformTags: ["ar15"],
      conflicts: ["stanag-30"],
      stats: {},
    });
    const magazine = parts.find((part) => part.id === "stanag-30")!;

    const availability = checkAvailability(m4, magazine, { barrel: conflictingBarrel.id });

    expect(availability.available).toBe(false);
    expect(availability.reasons).toContain("Conflicts with Conflicting Barrel.");
  });
});

describe("totalStats", () => {
  it("rounds stats after all parts are accumulated", () => {
    const platform: WeaponPlatform = {
      ...m4,
      baseStats: { ergonomics: 0, recoil: 0, accuracy: 0, weight: 0.334, velocity: 0, ads: 0 },
    };
    addPart({
      id: "test-weight-a",
      name: "Weight A",
      slot: "barrel",
      type: "Barrel",
      vendor: "Test",
      tags: [],
      stats: { weight: 0.334 },
    });
    addPart({
      id: "test-weight-b",
      name: "Weight B",
      slot: "magazine",
      type: "Magazine",
      vendor: "Test",
      tags: [],
      stats: { weight: 0.334 },
    });

    expect(totalStats(platform, { barrel: "test-weight-a", magazine: "test-weight-b" }).weight).toBe(1);
  });
});

function addPart(part: Part) {
  parts.push(part);
  addedParts.push(part);
  return part;
}
