import { emptyStats, parts, slotLabels, type Part, type Slot, type StatKey, type Stats, type WeaponPlatform } from "../data/armory";

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

export function formatTag(tag: string) {
  return tagNames[tag] ?? tag.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function isSlot(value: string): value is Slot {
  return Object.prototype.hasOwnProperty.call(slotLabels, value);
}

const tagNames: Record<string, string> = {
  ak: "AK-pattern",
  ak74: "AK-74",
  akm: "AKM",
  ar15: "AR-15",
  bolt_action: "bolt-action",
  buffer_tube: "AR buffer tube",
  carry_handle_channel: "carry-handle optic channel",
  cylinder_bore: "cylinder-bore shotgun barrel",
  dovetail: "AK side dovetail",
  gas_carbine: "carbine-length AR gas system",
  gas_midlength: "midlength AR gas system",
  gas_rifle: "rifle-length AR gas system",
  glock: "Glock-pattern",
  m_lok_3: "3 o'clock M-LOK slot",
  m_lok_6: "6 o'clock M-LOK slot",
  m_lok_9: "9 o'clock M-LOK slot",
  nato556: "5.56 NATO chambering",
  nato762: "7.62 NATO chambering",
  nine_mm: "9 mm chambering",
  offset_light_mount: "offset scout light mount",
  pistol_rail: "pistol accessory rail",
  pump12: "12 ga pump platform",
  rm437_plate: "micro-dot slide plate",
  rmr_plate: "RMR slide plate",
  roller9: "roller-delayed 9 mm",
  russian545: "5.45x39 chambering",
  russian762: "7.62x39 chambering",
  short_action: "short-action receiver",
  side_picatinny: "side Picatinny rail",
  sks: "SKS",
  sks_dovetail: "SKS side rail",
  smg: "SMG platform",
  twelve_gauge: "12 gauge chambering",
  threaded_choke: "threaded shotgun choke",
  thread_14x1lh: "14x1 LH muzzle thread",
  thread_1_2x28: "1/2x28 muzzle thread",
  thread_24x1_5: "24x1.5 muzzle thread",
  thread_5_8x24: "5/8x24 muzzle thread",
  thread_pistol_9mm: "threaded 9 mm pistol barrel",
  tri_lug_9mm: "9 mm tri-lug muzzle",
  upper_picatinny: "top Picatinny rail",
  vityaz: "Vityaz-pattern",
};
