import { platforms, slotLabels, type Slot, type WeaponPlatform } from "../data/armory";
import { sanitizeSelections, type BuildSelections } from "./build";

export type ShareBuildPayload = {
  version: 1;
  platformId: string;
  selections: BuildSelections;
};

export type DecodedBuildShare =
  | {
      ok: true;
      platform: WeaponPlatform;
      selections: BuildSelections;
      warnings: string[];
    }
  | {
      ok: false;
      error: string;
    };

const sharePrefix = "wsp1_";

export function encodeBuildShare(platform: WeaponPlatform, selections: BuildSelections): string {
  const payload: ShareBuildPayload = {
    version: 1,
    platformId: platform.id,
    selections: sanitizeSelections(platform, selections),
  };

  return `${sharePrefix}${toBase64Url(JSON.stringify(payload))}`;
}

export function decodeBuildShare(value: string): DecodedBuildShare {
  const token = value.trim().replace(/^#/, "").replace(/^\?/, "");
  const encoded = token.startsWith(sharePrefix) ? token.slice(sharePrefix.length) : readBuildParam(token);

  if (!encoded) {
    return { ok: false, error: "No build share code found." };
  }

  try {
    const payload = JSON.parse(fromBase64Url(encoded)) as Partial<ShareBuildPayload>;
    if (payload.version !== 1 || typeof payload.platformId !== "string" || !isShareSelections(payload.selections)) {
      return { ok: false, error: "Build share code is not a supported WepSpec payload." };
    }

    const platform = platforms.find((item) => item.id === payload.platformId);
    if (!platform) {
      return { ok: false, error: `Unknown platform ${payload.platformId}.` };
    }

    const selections = sanitizeSelections(platform, payload.selections);
    const warnings = Object.entries(payload.selections).flatMap(([slot, id]) => {
      if (selections[slot as Slot] === id) {
        return [];
      }

      const label = slot in slotLabels ? slotLabels[slot as Slot] : slot;
      return [`${id} in ${label} was removed because it is not compatible with ${platform.name}.`];
    });

    return { ok: true, platform, selections, warnings };
  } catch {
    return { ok: false, error: "Build share code could not be decoded." };
  }
}

export function createShareUrl(baseUrl: string, platform: WeaponPlatform, selections: BuildSelections, paramName = "build") {
  const url = new URL(baseUrl);
  url.searchParams.set(paramName, encodeBuildShare(platform, selections));
  return url.toString();
}

export function readBuildShareFromUrl(url: string, paramName = "build"): DecodedBuildShare {
  try {
    return decodeBuildShare(new URL(url).searchParams.get(paramName) ?? "");
  } catch {
    return { ok: false, error: "Build URL is not valid." };
  }
}

function readBuildParam(value: string) {
  try {
    const params = new URLSearchParams(value);
    const fromParams = params.get("build");
    if (fromParams?.startsWith(sharePrefix)) {
      return fromParams.slice(sharePrefix.length);
    }

    return fromParams ?? value;
  } catch {
    return value;
  }
}

function toBase64Url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(padded);
}

function isShareSelections(value: unknown): value is BuildSelections {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value).every((id) => typeof id === "string");
}
