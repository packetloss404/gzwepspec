import {
  assetManifest,
  partRenderSrcByPartId,
  weaponRenderSrcByPlatform,
  type GameMediaAssetKey,
} from "./assetManifest";

const gameMedia = assetManifest.remote.gameMedia;

function mediaSrc(id: GameMediaAssetKey) {
  return gameMedia[id].src;
}

export const gameAssets = {
  source: gameMedia["steam-header"].attribution.source,
  storeUrl: gameMedia["steam-header"].attribution.sourceUrl,
  header: mediaSrc("steam-header"),
  capsule: mediaSrc("steam-capsule"),
  screenshots: [
    {
      thumb: mediaSrc("steam-screenshot-01-thumb"),
      full: mediaSrc("steam-screenshot-01-full"),
    },
    {
      thumb: mediaSrc("steam-screenshot-02-thumb"),
      full: mediaSrc("steam-screenshot-02-full"),
    },
    {
      thumb: mediaSrc("steam-screenshot-03-thumb"),
      full: mediaSrc("steam-screenshot-03-full"),
    },
    {
      thumb: mediaSrc("steam-screenshot-04-thumb"),
      full: mediaSrc("steam-screenshot-04-full"),
    },
  ],
} as const;

export const officialGameMedia = gameMedia;
export const weaponRenders: Record<string, string> = weaponRenderSrcByPlatform;
export const partRenders: Record<string, string> = partRenderSrcByPartId;
