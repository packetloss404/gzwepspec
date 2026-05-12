import { emptyStats, parts, slotLabels, type Part, type Slot, type StatKey, type Stats, type WeaponPlatform } from "../data/armory";
import { formatTag } from "./formatting";

export { formatTag } from "./formatting";

export type BuildSelections = Partial<Record<Slot, string>>;

export type Availability = {
  available: boolean;
  reasons: string[];
};

export function getSelectedParts(selections: BuildSelections): Part[] {
  return Object.values(selections)
    .map((id) => parts.find((part) => part.id === id))
    .filter((part): part is Part => Boolean(part));
}

export function getTagSet(platform: WeaponPlatform, selections: BuildSelections, excludingSlot?: Slot) {
  const tagSet = new Set(platform.tags);

  for (const part of getSelectedParts(selections)) {
    if (excludingSlot && part.slot === excludingSlot) {
      continue;
    }

    part.tags.forEach((tag) => tagSet.add(tag));
    part.provides?.forEach((tag) => tagSet.add(tag));
  }

  return tagSet;
}

export function checkAvailability(platform: WeaponPlatform, part: Part, selections: BuildSelections): Availability {
  const tags = getTagSet(platform, selections, part.slot);
  const selectedParts = getSelectedParts(selections).filter((selected) => selected.slot !== part.slot);
  const reasons: string[] = [];

  if (!platform.requiredSlots.includes(part.slot) && !platform.optionalSlots.includes(part.slot)) {
    reasons.push(`${platform.name} has no ${slotLabels[part.slot]} slot.`);
  }

  if (part.platformTags?.length && !part.platformTags.some((tag) => platform.tags.includes(tag))) {
    reasons.push(`Fits ${formatTagList(part.platformTags)} platforms only.`);
  }

  for (const requirement of part.requires ?? []) {
    if (!tags.has(requirement)) {
      reasons.push(`Needs ${formatTag(requirement)}${providerHint(requirement, platform, part.slot)}.`);
    }
  }

  for (const conflict of part.conflicts ?? []) {
    if (tags.has(conflict) || selectedParts.some((selected) => selected.id === conflict || selected.tags.includes(conflict))) {
      reasons.push(`Conflicts with ${formatConflict(conflict, selectedParts)}.`);
    }
  }

  for (const selected of selectedParts) {
    const reverseConflict = selected.conflicts?.find((conflict) => partMatchesConflict(part, conflict));
    if (reverseConflict) {
      reasons.push(`Conflicts with ${selected.name}.`);
    }
  }

  return {
    available: reasons.length === 0,
    reasons,
  };
}

export function compatibleParts(platform: WeaponPlatform, slot: Slot, selections: BuildSelections) {
  return parts
    .filter((part) => part.slot === slot)
    .map((part) => ({ part, availability: checkAvailability(platform, part, selections) }));
}

export function sanitizeSelections(platform: WeaponPlatform, selections: BuildSelections): BuildSelections {
  const next: Record<string, string> = Object.fromEntries(
    Object.entries(selections).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
  let changed = true;

  while (changed) {
    changed = false;
    const seenPartIds = new Set<string>();
    for (const [slot, id] of Object.entries(next)) {
      const part = parts.find((candidate) => candidate.id === id);
      if (!isSlot(slot) || !part || part.slot !== slot || seenPartIds.has(id) || !checkAvailability(platform, part, next).available) {
        delete next[slot];
        changed = true;
        continue;
      }

      seenPartIds.add(id);
    }
  }

  return next as BuildSelections;
}

export function totalStats(platform: WeaponPlatform, selections: BuildSelections): Stats {
  const totals = { ...platform.baseStats };

  for (const part of getSelectedParts(selections)) {
    for (const [key, value] of Object.entries(part.stats) as [StatKey, number][]) {
      totals[key] = (totals[key] ?? emptyStats[key]) + value;
    }
  }

  return Object.fromEntries(
    (Object.keys(emptyStats) as StatKey[]).map((key) => [key, roundStat(totals[key] ?? emptyStats[key], key)]),
  ) as Stats;
}

export function statDelta(part: Part, key: StatKey) {
  return part.stats[key] ?? 0;
}

export function starterSelections(platform: WeaponPlatform): BuildSelections {
  const result: BuildSelections = {};

  for (const slot of platform.requiredSlots) {
    const firstAvailable = parts.find((part) => part.slot === slot && checkAvailability(platform, part, result).available);
    if (firstAvailable) {
      result[slot] = firstAvailable.id;
    }
  }

  return sanitizeSelections(platform, result);
}

function roundStat(value: number, key: StatKey) {
  if (key === "weight") {
    return Number(value.toFixed(2));
  }

  return Math.round(value);
}

function formatTagList(tags: string[]) {
  return tags.map(formatTag).join(" or ");
}

function providerHint(requirement: string, platform: WeaponPlatform, excludingSlot: Slot) {
  if (platform.tags.includes(requirement)) {
    return " from this platform";
  }

  const providerSlots = parts
    .filter((candidate) => candidate.slot !== excludingSlot && candidate.provides?.includes(requirement))
    .filter((candidate) => !candidate.platformTags?.length || candidate.platformTags.some((tag) => platform.tags.includes(tag)))
    .map((candidate) => slotLabels[candidate.slot]);

  const uniqueSlots = Array.from(new Set(providerSlots));

  if (uniqueSlots.length === 0) {
    return "";
  }

  return ` from a compatible ${uniqueSlots.slice(0, 2).join(" or ")}`;
}

function formatConflict(conflict: string, selectedParts: Part[]) {
  const selected = selectedParts.find((part) => part.id === conflict || part.tags.includes(conflict));

  return selected ? selected.name : formatTag(conflict);
}

function partMatchesConflict(part: Part, conflict: string) {
  return part.id === conflict || part.tags.includes(conflict) || Boolean(part.provides?.includes(conflict));
}

export function isSlot(value: string): value is Slot {
  return Object.prototype.hasOwnProperty.call(slotLabels, value);
}
