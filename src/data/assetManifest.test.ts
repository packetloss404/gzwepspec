import { describe, expect, it } from "vitest";
import { parts, platforms } from "./armory";
import { assetManifest, localAssetEntries } from "./assetManifest";

const platformIds = new Set(platforms.map((platform) => platform.id));
const partIds = new Set(parts.map((part) => part.id));

describe("asset manifest", () => {
  it("keeps local public URLs and file paths aligned", () => {
    const pathErrors = localAssetEntries.flatMap((asset) => {
      const expectedSrc = asset.localPath.replace(/^public/, "").replace(/\\/g, "/");
      const expectedMimeType = asset.localPath.endsWith(".webp")
        ? "image/webp"
        : asset.localPath.endsWith(".png")
          ? "image/png"
          : undefined;

      return [
        asset.src === expectedSrc ? null : `${asset.id} src ${asset.src} does not match ${asset.localPath}`,
        asset.mimeType === expectedMimeType ? null : `${asset.id} mime ${asset.mimeType} does not match ${asset.localPath}`,
      ].filter((error): error is string => Boolean(error));
    });

    expect(pathErrors).toEqual([]);
  });

  it("only points local coverage at known armory records", () => {
    const coverageErrors = localAssetEntries.flatMap((asset) => {
      const validIds = asset.category === "weapon" ? platformIds : partIds;

      return asset.coverage.armoryIds
        .filter((armoryId) => !validIds.has(armoryId))
        .map((armoryId) => `${asset.category}:${asset.id} covers unknown ${armoryId}`);
    });

    expect(coverageErrors).toEqual([]);
  });

  it("documents every representative or shared local render", () => {
    const missingNotes = localAssetEntries
      .filter((asset) => asset.coverage.mode !== "exact" && !asset.coverage.notes?.trim())
      .map((asset) => `${asset.category}:${asset.id}`);

    expect(missingNotes).toEqual([]);
  });

  it("keeps official Steam media remote-only", () => {
    const localSteamMedia = Object.values(assetManifest.remote.gameMedia)
      .filter((asset) => asset.strategy === "remote-official-steam" && asset.src.startsWith("/assets/"))
      .map((asset) => asset.id);

    expect(localSteamMedia).toEqual([]);
  });
});
