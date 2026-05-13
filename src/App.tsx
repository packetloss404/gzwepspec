import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  CircleOff,
  Copy,
  Crosshair,
  ExternalLink,
  Github,
  Search,
  Settings,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import packageJson from "../package.json";
import { AssetImage } from "./components/AssetImage";
import { BuildSummary, type PriceCatalog } from "./components/BuildSummary";
import { PartInspector } from "./components/PartInspector";
import { SavedBuildsPanel } from "./components/SavedBuildsPanel";
import WeaponPreview from "./components/WeaponPreview";
import {
  platforms,
  parts,
  slotLabels,
  statDirection,
  statLabels,
  type Part,
  type Slot,
  type StatKey,
  type WeaponPlatform,
} from "./data/armory";
import { gameAssets, partRenders } from "./data/gameAssets";
import { partRenderAssetsByPartId, weaponRenderAssetsByPlatform, weaponRenderSrcByPlatform } from "./data/assetManifest";
import {
  checkAvailability,
  compatibleParts,
  statDelta,
} from "./lib/build";
import { formatSigned, formatSlotCode, formatTag, statKeys } from "./lib/formatting";
import {
  applyBuildPreset,
  createBuildPreset,
  loadBuildPresets,
  removeBuildPreset,
  saveBuildPreset,
  type BuildPreset,
  type BuildPresetGoal,
} from "./lib/buildPresets";
import { useBuildState } from "./hooks/useBuildState";
import { decodeBuildShare, encodeBuildShare } from "./lib/share";

const loyaltyLevels = ["1", "2", "3"] as const;

type SortMode = "relevance" | "name" | "vendor" | "price-asc" | "price-desc" | "best-stat";

function App() {
  const {
    platform,
    selections,
    activeSlot,
    inspectedPart,
    selectedParts,
    stats,
    availableSlots,
    tagSet,
    shareStatus,
    shareWarnings,
    shareCode: currentEncodedShare,
    selectPlatform: selectBuildPlatform,
    focusSlot,
    inspectPart,
    choosePart: chooseBuildPart,
    clearSlot: clearBuildSlot,
    applyIntent: applyPresetIntent,
    loadBuild,
    setShareStatus,
    copyShareLink: copyBuildShareLink,
  } = useBuildState();
  const [query, setQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareCode, setShareCode] = useState(currentEncodedShare);
  const [importCode, setImportCode] = useState("");
  const [savedBuilds, setSavedBuilds] = useState<BuildPreset[]>(() =>
    typeof window === "undefined" ? [] : loadBuildPresets(window.localStorage),
  );
  const [buildWarnings, setBuildWarnings] = useState<string[]>(shareWarnings);
  const [currentSlotOnly, setCurrentSlotOnly] = useState(true);
  const [compatibleOnly, setCompatibleOnly] = useState(false);
  const [hideLocked, setHideLocked] = useState(false);
  const [vendorFilter, setVendorFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const [lastAppliedPartId, setLastAppliedPartId] = useState<string | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const priceCatalog = useMemo<PriceCatalog>(() => {
    const entries = [
      ...platforms.map((item) => [item.id, item.price?.amount] as const),
      ...parts.map((part) => [part.id, part.price?.amount] as const),
    ].filter((entry): entry is readonly [string, number] => typeof entry[1] === "number");

    return Object.fromEntries(entries);
  }, []);
  const shareIsStale = shareCode !== currentEncodedShare;
  const vendorOptions = useMemo(
    () => Array.from(new Set(parts.map((part) => vendorName(part.vendor)))).sort((a, b) => a.localeCompare(b)),
    [],
  );
  const activeSlotSummary = useMemo(() => {
    const rows = compatibleParts(platform, activeSlot, selections);
    const compatible = rows.filter(({ availability }) => availability.available).length;
    const earlyVendor = rows.filter(({ part, availability }) => availability.available && !isHigherLoyalty(part)).length;

    return { total: rows.length, compatible, earlyVendor };
  }, [activeSlot, platform, selections]);
  const inspectedAvailability = useMemo(
    () => inspectedPart ? checkAvailability(platform, inspectedPart, selections) : null,
    [inspectedPart, platform, selections],
  );
  const inspectedInstalled = Boolean(inspectedPart && selections[inspectedPart.slot] === inspectedPart.id);
  const previewPart = inspectedPart && !inspectedInstalled && inspectedAvailability?.available ? inspectedPart : null;
  const previewParts = useMemo(() => {
    if (!previewPart) {
      return selectedParts;
    }

    return [...selectedParts.filter((part) => part.slot !== previewPart.slot), previewPart];
  }, [previewPart, selectedParts]);
  const inspectedSlotInstalledPart = inspectedPart
    ? selectedParts.find((part) => part.slot === inspectedPart.slot) ?? null
    : null;
  const activeSlotInstalledPart = selectedParts.find((part) => part.slot === activeSlot) ?? null;
  const workbenchState = inspectedInstalled ? "installed" : previewPart ? "preview" : inspectedPart ? "blocked" : "empty";
  const previewStatusLabel = previewPart
    ? inspectedSlotInstalledPart
      ? `Previewing ${previewPart.name} over ${inspectedSlotInstalledPart.name}`
      : `Previewing ${previewPart.name}`
    : inspectedInstalled && inspectedPart
      ? `${inspectedPart.name} is installed`
      : inspectedPart
        ? inspectedAvailability?.reasons[0] ?? `${inspectedPart.name} is blocked`
        : `Focused on ${slotLabels[activeSlot]}`;
  const activeFilterCount = [
    currentSlotOnly,
    compatibleOnly,
    hideLocked,
    vendorFilter !== "all",
    levelFilter !== "all",
    query.trim().length > 0,
  ].filter(Boolean).length;
  const lockerParts = useMemo(() => {
    const rows = parts
      .filter((part) => availableSlots.includes(part.slot))
      .map((part) => ({ part, availability: checkAvailability(platform, part, selections) }));
    const normalized = query.trim().toLowerCase();

    return rows
      .filter(({ part, availability }) => {
        if (currentSlotOnly && part.slot !== activeSlot) {
          return false;
        }

        if (compatibleOnly && !availability.available) {
          return false;
        }

        if (hideLocked && isHigherLoyalty(part)) {
          return false;
        }

        if (vendorFilter !== "all" && vendorName(part.vendor) !== vendorFilter) {
          return false;
        }

        if (levelFilter !== "all" && String(loyaltyLevel(part) ?? "") !== levelFilter) {
          return false;
        }

        if (!normalized) {
          return true;
        }

        return `${part.name} ${part.vendor} ${part.type} ${slotLabels[part.slot]} ${part.notes ?? ""}`.toLowerCase().includes(normalized);
      })
      .sort((a, b) => {
        if (sortMode === "name") {
          return a.part.name.localeCompare(b.part.name);
        }

        if (sortMode === "vendor") {
          return a.part.vendor.localeCompare(b.part.vendor) || a.part.name.localeCompare(b.part.name);
        }

        if (sortMode === "price-asc") {
          return (a.part.price?.amount ?? Number.MAX_SAFE_INTEGER) - (b.part.price?.amount ?? Number.MAX_SAFE_INTEGER);
        }

        if (sortMode === "price-desc") {
          return (b.part.price?.amount ?? 0) - (a.part.price?.amount ?? 0);
        }

        if (sortMode === "best-stat") {
          return partScore(b.part) - partScore(a.part) || a.part.name.localeCompare(b.part.name);
        }

        const selectedA = selections[a.part.slot] === a.part.id ? 1 : 0;
        const selectedB = selections[b.part.slot] === b.part.id ? 1 : 0;
        const slotA = a.part.slot === activeSlot ? 1 : 0;
        const slotB = b.part.slot === activeSlot ? 1 : 0;
        const availableA = a.availability.available ? 1 : 0;
        const availableB = b.availability.available ? 1 : 0;

        return selectedB - selectedA || slotB - slotA || availableB - availableA || a.part.slot.localeCompare(b.part.slot);
      });
  }, [activeSlot, availableSlots, compatibleOnly, currentSlotOnly, hideLocked, levelFilter, platform, query, selections, sortMode, vendorFilter]);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (settingsMenuRef.current?.contains(target) || settingsButtonRef.current?.contains(target)) {
        return;
      }

      setSettingsOpen(false);
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setSettingsOpen(false);
      settingsButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    settingsMenuRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')?.focus();

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen]);

  function choosePart(part: Part) {
    const availability = checkAvailability(platform, part, selections);
    chooseBuildPart(part);
    if (availability.available) {
      setLastAppliedPartId(part.id);
      setShareStatus(`${part.name} mounted`, []);
    }
  }

  function clearSlot(slot: Slot) {
    clearBuildSlot(slot);
    setLastAppliedPartId(null);
  }

  function selectPlatform(nextPlatformId: string) {
    selectBuildPlatform(nextPlatformId);
    setBuildWarnings([]);
    setLastAppliedPartId(null);
  }

  function saveCurrentBuild(name: string) {
    const preset = createBuildPreset(platform, selections, { name });
    setSavedBuilds(saveBuildPreset(window.localStorage, preset));
    setBuildWarnings([]);
    setShareStatus("Build saved", []);
  }

  function applySavedBuild(preset: BuildPreset) {
    const targetPlatform = platforms.find((item) => item.id === preset.platformId) ?? platform;
    const result = applyBuildPreset(targetPlatform, preset);
    loadBuild(targetPlatform, result.preset.selections, result.warnings[0] ?? `${preset.name} applied`, result.warnings);
    setShareCode(encodeBuildShare(targetPlatform, result.preset.selections));
    setBuildWarnings(result.warnings);
    setLastAppliedPartId(null);
  }

  function deleteSavedBuild(presetId: string) {
    setSavedBuilds(removeBuildPreset(window.localStorage, presetId));
    setBuildWarnings([]);
    setShareStatus("Saved build deleted", []);
  }

  function importSharedBuild() {
    const decoded = decodeBuildShare(importCode);
    if (!decoded.ok) {
      setBuildWarnings([decoded.error]);
      setShareStatus(decoded.error, [decoded.error]);
      return;
    }

    loadBuild(decoded.platform, decoded.selections, decoded.warnings[0] ?? "Shared build imported", decoded.warnings);
    setShareCode(encodeBuildShare(decoded.platform, decoded.selections));
    setBuildWarnings(decoded.warnings);
    setImportCode("");
    setLastAppliedPartId(null);
  }

  function applyIntent(intent: BuildPresetGoal) {
    applyPresetIntent(intent);
    setBuildWarnings([]);
    setLastAppliedPartId(null);
  }

  async function copyShareLink() {
    try {
      const copiedShareCode = await copyBuildShareLink();
      setShareCode(copiedShareCode);
      setShareCopied(true);
      setBuildWarnings([]);
    } catch {
      const warning = "Clipboard access was blocked. Use the share code field instead.";
      setShareCopied(false);
      setBuildWarnings([warning]);
      setShareStatus(warning, [warning]);
    }
  }

  function scrollToSection(sectionId: string) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <main className="game-shell">
      <div className="scene-backdrop" aria-hidden="true">
        <AssetImage src={gameAssets.screenshots[0].full} alt="" />
      </div>
      <header className="hud-bar">
        <nav className="hud-tabs" aria-label="Armory sections">
          <AssetImage className="brand-strip" src={gameAssets.capsule} alt="Gray Zone Warfare" />
          <button className="active" type="button" onClick={() => scrollToSection("weapon-panel")}>Weapons</button>
          <button type="button" onClick={() => scrollToSection("parts-locker")}>Parts</button>
          <button type="button" onClick={() => scrollToSection("build-workbench")}>Stats</button>
        </nav>
        <div className="hud-actions">
          <button
            className="squad-button"
            type="button"
            onClick={() => {
              setSettingsOpen(false);
              scrollToSection("build-workbench");
            }}
          >
            <SlidersHorizontal size={14} /> Saved builds
          </button>
          <div className="settings-wrap">
            <button
              ref={settingsButtonRef}
              className={settingsOpen ? "icon-button active" : "icon-button"}
              type="button"
              aria-label="Settings"
              aria-controls="settings-menu"
              aria-expanded={settingsOpen}
              aria-haspopup="menu"
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </header>

      {settingsOpen && (
        <div id="settings-menu" className="settings-menu" ref={settingsMenuRef} role="menu" aria-label="Settings">
          <div className="settings-row" role="presentation">
            <span>Version</span>
            <strong>v{packageJson.version}</strong>
          </div>
          <a href="https://github.com/packetloss404/gzwepspec" target="_blank" rel="noreferrer" role="menuitem">
            <Github size={14} />
            GitHub
            <ExternalLink size={12} />
          </a>
          <a href="/assets/ATTRIBUTION.md" target="_blank" rel="noreferrer" role="menuitem">
            <ExternalLink size={14} />
            Asset Credits
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {shareStatus || previewStatusLabel}
      </div>

      <section className="inventory-layout">
        <aside id="weapon-panel" className="weapon-window glass">
          <div className="window-head">
            <div>
              <h1>{platform.name}</h1>
              <span>{platform.caliber}</span>
            </div>
          </div>

          <div className="weapon-scene">
            <WeaponPreview
              platform={platform}
              selectedParts={previewParts}
              activeSlot={activeSlot}
              onSlotFocus={focusSlot}
            />
            <div className="preview-handoff" data-previewing={Boolean(previewPart)}>
              <span>{previewPart ? "Previewing swap" : "Active slot"}</span>
              <strong>{previewPart ? previewPart.name : activeSlotInstalledPart?.name ?? slotLabels[activeSlot]}</strong>
            </div>
          </div>

          <div className="weapon-ammo">
            <span>{selectedParts.length} parts / {platform.skins?.length ?? 0} finishes listed</span>
            <strong>{platform.unlock ? `${platform.vendor} LL${platform.unlock.level}` : platform.vendor}</strong>
          </div>

          <div className="installed-assets" aria-label="Installed weapon parts">
            {selectedParts.slice(0, 8).map((part) => (
              <button
                key={part.id}
                className={[
                  part.slot === activeSlot ? "active" : "",
                  inspectedPart?.id === part.id ? "inspected" : "",
                  lastAppliedPartId === part.id ? "recent" : "",
                ].filter(Boolean).join(" ")}
                type="button"
                aria-pressed={part.slot === activeSlot}
                aria-label={`Focus installed ${slotLabels[part.slot]}: ${part.name}${lastAppliedPartId === part.id ? ", recently mounted" : ""}`}
                onClick={() => focusSlot(part.slot)}
              >
                {partRenderAssetsByPartId[part.id] || partRenders[part.id] ? (
                  <AssetImage asset={partRenderAssetsByPartId[part.id]} src={partRenders[part.id]} alt="" fallback={<i style={{ background: part.color ?? "#39423c" }} />} />
                ) : (
                  <i style={{ background: part.color ?? "#39423c" }} />
                )}
                <span>{formatSlotCode(part.slot)}</span>
              </button>
            ))}
            {Array.from({ length: Math.max(0, 8 - selectedParts.length) }).map((_, index) => (
              <button key={`empty-installed-${index}`} type="button" disabled>
                <i />
                <span>EMPTY</span>
              </button>
            ))}
          </div>

          <div className="stat-table">
            {statKeys.map((key) => (
              <StatLine key={key} statKey={key} value={stats[key]} base={platform.baseStats[key]} />
            ))}
          </div>

          <div className="mode-row">
            <button type="button" onClick={() => applyIntent("factory")}>Factory</button>
            <button type="button" onClick={() => applyIntent("assault")}>Assault</button>
            <button type="button" onClick={() => applyIntent("recce")}>Recce</button>
            <button type="button" onClick={() => applyIntent("suppressed")}>Suppressed</button>
          </div>

          <div className="attachment-strip">
            {availableSlots.map((slot) => {
              const selected = selectedParts.find((part) => part.slot === slot);
              const count = compatibleParts(platform, slot, selections).filter(({ availability }) => availability.available).length;

              return (
                <button
                  key={slot}
                  className={activeSlot === slot ? "attachment-slot active" : "attachment-slot"}
                  data-previewing={previewPart?.slot === slot}
                  data-filled={Boolean(selected)}
                  type="button"
                  aria-pressed={activeSlot === slot}
                  aria-label={`${slotLabels[slot]} slot, ${selected ? selected.name : `${count} compatible parts`}`}
                  onClick={() => focusSlot(slot)}
                >
                  <span>{formatSlotCode(slot)}</span>
                  <strong>{selected ? itemAbbrev(selected.name) : "+"}</strong>
                  <small>{previewPart?.slot === slot ? `Preview: ${itemAbbrev(previewPart.name)}` : selected ? selected.type : `${count} fit`}</small>
                </button>
              );
            })}
          </div>

          <p className="weapon-copy">
            Mounts, rails, adapters, and muzzle threads control which parts fit.
          </p>
        </aside>

        <aside id="parts-locker" className="locker glass">
          <div className="locker-head">
            <div>
              <PanelTitle label="Parts Locker" />
              <span>
                {slotLabels[activeSlot]} focus: {activeSlotSummary.compatible} fit / {activeSlotSummary.earlyVendor} early listings
              </span>
            </div>
            <strong>{lockerParts.length} shown{activeFilterCount ? ` / ${activeFilterCount} filters` : ""}</strong>
          </div>

          <a className="official-card" href={gameAssets.storeUrl} target="_blank" rel="noreferrer">
            <AssetImage src={gameAssets.header} alt="Gray Zone Warfare Steam store header" />
            <span>Steam store media</span>
          </a>

          <div className="platform-grid">
            {platforms.map((item) => {
              const installed = item.requiredSlots.length + item.optionalSlots.length;
              const finishCount = item.skins?.length ?? 0;

              return (
                <button
                  key={item.id}
                  className={`weapon-tile ${item.id === platform.id ? "active" : ""}`}
                  type="button"
                  aria-pressed={item.id === platform.id}
                  aria-label={`${item.name}, ${item.caliber}, ${platformVendorLabel(item)}, ${finishCount} finishes listed`}
                  onClick={() => selectPlatform(item.id)}
                >
                  <AssetImage
                    className="weapon-tile__render"
                    asset={weaponRenderAssetsByPlatform[item.id]}
                    src={weaponRenderSrcByPlatform[item.id]}
                    alt=""
                    fallback={null}
                  />
                  <Crosshair size={15} />
                  <span>{item.name}</span>
                  <small>{item.caliber}</small>
                  <em>{platformVendorLabel(item)}</em>
                  <b>{installed} slots / {finishCount} finishes</b>
                </button>
              );
            })}
          </div>

          <div className="locker-tools">
            <label className="slot-select">
              <select
                aria-label="Attachment slot"
                value={activeSlot}
                onChange={(event) => {
                  const slot = event.target.value as Slot;
                  focusSlot(slot);
                }}
              >
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slotLabels[slot]}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} />
            </label>
            <label className="stash-search">
              <Search size={15} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter parts" aria-label="Filter parts" />
            </label>
          </div>

          <div className="locker-filters" aria-label="Part filters">
            <button
              className={currentSlotOnly ? "active" : ""}
              type="button"
              aria-label={currentSlotOnly ? `Showing only ${slotLabels[activeSlot]} parts` : "Showing all attachment slots"}
              aria-pressed={currentSlotOnly}
              onClick={() => setCurrentSlotOnly((enabled) => !enabled)}
            >
              {currentSlotOnly ? `${formatSlotCode(activeSlot)} only` : "All slots"}
            </button>
            <button
              className={compatibleOnly ? "active" : ""}
              type="button"
              aria-label="Show only compatible parts"
              aria-pressed={compatibleOnly}
              onClick={() => setCompatibleOnly((enabled) => !enabled)}
            >
              Fits
            </button>
            <button
              className={hideLocked ? "active" : ""}
              type="button"
              aria-label="Hide higher-loyalty listings"
              aria-pressed={hideLocked}
              onClick={() => setHideLocked((enabled) => !enabled)}
            >
              Early LL
            </button>
            <label>
              <select aria-label="Filter vendor" value={vendorFilter} onChange={(event) => setVendorFilter(event.target.value)}>
                <option value="all">All Vendors</option>
                {vendorOptions.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>
            <label>
              <select aria-label="Filter loyalty level" value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
                <option value="all">All LL</option>
                {loyaltyLevels.map((level) => (
                  <option key={level} value={level}>
                    LL{level}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>
            <label>
              <select aria-label="Sort parts" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
                <option value="relevance">Sort: Fit</option>
                <option value="best-stat">Sort: Stat</option>
                <option value="name">Sort: Name</option>
                <option value="vendor">Sort: Vendor</option>
                <option value="price-asc">Sort: $ Low</option>
                <option value="price-desc">Sort: $ High</option>
              </select>
              <ChevronDown size={13} />
            </label>
          </div>

          {lockerParts.length ? (
            <div className="stash-grid">
              {lockerParts.map(({ part, availability }) => (
                <StashItem
                  key={part.id}
                  part={part}
                  active={selections[part.slot] === part.id}
                  inspected={inspectedPart?.id === part.id}
                  previewing={previewPart?.id === part.id}
                  recentlyApplied={lastAppliedPartId === part.id}
                  available={availability.available}
                  traderLocked={isHigherLoyalty(part)}
                  reason={availability.reasons[0] ?? loyaltyHint(part)}
                  onClick={() => inspectPart(part)}
                />
              ))}
              {Array.from({ length: Math.max(0, 42 - lockerParts.length) }).map((_, index) => (
                <div className="stash-empty" key={`empty-${index}`} />
              ))}
            </div>
          ) : (
            <div className="stash-null">
              <strong>No matching parts</strong>
              <span>Adjust the slot, vendor, LL, or fit filters.</span>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCurrentSlotOnly(false);
                  setCompatibleOnly(false);
                  setHideLocked(false);
                  setVendorFilter("all");
                  setLevelFilter("all");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </aside>
      </section>

      <section id="build-workbench" className="bench glass">
        <div className="bench-head">
          <PanelTitle label="Build Workbench" icon={<SlidersHorizontal size={15} />} />
          <div className="swap-flow" data-state={workbenchState} role="status" aria-live="polite">
            <span>{inspectedPart ? slotLabels[inspectedPart.slot] : slotLabels[activeSlot]}</span>
            <strong>
              {inspectedPart
                ? inspectedInstalled
                  ? "Installed part selected"
                  : previewPart
                    ? inspectedSlotInstalledPart
                      ? `Compare vs ${itemAbbrev(inspectedSlotInstalledPart.name)}`
                      : "Ready to mount"
                    : inspectedAvailability?.reasons[0] ?? "Inspect a compatible part"
                : "Pick a part to compare"}
            </strong>
          </div>
          {previewPart && (
            <button
              className="bench-head__primary"
              type="button"
              aria-label={`Mount previewed ${previewPart.name}`}
              onClick={() => choosePart(previewPart)}
            >
              <Wrench size={13} /> Mount preview
            </button>
          )}
          {inspectedPart && !previewPart && !inspectedInstalled && inspectedAvailability && (
            <span className="bench-head__warning" role="status">
              <AlertTriangle size={13} /> {inspectedAvailability.reasons[0] ?? "Blocked"}
            </span>
          )}
          <button type="button" onClick={copyShareLink}>
            <Copy size={13} /> Share build
          </button>
          {selections[activeSlot] && (
            <button type="button" onClick={() => clearSlot(activeSlot)}>
              Clear {slotLabels[activeSlot]}
            </button>
          )}
        </div>
        <div className="workbench-grid">
          <BuildSummary platform={platform} selections={selections} priceCatalog={priceCatalog} />
          <PartInspector
            platform={platform}
            part={inspectedPart}
            selections={selections}
            priceCatalog={priceCatalog}
            vendorLocked={inspectedPart ? isHigherLoyalty(inspectedPart) : false}
            lockHint={inspectedPart ? loyaltyHint(inspectedPart) : undefined}
            className={previewPart ? "is-previewing" : inspectedInstalled ? "is-installed" : undefined}
            onApply={choosePart}
            onClearSlot={clearSlot}
          />
          <SavedBuildsPanel
            builds={savedBuilds}
            currentShareCode={shareCode}
            copied={shareCopied && !shareIsStale}
            importCode={importCode}
            warnings={buildWarnings}
            dirtyShare={shareIsStale}
            onSave={saveCurrentBuild}
            onApply={applySavedBuild}
            onDelete={deleteSavedBuild}
            onCopy={copyShareLink}
            onImportCodeChange={setImportCode}
            onImport={importSharedBuild}
          />
          <div className="chain-tags" aria-label="Attachment capabilities">
            {shareStatus && <span className="status-tag">{shareStatus}</span>}
            {tagSet.map((tag) => (
              <span key={tag}>{formatTag(tag)}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function PanelTitle({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <div className="panel-title">
      {icon ?? <ChevronDown size={14} />}
      <span>{label}</span>
    </div>
  );
}

function StashItem({
  part,
  active,
  inspected,
  previewing,
  recentlyApplied,
  available,
  traderLocked,
  reason,
  onClick,
}: {
  part: Part;
  active: boolean;
  inspected: boolean;
  previewing: boolean;
  recentlyApplied: boolean;
  available: boolean;
  traderLocked: boolean;
  reason?: string;
  onClick: () => void;
}) {
  const locked = !available;
  const level = loyaltyLevel(part) ?? 1;
  const price = part.price?.amount;
  const status = active ? "Installed" : recentlyApplied ? "Mounted" : previewing ? "Preview" : traderLocked ? `LL${level}` : available ? "Fits" : "Blocked";
  const statusIcon = !available ? <CircleOff size={13} /> : <BadgeCheck size={13} />;

  return (
    <button
      className={`stash-item ${active ? "active" : ""} ${inspected ? "inspected" : ""} ${previewing ? "previewing" : ""} ${recentlyApplied ? "recent" : ""} ${locked ? "locked" : ""}`}
      title={locked ? reason : traderLocked ? reason ?? part.name : part.name}
      type="button"
      aria-pressed={active}
      aria-label={`${part.name}, ${slotLabels[part.slot]}, ${previewing ? "previewing in weapon view" : locked ? reason ?? "blocked" : traderLocked ? reason ?? `LL${level}` : deltaPreview(part)}`}
      onClick={onClick}
    >
      <span className="stash-item__slot">{formatSlotCode(part.slot)}</span>
      <span className="stash-item__status">{statusIcon}{status}</span>
      <i style={{ background: part.color ?? "#39423c" }} />
      <AssetImage
        asset={{ category: "part", armoryId: part.id }}
        src={partRenders[part.id]}
        alt=""
        fallback={null}
        fallbackLabel={`${part.name} reviewed art pending`}
      />
      <strong>{itemAbbrev(part.name)}</strong>
      <small>{vendorName(part.vendor)} LL{level}{price ? ` / $${price.toLocaleString()}` : ""}</small>
      <em>{locked ? reason ?? "Blocked" : traderLocked ? reason ?? deltaPreview(part) : deltaPreview(part)}</em>
    </button>
  );
}

function StatLine({ statKey, value, base }: { statKey: StatKey; value: number; base: number }) {
  const delta = value - base;
  const positive = statDirection[statKey] === "higher" ? delta >= 0 : delta <= 0;

  return (
    <div className="stat-line">
      <span>{statLabels[statKey]}</span>
      <strong>{statKey === "weight" ? value.toFixed(2) : value}</strong>
      <em className={positive ? "good" : "bad"}>{formatSigned(delta)}</em>
    </div>
  );
}

function deltaPreview(part: Part) {
  const entries = statKeys
    .map((key) => ({ key, value: statDelta(part, key) }))
    .filter((entry) => entry.value !== 0)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 2);

  if (!entries.length) {
    return part.type;
  }

  return entries.map(({ key, value }) => `${statLabels[key]} ${formatSigned(value)}`).join(" / ");
}

function partScore(part: Part) {
  return statKeys.reduce((score, key) => {
    const delta = statDelta(part, key);
    const normalized = statDirection[key] === "lower" ? -delta : delta;
    return score + normalized;
  }, 0);
}

function vendorName(vendor: string) {
  return vendor.replace(/\s+LL[1-3]\b/i, "");
}

function loyaltyLevel(part: Part) {
  const vendorLevel = part.vendor.match(/\bLL([1-3])\b/i)?.[1];
  return part.unlock?.level ?? (vendorLevel ? Number(vendorLevel) : undefined);
}

function isHigherLoyalty(part: Part) {
  return (loyaltyLevel(part) ?? 1) > 1;
}

function platformVendorLabel(platform: WeaponPlatform) {
  return platform.unlock ? `${platform.unlock.vendor} LL${platform.unlock.level}` : `${platform.vendor} LL1`;
}

function loyaltyHint(part: Part) {
  const level = loyaltyLevel(part);
  if (!level || level <= 1) {
    return undefined;
  }

  const unlock = part.unlock;
  const vendor = unlock?.vendor ?? vendorName(part.vendor);
  return `Listed at ${vendor} LL${level}`;
}

function itemAbbrev(name: string) {
  return name
    .replace(/\b(AR-15|AKM|AK|G17|M-LOK|SOCOM|STANAG|PMAG|RMR)\b/g, (match) => match)
    .split(/\s+/)
    .filter((word) => !["Round", "Tactical", "Polymer", "Combat", "Weapon"].includes(word))
    .slice(0, 3)
    .join(" ");
}

export default App;
