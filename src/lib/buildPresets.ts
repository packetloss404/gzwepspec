import { slotOrder, type Part, type Slot, type StatKey, type WeaponPlatform } from "../data/armory";
import {
  checkAvailability,
  compatibleParts,
  sanitizeSelections,
  starterSelections,
  type BuildSelections,
} from "./build";

export type BuildPresetGoal = "factory" | "assault" | "recce" | "suppressed";

export type BuildPreset = {
  id: string;
  name: string;
  platformId: string;
  selections: BuildSelections;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BuildPresetIntent = {
  id: BuildPresetGoal;
  name: string;
  description: string;
  weights: Partial<Record<StatKey, number>>;
  requiredTagBoosts?: Partial<Record<string, number>>;
};

export type BuildPresetResult = {
  preset: BuildPreset;
  warnings: string[];
};

export const buildPresetIntents: BuildPresetIntent[] = [
  {
    id: "factory",
    name: "Factory",
    description: "Keeps the platform close to stock with low-risk early vendor parts.",
    weights: { ergonomics: 0.4, recoil: -0.5, accuracy: 0.4, weight: -0.3, ads: -0.3 },
  },
  {
    id: "assault",
    name: "Assault",
    description: "Balances recoil, handling, and movement for general squad fights.",
    weights: { ergonomics: 1.1, recoil: -1.25, accuracy: 1, weight: -0.45, ads: -0.75, velocity: 0.25 },
  },
  {
    id: "recce",
    name: "Recce",
    description: "Favors accuracy and velocity while keeping the build practical.",
    weights: { ergonomics: 0.45, recoil: -1, accuracy: 1.8, weight: -0.35, ads: -0.35, velocity: 0.65 },
  },
  {
    id: "suppressed",
    name: "Suppressed",
    description: "Prioritizes suppressors, recoil control, and stable sighting.",
    weights: { ergonomics: 0.7, recoil: -1.4, accuracy: 1.1, weight: -0.35, ads: -0.4 },
    requiredTagBoosts: { suppressor: 25 },
  },
];

const presetStorageKey = "wepspec.buildPresets.v1";

export function createBuildPreset(
  platform: WeaponPlatform,
  selections: BuildSelections,
  options: { id?: string; name?: string; description?: string; now?: Date } = {},
): BuildPreset {
  const now = (options.now ?? new Date()).toISOString();
  const safeSelections = sanitizeSelections(platform, selections);

  return {
    id: options.id ?? createPresetId(platform.id, safeSelections, now),
    name: options.name?.trim() || `${platform.name} build`,
    platformId: platform.id,
    selections: safeSelections,
    description: options.description?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
}

export function applyBuildPreset(platform: WeaponPlatform, preset: BuildPreset): BuildPresetResult {
  const warnings: string[] = [];

  if (preset.platformId !== platform.id) {
    warnings.push(`Preset was saved for ${preset.platformId}, not ${platform.id}.`);
  }

  const selections = sanitizeSelections(platform, preset.selections);
  for (const [slot, id] of Object.entries(preset.selections) as [Slot, string][]) {
    if (selections[slot] !== id) {
      warnings.push(`${id} was removed because it is no longer compatible with ${platform.name}.`);
    }
  }

  return {
    preset: {
      ...preset,
      platformId: platform.id,
      selections,
    },
    warnings,
  };
}

export function generateBuildPreset(platform: WeaponPlatform, goal: BuildPresetGoal): BuildPreset {
  const intent = buildPresetIntents.find((item) => item.id === goal) ?? buildPresetIntents[0];
  const selections = selectBestParts(platform, intent);

  return createBuildPreset(platform, selections, {
    id: `${platform.id}-${intent.id}`,
    name: `${platform.name} ${intent.name}`,
    description: intent.description,
  });
}

export function generateBuildPresets(platform: WeaponPlatform): BuildPreset[] {
  return buildPresetIntents.map((intent) => generateBuildPreset(platform, intent.id));
}

export function saveBuildPreset(
  storage: Storage,
  preset: BuildPreset,
  options: { key?: string; maxPresets?: number; now?: Date } = {},
): BuildPreset[] {
  const current = loadBuildPresets(storage, options.key);
  const now = (options.now ?? new Date()).toISOString();
  const nextPreset = {
    ...preset,
    updatedAt: now,
    createdAt: preset.createdAt ?? now,
  };
  const next = [nextPreset, ...current.filter((item) => item.id !== preset.id)].slice(0, options.maxPresets ?? 24);
  storage.setItem(options.key ?? presetStorageKey, JSON.stringify(next));
  return next;
}

export function loadBuildPresets(storage: Storage, key = presetStorageKey): BuildPreset[] {
  const raw = storage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isBuildPreset);
  } catch {
    return [];
  }
}

export function removeBuildPreset(storage: Storage, presetId: string, key = presetStorageKey): BuildPreset[] {
  const next = loadBuildPresets(storage, key).filter((preset) => preset.id !== presetId);
  storage.setItem(key, JSON.stringify(next));
  return next;
}

function selectBestParts(platform: WeaponPlatform, intent: BuildPresetIntent): BuildSelections {
  let next = starterSelections(platform);
  const slots = slotOrder.filter((slot) => platform.requiredSlots.includes(slot) || platform.optionalSlots.includes(slot));

  for (const slot of slots) {
    const candidates = compatibleParts(platform, slot, next).filter(({ availability }) => availability.available);
    if (!candidates.length) {
      continue;
    }

    const ranked = [...candidates].sort((a, b) => scorePart(b.part, intent) - scorePart(a.part, intent));
    next = sanitizeSelections(platform, { ...next, [slot]: ranked[0].part.id });
  }

  return next;
}

function scorePart(part: Part, intent: BuildPresetIntent) {
  let score = 0;

  for (const [key, value] of Object.entries(part.stats) as [StatKey, number][]) {
    score += value * (intent.weights[key] ?? 0);
  }

  for (const [tag, boost] of Object.entries(intent.requiredTagBoosts ?? {})) {
    if (boost !== undefined && part.tags.includes(tag)) {
      score += boost;
    }
  }

  return score;
}

function createPresetId(platformId: string, selections: BuildSelections, seed: string) {
  const selectedIds = Object.values(selections).join("-");
  return `${platformId}-${hashText(`${seed}-${selectedIds}`)}`;
}

function hashText(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function isBuildPreset(value: unknown): value is BuildPreset {
  if (!value || typeof value !== "object") {
    return false;
  }

  const preset = value as Partial<BuildPreset>;
  return typeof preset.id === "string" && typeof preset.name === "string" && typeof preset.platformId === "string" && isSelections(preset.selections);
}

function isSelections(value: unknown): value is BuildSelections {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value).every((id) => typeof id === "string");
}
