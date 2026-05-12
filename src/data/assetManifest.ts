export type AssetAttribution = {
  source: string;
  sourceUrl: string;
  owner: string;
  terms: string;
  notes?: string;
};

export type LocalAssetCategory = "weapon" | "part";

export type LocalAssetEntry = {
  id: string;
  category: LocalAssetCategory;
  label: string;
  src: `/assets/${string}`;
  localPath: `public/assets/${string}`;
  mimeType: "image/png";
  attribution: AssetAttribution;
  coverage: {
    armoryIds: readonly string[];
    mode: "exact" | "representative" | "shared-render";
    notes?: string;
  };
  tags?: readonly string[];
};

export type GameMediaEntry = {
  id: string;
  category: "game-media";
  label: string;
  src: string;
  mediaType: "header" | "capsule" | "screenshot-thumb" | "screenshot-full";
  strategy: "remote-official-steam";
  attribution: AssetAttribution;
};

export type AssetManifest = {
  version: 1;
  local: {
    weapons: Record<string, LocalAssetEntry & { category: "weapon" }>;
    parts: Record<string, LocalAssetEntry & { category: "part" }>;
  };
  remote: {
    gameMedia: Record<string, GameMediaEntry>;
  };
  policy: {
    localPathRoot: "public";
    preferManifestLookups: true;
    placeholderStrategy: string;
    remoteGameMediaStrategy: string;
  };
};

const wikiAttribution: AssetAttribution = {
  source: "Gray Zone Warfare Wiki on Fandom",
  sourceUrl: "https://gray-zone-warfare.fandom.com/",
  owner: "MADFINGER Games",
  terms:
    "Fandom pages may include CC-BY-SA community content, but embedded game artwork or screenshots may have separate rights; game artwork remains owned by MADFINGER Games.",
  notes: "Local prototype copies are used to avoid runtime dependency on Fandom CDN URLs.",
};

const steamAttribution: AssetAttribution = {
  source: "Official Gray Zone Warfare Steam store media",
  sourceUrl: "https://store.steampowered.com/app/2479810/Gray_Zone_Warfare/",
  owner: "MADFINGER Games",
  terms: "Official store media referenced remotely as provenance; this is not permission to redistribute the media locally.",
};

export const assetManifest = {
  version: 1,
  local: {
    weapons: {
      m4a1: {
        id: "m4a1",
        category: "weapon",
        label: "M4A1 render",
        src: "/assets/weapons/m4a1.png",
        localPath: "public/assets/weapons/m4a1.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: { armoryIds: ["m4a1"], mode: "exact" },
        tags: ["ar15", "nato556"],
      },
      akmn: {
        id: "akmn",
        category: "weapon",
        label: "AKMN render",
        src: "/assets/weapons/akmn.png",
        localPath: "public/assets/weapons/akmn.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: { armoryIds: ["akmn"], mode: "exact" },
        tags: ["ak", "russian762"],
      },
      mk18: {
        id: "mk18",
        category: "weapon",
        label: "MK18 render",
        src: "/assets/weapons/mk18.png",
        localPath: "public/assets/weapons/mk18.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: { armoryIds: ["mk18"], mode: "exact" },
        tags: ["ar15", "sbr", "nato556"],
      },
      glock17: {
        id: "glock17",
        category: "weapon",
        label: "Glock 17 render",
        src: "/assets/weapons/glock17.png",
        localPath: "public/assets/weapons/glock17.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: { armoryIds: ["glock17"], mode: "exact" },
        tags: ["glock", "pistol", "nine_mm"],
      },
    },
    parts: {
      "ar15-145-barrel": {
        id: "ar15-145-barrel",
        category: "part",
        label: "AR-15 barrel render",
        src: "/assets/parts/ar15-145-barrel.png",
        localPath: "public/assets/parts/ar15-145-barrel.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: {
          armoryIds: ["m4-145-barrel", "m4-103-barrel"],
          mode: "shared-render",
          notes: "The 10.3 inch barrel currently reuses the closest available AR-15 barrel render.",
        },
        tags: ["ar15", "barrel"],
      },
      "a2-grip": {
        id: "a2-grip",
        category: "part",
        label: "A2 pistol grip render",
        src: "/assets/parts/a2-grip.png",
        localPath: "public/assets/parts/a2-grip.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: { armoryIds: ["a2-grip"], mode: "exact" },
        tags: ["grip", "ar15"],
      },
      "stanag-30": {
        id: "stanag-30",
        category: "part",
        label: "STANAG magazine render",
        src: "/assets/parts/stanag-30.png",
        localPath: "public/assets/parts/stanag-30.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: { armoryIds: ["stanag-30"], mode: "exact" },
        tags: ["magazine", "ar15"],
      },
      "pmag-30": {
        id: "pmag-30",
        category: "part",
        label: "PMAG magazine render",
        src: "/assets/parts/pmag-30.png",
        localPath: "public/assets/parts/pmag-30.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: { armoryIds: ["pmag-30"], mode: "exact" },
        tags: ["magazine", "ar15"],
      },
      "carry-handle": {
        id: "carry-handle",
        category: "part",
        label: "AR-15 carry handle render",
        src: "/assets/parts/carry-handle.png",
        localPath: "public/assets/parts/carry-handle.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: { armoryIds: ["carry-handle"], mode: "exact" },
        tags: ["opticMount", "ar15"],
      },
      acog: {
        id: "acog",
        category: "part",
        label: "ACOG optic render",
        src: "/assets/parts/acog.png",
        localPath: "public/assets/parts/acog.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: { armoryIds: ["acog"], mode: "exact" },
        tags: ["optic"],
      },
      specterdr: {
        id: "specterdr",
        category: "part",
        label: "Carry handle scope render",
        src: "/assets/parts/specterdr.png",
        localPath: "public/assets/parts/specterdr.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: {
          armoryIds: ["carry-scope"],
          mode: "representative",
          notes: "Representative magnified optic render for the carry-handle scope item.",
        },
        tags: ["optic"],
      },
      "g17-mag": {
        id: "g17-mag",
        category: "part",
        label: "Glock 17 magazine render",
        src: "/assets/parts/g17-mag.png",
        localPath: "public/assets/parts/g17-mag.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: { armoryIds: ["g17-17mag"], mode: "exact" },
        tags: ["magazine", "glock"],
      },
      "g17-hol": {
        id: "g17-hol",
        category: "part",
        label: "Glock slide plate render",
        src: "/assets/parts/g17-hol.png",
        localPath: "public/assets/parts/g17-hol.png",
        mimeType: "image/png",
        attribution: wikiAttribution,
        coverage: {
          armoryIds: ["rmr-slide"],
          mode: "representative",
          notes: "Representative local render for the RMR slide plate until a dedicated plate image is available.",
        },
        tags: ["opticMount", "glock"],
      },
    },
  },
  remote: {
    gameMedia: {
      "steam-header": {
        id: "steam-header",
        category: "game-media",
        label: "Steam header image",
        src: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/cbf65dafc3aad7c2ed1b8191680f1bfd9a07dbf5/header.jpg?t=1776944378",
        mediaType: "header",
        strategy: "remote-official-steam",
        attribution: steamAttribution,
      },
      "steam-capsule": {
        id: "steam-capsule",
        category: "game-media",
        label: "Steam capsule image",
        src: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/98a7afd24071040c96f6010b798b88ccacb62038/capsule_231x87.jpg?t=1776944378",
        mediaType: "capsule",
        strategy: "remote-official-steam",
        attribution: steamAttribution,
      },
      "steam-screenshot-01-thumb": {
        id: "steam-screenshot-01-thumb",
        category: "game-media",
        label: "Steam screenshot 1 thumbnail",
        src: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/2fa64e158672ee4026a37d5d4fd6029972225c00/ss_2fa64e158672ee4026a37d5d4fd6029972225c00.600x338.jpg?t=1776944378",
        mediaType: "screenshot-thumb",
        strategy: "remote-official-steam",
        attribution: steamAttribution,
      },
      "steam-screenshot-01-full": {
        id: "steam-screenshot-01-full",
        category: "game-media",
        label: "Steam screenshot 1 full image",
        src: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/2fa64e158672ee4026a37d5d4fd6029972225c00/ss_2fa64e158672ee4026a37d5d4fd6029972225c00.1920x1080.jpg?t=1776944378",
        mediaType: "screenshot-full",
        strategy: "remote-official-steam",
        attribution: steamAttribution,
      },
      "steam-screenshot-02-thumb": {
        id: "steam-screenshot-02-thumb",
        category: "game-media",
        label: "Steam screenshot 2 thumbnail",
        src: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/5e7aa829f4b6374289fb5048bca4e1840f851dc5/ss_5e7aa829f4b6374289fb5048bca4e1840f851dc5.600x338.jpg?t=1776944378",
        mediaType: "screenshot-thumb",
        strategy: "remote-official-steam",
        attribution: steamAttribution,
      },
      "steam-screenshot-02-full": {
        id: "steam-screenshot-02-full",
        category: "game-media",
        label: "Steam screenshot 2 full image",
        src: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/5e7aa829f4b6374289fb5048bca4e1840f851dc5/ss_5e7aa829f4b6374289fb5048bca4e1840f851dc5.1920x1080.jpg?t=1776944378",
        mediaType: "screenshot-full",
        strategy: "remote-official-steam",
        attribution: steamAttribution,
      },
      "steam-screenshot-03-thumb": {
        id: "steam-screenshot-03-thumb",
        category: "game-media",
        label: "Steam screenshot 3 thumbnail",
        src: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/554761289ced02f8b33e1e7f6b89c470032c8def/ss_554761289ced02f8b33e1e7f6b89c470032c8def.600x338.jpg?t=1776944378",
        mediaType: "screenshot-thumb",
        strategy: "remote-official-steam",
        attribution: steamAttribution,
      },
      "steam-screenshot-03-full": {
        id: "steam-screenshot-03-full",
        category: "game-media",
        label: "Steam screenshot 3 full image",
        src: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/554761289ced02f8b33e1e7f6b89c470032c8def/ss_554761289ced02f8b33e1e7f6b89c470032c8def.1920x1080.jpg?t=1776944378",
        mediaType: "screenshot-full",
        strategy: "remote-official-steam",
        attribution: steamAttribution,
      },
      "steam-screenshot-04-thumb": {
        id: "steam-screenshot-04-thumb",
        category: "game-media",
        label: "Steam screenshot 4 thumbnail",
        src: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/76b7460537ef52f21ebd95faa2dd769e54c2cace/ss_76b7460537ef52f21ebd95faa2dd769e54c2cace.600x338.jpg?t=1776944378",
        mediaType: "screenshot-thumb",
        strategy: "remote-official-steam",
        attribution: steamAttribution,
      },
      "steam-screenshot-04-full": {
        id: "steam-screenshot-04-full",
        category: "game-media",
        label: "Steam screenshot 4 full image",
        src: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/76b7460537ef52f21ebd95faa2dd769e54c2cace/ss_76b7460537ef52f21ebd95faa2dd769e54c2cace.1920x1080.jpg?t=1776944378",
        mediaType: "screenshot-full",
        strategy: "remote-official-steam",
        attribution: steamAttribution,
      },
    },
  },
  policy: {
    localPathRoot: "public",
    preferManifestLookups: true,
    placeholderStrategy:
      "Use procedural CSS/SVG-style placeholders for missing art; do not add unreviewed screenshots or copyrighted renders.",
    remoteGameMediaStrategy:
      "Keep official Steam media remote unless a future asset ingestion step stores reviewed local copies with attribution and source/terms notes.",
  },
} as const satisfies AssetManifest;

export type WeaponAssetKey = keyof typeof assetManifest.local.weapons;
export type PartAssetKey = keyof typeof assetManifest.local.parts;
export type GameMediaAssetKey = keyof typeof assetManifest.remote.gameMedia;

const weaponAssetById: Record<string, LocalAssetEntry & { category: "weapon" }> = assetManifest.local.weapons;
const partAssetById: Record<string, LocalAssetEntry & { category: "part" }> = assetManifest.local.parts;
const gameMediaAssetById: Record<string, GameMediaEntry> = assetManifest.remote.gameMedia;
const weaponAssets = Object.values(weaponAssetById);
const partAssets = Object.values(partAssetById);

export const localAssetEntries = [...weaponAssets, ...partAssets] as readonly LocalAssetEntry[];
export const gameMediaEntries = Object.values(assetManifest.remote.gameMedia) as readonly GameMediaEntry[];

function createCoverageMap<T extends LocalAssetEntry>(assets: readonly T[]): Record<string, T> {
  return Object.fromEntries(
    assets.flatMap((asset) => asset.coverage.armoryIds.map((armoryId) => [armoryId, asset] as const)),
  );
}

function createSrcMap<T extends LocalAssetEntry>(assetsByArmoryId: Record<string, T>): Record<string, string> {
  return Object.fromEntries(Object.entries(assetsByArmoryId).map(([armoryId, asset]) => [armoryId, asset.src]));
}

export const weaponRenderAssetsByPlatform = createCoverageMap(weaponAssets);
export const partRenderAssetsByPartId = createCoverageMap(partAssets);
export const weaponRenderSrcByPlatform = createSrcMap(weaponRenderAssetsByPlatform);
export const partRenderSrcByPartId = createSrcMap(partRenderAssetsByPartId);

export function getLocalAsset(category: "weapon", id: WeaponAssetKey): (typeof assetManifest.local.weapons)[WeaponAssetKey];
export function getLocalAsset(category: "part", id: PartAssetKey): (typeof assetManifest.local.parts)[PartAssetKey];
export function getLocalAsset(category: LocalAssetCategory, id: string): LocalAssetEntry | undefined;
export function getLocalAsset(category: LocalAssetCategory, id: string): LocalAssetEntry | undefined {
  return category === "weapon" ? weaponAssetById[id] : partAssetById[id];
}

export function getAssetForArmoryId(category: LocalAssetCategory, armoryId: string): LocalAssetEntry | undefined {
  return category === "weapon" ? weaponRenderAssetsByPlatform[armoryId] : partRenderAssetsByPartId[armoryId];
}

export function getAssetSrcForArmoryId(category: LocalAssetCategory, armoryId: string): string | undefined {
  return getAssetForArmoryId(category, armoryId)?.src;
}

export function getGameMediaAsset(id: GameMediaAssetKey): (typeof assetManifest.remote.gameMedia)[GameMediaAssetKey];
export function getGameMediaAsset(id: string): GameMediaEntry | undefined;
export function getGameMediaAsset(id: string): GameMediaEntry | undefined {
  return gameMediaAssetById[id];
}
