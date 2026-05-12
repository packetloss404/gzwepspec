import { describe, expect, it } from "vitest";
import { parts, platforms } from "../data/armory";
import { checkAvailability } from "./build";
import {
  applyBuildPreset,
  createBuildPreset,
  generateBuildPresets,
  loadBuildPresets,
  saveBuildPreset,
  type BuildPreset,
} from "./buildPresets";

const m4 = platforms.find((platform) => platform.id === "m4a1")!;

describe("build presets", () => {
  it("creates presets with sanitized selections and stable metadata", () => {
    const preset = createBuildPreset(
      m4,
      { barrel: "m4-145-barrel", magazine: "m4-145-barrel", optic: "rmr-dot" },
      { id: "test-preset", name: "  Patrol  ", description: "  Ready build  ", now: new Date("2026-05-09T12:00:00.000Z") },
    );

    expect(preset).toMatchObject({
      id: "test-preset",
      name: "Patrol",
      platformId: "m4a1",
      selections: { barrel: "m4-145-barrel" },
      description: "Ready build",
      createdAt: "2026-05-09T12:00:00.000Z",
      updatedAt: "2026-05-09T12:00:00.000Z",
    });
  });

  it("generates compatible presets for every intent", () => {
    const presets = generateBuildPresets(m4);

    expect(presets.map((preset) => preset.id)).toEqual(["m4a1-factory", "m4a1-assault", "m4a1-recce", "m4a1-suppressed"]);
    for (const preset of presets) {
      for (const id of Object.values(preset.selections)) {
        const part = id ? findPart(id) : undefined;
        expect(part && checkAvailability(m4, part, preset.selections).available).toBe(true);
      }
    }
  });

  it("generates compatible presets for every platform and intent", () => {
    for (const platform of platforms) {
      const presets = generateBuildPresets(platform);

      expect(presets).toHaveLength(4);
      for (const preset of presets) {
        expect(preset.platformId).toBe(platform.id);
        for (const [slot, id] of Object.entries(preset.selections)) {
          const part = id ? findPart(id) : undefined;
          expect(part?.slot).toBe(slot);
          expect(part && checkAvailability(platform, part, preset.selections).available).toBe(true);
        }
      }
    }
  });

  it("loads stale presets, applies sanitizer warnings, and saves newest first", () => {
    const storage = new MemoryStorage();
    const stalePreset: BuildPreset = {
      id: "stale",
      name: "Stale",
      platformId: "m4a1",
      selections: {
        barrel: "m4-145-barrel",
        magazine: "m4-145-barrel",
        optic: "rmr-dot",
      },
    };
    storage.setItem("presets", JSON.stringify([stalePreset]));

    expect(loadBuildPresets(storage, "presets")).toEqual([stalePreset]);

    const applied = applyBuildPreset(m4, stalePreset);
    expect(applied.preset.selections).toEqual({ barrel: "m4-145-barrel" });
    expect(applied.warnings).toEqual([
      "m4-145-barrel was removed because it is no longer compatible with M4A1.",
      "rmr-dot was removed because it is no longer compatible with M4A1.",
    ]);

    const saved = saveBuildPreset(
      storage,
      { id: "fresh", name: "Fresh", platformId: "m4a1", selections: { barrel: "m4-145-barrel" } },
      { key: "presets", now: new Date("2026-05-09T12:30:00.000Z") },
    );
    expect(saved.map((preset) => preset.id)).toEqual(["fresh", "stale"]);
    expect(saved[0].createdAt).toBe("2026-05-09T12:30:00.000Z");
  });

  it("drops unknown selection keys from stale presets before reading them as slots", () => {
    const stalePreset = {
      id: "unknown-slot",
      name: "Unknown Slot",
      platformId: "m4a1",
      selections: {
        barrel: "m4-145-barrel",
        staleSlot: "stanag-30",
      },
    } as BuildPreset;

    const applied = applyBuildPreset(m4, stalePreset);

    expect(applied.preset.selections).toEqual({ barrel: "m4-145-barrel" });
    expect(applied.warnings).toEqual([
      "stanag-30 was removed because it is no longer compatible with M4A1.",
    ]);
  });
});

function findPart(id: string) {
  return parts.find((part) => part.id === id);
}

class MemoryStorage implements Storage {
  private readonly items = new Map<string, string>();

  get length() {
    return this.items.size;
  }

  clear() {
    this.items.clear();
  }

  getItem(key: string) {
    return this.items.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.items.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.items.delete(key);
  }

  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
}
