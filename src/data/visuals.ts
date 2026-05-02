import type { Slot, WeaponPlatform } from "./armory";

export type AnchorShape = "barrel" | "box" | "grip" | "magazine" | "optic" | "rail" | "stock" | "tube";

export type VisualAnchor = {
  slot: Slot;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  layer: number;
  shape: AnchorShape;
};

export type WeaponVisualProfile = {
  id: string;
  weaponOffsetY: number;
  weaponScale: number;
  anchors: VisualAnchor[];
};

const rifleAnchors: VisualAnchor[] = [
  { slot: "stock", x: 13, y: 41, width: 22, height: 18, layer: 14, shape: "stock" },
  { slot: "receiver", x: 36, y: 38, width: 21, height: 18, layer: 10, shape: "box" },
  { slot: "barrel", x: 56, y: 38, width: 25, height: 12, layer: 12, shape: "barrel" },
  { slot: "handguard", x: 55, y: 41, width: 24, height: 18, layer: 18, shape: "box" },
  { slot: "muzzle", x: 79, y: 40, width: 12, height: 9, layer: 24, shape: "tube" },
  { slot: "pistolGrip", x: 41, y: 55, width: 10, height: 22, rotation: -17, layer: 22, shape: "grip" },
  { slot: "magazine", x: 50, y: 58, width: 11, height: 28, rotation: -8, layer: 20, shape: "magazine" },
  { slot: "opticMount", x: 39, y: 28, width: 22, height: 13, layer: 26, shape: "rail" },
  { slot: "optic", x: 42, y: 19, width: 24, height: 17, layer: 30, shape: "optic" },
  { slot: "underbarrelAdapter", x: 59, y: 57, width: 18, height: 7, layer: 25, shape: "rail" },
  { slot: "sideRailAdapter", x: 62, y: 34, width: 15, height: 7, layer: 25, shape: "rail" },
  { slot: "foregrip", x: 63, y: 62, width: 9, height: 22, rotation: -4, layer: 28, shape: "grip" },
  { slot: "laser", x: 65, y: 30, width: 13, height: 9, layer: 31, shape: "box" },
  { slot: "tactical", x: 67, y: 52, width: 13, height: 9, layer: 31, shape: "tube" },
];

const shortRifleAnchors: VisualAnchor[] = rifleAnchors.map((anchor) => {
  if (["barrel", "handguard", "muzzle", "underbarrelAdapter", "sideRailAdapter", "foregrip", "laser", "tactical"].includes(anchor.slot)) {
    return { ...anchor, x: anchor.x - 2, width: Math.max(anchor.width - 4, 8) };
  }

  return anchor;
});

const akAnchors: VisualAnchor[] = rifleAnchors.map((anchor) => {
  const adjustments: Partial<Record<Slot, Partial<VisualAnchor>>> = {
    stock: { x: 11, width: 24, y: 42 },
    receiver: { x: 36, y: 39, width: 23 },
    barrel: { x: 57, y: 39, width: 24 },
    handguard: { x: 55, y: 43, width: 20 },
    muzzle: { x: 80, y: 40 },
    pistolGrip: { x: 42, y: 56 },
    magazine: { x: 49, y: 59, width: 13, height: 31, rotation: -15 },
    opticMount: { x: 38, y: 29, width: 24 },
    optic: { x: 43, y: 20 },
  };

  return { ...anchor, ...(adjustments[anchor.slot] ?? {}) };
});

const pistolAnchors: VisualAnchor[] = [
  { slot: "receiver", x: 34, y: 39, width: 34, height: 19, layer: 10, shape: "box" },
  { slot: "barrel", x: 58, y: 41, width: 19, height: 9, layer: 12, shape: "barrel" },
  { slot: "muzzle", x: 73, y: 41, width: 14, height: 8, layer: 24, shape: "tube" },
  { slot: "opticMount", x: 43, y: 30, width: 18, height: 9, layer: 25, shape: "rail" },
  { slot: "optic", x: 45, y: 22, width: 16, height: 12, layer: 30, shape: "optic" },
  { slot: "pistolGrip", x: 43, y: 56, width: 15, height: 27, rotation: -8, layer: 20, shape: "grip" },
  { slot: "magazine", x: 47, y: 68, width: 11, height: 27, rotation: -3, layer: 22, shape: "magazine" },
  { slot: "tactical", x: 59, y: 54, width: 14, height: 10, layer: 28, shape: "tube" },
  { slot: "laser", x: 59, y: 31, width: 12, height: 8, layer: 28, shape: "box" },
];

export const weaponVisualProfiles: Record<string, WeaponVisualProfile> = {
  m4a1: { id: "m4a1", weaponOffsetY: 0, weaponScale: 1, anchors: rifleAnchors },
  mk18: { id: "mk18", weaponOffsetY: 1, weaponScale: 0.96, anchors: shortRifleAnchors },
  akmn: { id: "akmn", weaponOffsetY: 1, weaponScale: 1, anchors: akAnchors },
  glock17: { id: "glock17", weaponOffsetY: 3, weaponScale: 0.64, anchors: pistolAnchors },
};

export const fallbackWeaponVisual: WeaponVisualProfile = {
  id: "fallback",
  weaponOffsetY: 0,
  weaponScale: 1,
  anchors: rifleAnchors,
};

export function getWeaponVisualProfile(platform: WeaponPlatform) {
  if (weaponVisualProfiles[platform.id]) {
    return weaponVisualProfiles[platform.id];
  }

  if (platform.tags.includes("pistol")) {
    return { ...fallbackWeaponVisual, id: "fallback-pistol", weaponOffsetY: 3, weaponScale: 0.64, anchors: pistolAnchors };
  }

  return fallbackWeaponVisual;
}
