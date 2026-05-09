import { useCallback, useMemo, useReducer } from "react";
import { parts, platforms, slotOrder, type Part, type Slot, type WeaponPlatform } from "../data/armory";
import {
  checkAvailability,
  getSelectedParts,
  getTagSet,
  sanitizeSelections,
  starterSelections,
  totalStats,
  type BuildSelections,
} from "../lib/build";
import { generateBuildPreset, type BuildPresetGoal } from "../lib/buildPresets";
import { createShareUrl, encodeBuildShare, readBuildShareFromUrl } from "../lib/share";

type BuildState = {
  platformId: string;
  selections: BuildSelections;
  activeSlot: Slot;
  inspectedPartId: string | null;
  shareStatus: string;
  shareWarnings: string[];
};

type BuildAction =
  | { type: "selectPlatform"; platformId: string }
  | { type: "focusSlot"; slot: Slot }
  | { type: "inspectPart"; part: Part }
  | { type: "choosePart"; part: Part }
  | { type: "clearSlot"; slot: Slot }
  | { type: "applyIntent"; intent: BuildPresetGoal }
  | { type: "loadBuild"; platform: WeaponPlatform; selections: BuildSelections; status: string; warnings?: string[] }
  | { type: "setShareStatus"; status: string; warnings?: string[] };

export type UseBuildStateResult = {
  platformId: string;
  platform: (typeof platforms)[number];
  selections: BuildSelections;
  activeSlot: Slot;
  inspectedPart: Part | null;
  selectedParts: Part[];
  stats: ReturnType<typeof totalStats>;
  availableSlots: Slot[];
  tagSet: string[];
  shareStatus: string;
  shareWarnings: string[];
  shareCode: string;
  selectPlatform: (platformId: string) => void;
  focusSlot: (slot: Slot) => void;
  inspectPart: (part: Part) => void;
  choosePart: (part: Part) => void;
  clearSlot: (slot: Slot) => void;
  applyIntent: (intent: BuildPresetGoal) => void;
  loadBuild: (platform: WeaponPlatform, selections: BuildSelections, status: string, warnings?: string[]) => void;
  setShareStatus: (status: string, warnings?: string[]) => void;
  copyShareLink: () => Promise<string>;
};

export function useBuildState(): UseBuildStateResult {
  const [state, dispatch] = useReducer(buildStateReducer, undefined, createInitialBuildState);
  const platform = getPlatform(state.platformId);
  const selectedParts = useMemo(() => getSelectedParts(state.selections), [state.selections]);
  const stats = useMemo(() => totalStats(platform, state.selections), [platform, state.selections]);
  const availableSlots = useMemo(() => getAvailableSlots(platform), [platform]);
  const tagSet = useMemo(() => Array.from(getTagSet(platform, state.selections)).sort(), [platform, state.selections]);
  const shareCode = useMemo(() => encodeBuildShare(platform, state.selections), [platform, state.selections]);
  const inspectedPart = useMemo(() => {
    if (state.inspectedPartId) {
      return parts.find((part) => part.id === state.inspectedPartId) ?? null;
    }

    return parts.find((part) => part.id === state.selections[state.activeSlot]) ?? null;
  }, [state.activeSlot, state.inspectedPartId, state.selections]);

  const copyShareLink = useCallback(async () => {
    const url = createShareUrl(window.location.href, platform, state.selections);
    await navigator.clipboard.writeText(url);
    const code = encodeBuildShare(platform, state.selections);
    dispatch({ type: "setShareStatus", status: "Build link copied", warnings: [] });
    return code;
  }, [platform, state.selections]);

  return {
    platformId: state.platformId,
    platform,
    selections: state.selections,
    activeSlot: state.activeSlot,
    inspectedPart,
    selectedParts,
    stats,
    availableSlots,
    tagSet,
    shareStatus: state.shareStatus,
    shareWarnings: state.shareWarnings,
    shareCode,
    selectPlatform: (platformId) => dispatch({ type: "selectPlatform", platformId }),
    focusSlot: (slot) => dispatch({ type: "focusSlot", slot }),
    inspectPart: (part) => dispatch({ type: "inspectPart", part }),
    choosePart: (part) => dispatch({ type: "choosePart", part }),
    clearSlot: (slot) => dispatch({ type: "clearSlot", slot }),
    applyIntent: (intent) => dispatch({ type: "applyIntent", intent }),
    loadBuild: (platform, selections, status, warnings) => dispatch({ type: "loadBuild", platform, selections, status, warnings }),
    setShareStatus: (status, warnings) => dispatch({ type: "setShareStatus", status, warnings }),
    copyShareLink,
  };
}

function buildStateReducer(state: BuildState, action: BuildAction): BuildState {
  const platform = getPlatform(state.platformId);

  switch (action.type) {
    case "selectPlatform": {
      const nextPlatform = getPlatform(action.platformId);
      return {
        platformId: nextPlatform.id,
        selections: starterSelections(nextPlatform),
        activeSlot: getDefaultActiveSlot(nextPlatform),
        inspectedPartId: null,
        shareStatus: "",
        shareWarnings: [],
      };
    }

    case "focusSlot":
      return {
        ...state,
        activeSlot: action.slot,
        inspectedPartId: state.selections[action.slot] ?? null,
      };

    case "inspectPart":
      return {
        ...state,
        activeSlot: action.part.slot,
        inspectedPartId: action.part.id,
      };

    case "choosePart": {
      const availability = checkAvailability(platform, action.part, state.selections);
      if (!availability.available) {
        return {
          ...state,
          activeSlot: action.part.slot,
          inspectedPartId: action.part.id,
        };
      }

      return {
        ...state,
        activeSlot: action.part.slot,
        selections: sanitizeSelections(platform, { ...state.selections, [action.part.slot]: action.part.id }),
        inspectedPartId: action.part.id,
      };
    }

    case "clearSlot": {
      const next = { ...state.selections };
      delete next[action.slot];

      return {
        ...state,
        selections: sanitizeSelections(platform, next),
        inspectedPartId: null,
      };
    }

    case "applyIntent": {
      const preset = generateBuildPreset(platform, action.intent);
      return {
        ...state,
        selections: preset.selections,
        inspectedPartId: null,
        shareStatus: "",
        shareWarnings: [],
      };
    }

    case "loadBuild":
      return {
        platformId: action.platform.id,
        selections: sanitizeSelections(action.platform, action.selections),
        activeSlot: getDefaultActiveSlot(action.platform),
        inspectedPartId: null,
        shareStatus: action.status,
        shareWarnings: action.warnings ?? [],
      };

    case "setShareStatus":
      return {
        ...state,
        shareStatus: action.status,
        shareWarnings: action.warnings ?? state.shareWarnings,
      };
  }
}

function createInitialBuildState(): BuildState {
  const shared = typeof window === "undefined" ? null : readBuildShareFromUrl(window.location.href);
  if (shared?.ok) {
    return {
      platformId: shared.platform.id,
      selections: shared.selections,
      activeSlot: getDefaultActiveSlot(shared.platform),
      inspectedPartId: null,
      shareStatus: shared.warnings[0] ?? "Shared build loaded",
      shareWarnings: shared.warnings,
    };
  }

  const platform = platforms[0];
  return {
    platformId: platform.id,
    selections: starterSelections(platform),
    activeSlot: getDefaultActiveSlot(platform),
    inspectedPartId: null,
    shareStatus: "",
    shareWarnings: [],
  };
}

function getPlatform(platformId: string) {
  return platforms.find((item) => item.id === platformId) ?? platforms[0];
}

function getAvailableSlots(platform: (typeof platforms)[number]) {
  return slotOrder.filter((slot) => platform.requiredSlots.includes(slot) || platform.optionalSlots.includes(slot));
}

function getDefaultActiveSlot(platform: (typeof platforms)[number]): Slot {
  if (platform.optionalSlots.includes("optic")) {
    return "optic";
  }

  return platform.requiredSlots[0] ?? slotOrder[0];
}
