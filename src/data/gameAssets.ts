export const gameAssets = {
  source: "Official Steam store media for Gray Zone Warfare",
  storeUrl: "https://store.steampowered.com/app/2479810/Gray_Zone_Warfare/",
  header:
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/cbf65dafc3aad7c2ed1b8191680f1bfd9a07dbf5/header.jpg?t=1776944378",
  capsule:
    "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/98a7afd24071040c96f6010b798b88ccacb62038/capsule_231x87.jpg?t=1776944378",
  screenshots: [
    {
      thumb:
        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/2fa64e158672ee4026a37d5d4fd6029972225c00/ss_2fa64e158672ee4026a37d5d4fd6029972225c00.600x338.jpg?t=1776944378",
      full:
        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/2fa64e158672ee4026a37d5d4fd6029972225c00/ss_2fa64e158672ee4026a37d5d4fd6029972225c00.1920x1080.jpg?t=1776944378",
    },
    {
      thumb:
        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/5e7aa829f4b6374289fb5048bca4e1840f851dc5/ss_5e7aa829f4b6374289fb5048bca4e1840f851dc5.600x338.jpg?t=1776944378",
      full:
        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/5e7aa829f4b6374289fb5048bca4e1840f851dc5/ss_5e7aa829f4b6374289fb5048bca4e1840f851dc5.1920x1080.jpg?t=1776944378",
    },
    {
      thumb:
        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/554761289ced02f8b33e1e7f6b89c470032c8def/ss_554761289ced02f8b33e1e7f6b89c470032c8def.600x338.jpg?t=1776944378",
      full:
        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/554761289ced02f8b33e1e7f6b89c470032c8def/ss_554761289ced02f8b33e1e7f6b89c470032c8def.1920x1080.jpg?t=1776944378",
    },
    {
      thumb:
        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/76b7460537ef52f21ebd95faa2dd769e54c2cace/ss_76b7460537ef52f21ebd95faa2dd769e54c2cace.600x338.jpg?t=1776944378",
      full:
        "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/76b7460537ef52f21ebd95faa2dd769e54c2cace/ss_76b7460537ef52f21ebd95faa2dd769e54c2cace.1920x1080.jpg?t=1776944378",
    },
  ],
} as const;

export const weaponRenders: Record<string, string> = {
  m4a1: "/assets/weapons/m4a1.png",
  akmn: "/assets/weapons/akmn.png",
  mk18: "/assets/weapons/mk18.png",
  glock17: "/assets/weapons/glock17.png",
};

export const partRenders: Record<string, string> = {
  "m4-145-barrel": "/assets/parts/ar15-145-barrel.png",
  "m4-103-barrel": "/assets/parts/ar15-145-barrel.png",
  "a2-grip": "/assets/parts/a2-grip.png",
  "stanag-30": "/assets/parts/stanag-30.png",
  "pmag-30": "/assets/parts/pmag-30.png",
  "carry-handle": "/assets/parts/carry-handle.png",
  acog: "/assets/parts/acog.png",
  "carry-scope": "/assets/parts/specterdr.png",
  "g17-17mag": "/assets/parts/g17-mag.png",
  "rmr-slide": "/assets/parts/g17-hol.png",
};
