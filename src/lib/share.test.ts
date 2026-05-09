import { describe, expect, it } from "vitest";
import { platforms } from "../data/armory";
import { createShareUrl, decodeBuildShare, encodeBuildShare, readBuildShareFromUrl } from "./share";

const m4 = platforms.find((platform) => platform.id === "m4a1")!;

describe("build sharing", () => {
  it("round-trips a sanitized build through a share URL", () => {
    const selections = {
      barrel: "m4-145-barrel",
      handguard: "m4-classic-hg",
      stock: "m4-crane-stock",
      pistolGrip: "a2-grip",
      magazine: "stanag-30",
    };

    const url = createShareUrl("https://example.test/builds", m4, selections);
    const decoded = readBuildShareFromUrl(url);

    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.platform.id).toBe("m4a1");
      expect(decoded.selections).toEqual(selections);
      expect(decoded.warnings).toEqual([]);
    }
  });

  it("decodes stale share payloads and reports sanitizer removals", () => {
    const code = makeShareCode({
      version: 1,
      platformId: "m4a1",
      selections: {
        barrel: "m4-145-barrel",
        magazine: "m4-145-barrel",
        optic: "rmr-dot",
        staleSlot: "stanag-30",
      },
    });

    const decoded = decodeBuildShare(code);

    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.selections).toEqual({ barrel: "m4-145-barrel" });
      expect(decoded.warnings).toEqual([
        "m4-145-barrel in Magazine was removed because it is not compatible with M4A1.",
        "rmr-dot in Optic was removed because it is not compatible with M4A1.",
        "stanag-30 in staleSlot was removed because it is not compatible with M4A1.",
      ]);
    }
  });

  it("encodes only sanitized selections", () => {
    const decoded = decodeBuildShare(encodeBuildShare(m4, { barrel: "m4-145-barrel", optic: "rmr-dot" }));

    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.selections).toEqual({ barrel: "m4-145-barrel" });
    }
  });
});

function makeShareCode(payload: unknown) {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `wsp1_${encoded}`;
}
