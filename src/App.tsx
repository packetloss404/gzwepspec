import {
  BadgeCheck,
  ChevronDown,
  CircleOff,
  Construction,
  Copy,
  Crosshair,
  ExternalLink,
  Github,
  Search,
  Settings,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
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
} from "./data/armory";
import { gameAssets, partRenders } from "./data/gameAssets";
import { partRenderAssetsByPartId } from "./data/assetManifest";
import {
  checkAvailability,
  compatibleParts,
  formatTag,
  statDelta,
} from "./lib/build";
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

const statKeys: StatKey[] = ["accuracy", "recoil", "ads", "ergonomics", "weight", "velocity"];
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
  const [showSquadModal, setShowSquadModal] = useState(false);
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

        if (hideLocked && isVendorLocked(part)) {
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

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen]);

  function choosePart(part: Part) {
    if (isVendorLocked(part)) {
      inspectPart(part);
      return;
    }

    chooseBuildPart(part);
  }

  function clearSlot(slot: Slot) {
    clearBuildSlot(slot);
  }

  function selectPlatform(nextPlatformId: string) {
    selectBuildPlatform(nextPlatformId);
    setBuildWarnings([]);
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
  }

  function applyIntent(intent: BuildPresetGoal) {
    applyPresetIntent(intent);
    setBuildWarnings([]);
  }

  async function copyShareLink() {
    const copiedShareCode = await copyBuildShareLink();
    setShareCode(copiedShareCode);
    setShareCopied(true);
    setBuildWarnings([]);
  }

  return (
    <main className="game-shell">
      <div className="scene-backdrop" aria-hidden="true">
        <AssetImage src={gameAssets.screenshots[0].full} alt="" />
      </div>
      <header className="hud-bar">
        <nav className="hud-tabs" aria-label="Armory sections">
          <AssetImage className="brand-strip" src={gameAssets.capsule} alt="Gray Zone Warfare" />
          <button className="active" type="button">Weapons</button>
          <button type="button" onClick={() => setShowSquadModal(true)}>Parts</button>
          <button type="button" onClick={() => setShowSquadModal(true)}>Stats</button>
        </nav>
        <div className="hud-actions">
          <button
            className="squad-button"
            type="button"
            onClick={() => {
              setSettingsOpen(false);
              setShowSquadModal(true);
            }}
          >
            <Users size={14} /> Create squad
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
          <a href="https://github.com/packetloss404" target="_blank" rel="noreferrer" role="menuitem">
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

      {showSquadModal && (
        <Dialog className="coming-soon-modal" labelledBy="coming-soon-title" onClose={() => setShowSquadModal(false)}>
          <button className="modal-close" type="button" aria-label="Close" onClick={() => setShowSquadModal(false)}>
            <X size={16} />
          </button>
          <div className="coming-soon-icon">
            <Construction size={34} />
          </div>
          <h2 id="coming-soon-title">Feature Coming Soon</h2>
        </Dialog>
      )}

      <section className="inventory-layout">
        <aside className="weapon-window glass">
          <div className="window-head">
            <div>
              <h1>{platform.name}</h1>
              <span>{platform.caliber}</span>
            </div>
          </div>

          <div className="weapon-scene">
            <WeaponPreview
              platform={platform}
              selectedParts={selectedParts}
              activeSlot={activeSlot}
              onSlotFocus={focusSlot}
            />
          </div>

          <div className="weapon-ammo">
            <span>{selectedParts.length} parts installed</span>
            <strong>{platform.unlock ? `${platform.vendor} LL${platform.unlock.level}` : platform.vendor}</strong>
          </div>

          <div className="installed-assets" aria-label="Installed weapon parts">
            {selectedParts.slice(0, 8).map((part) => (
              <button key={part.id} type="button" aria-label={`Focus installed ${slotLabels[part.slot]}: ${part.name}`} onClick={() => focusSlot(part.slot)}>
                {partRenderAssetsByPartId[part.id] || partRenders[part.id] ? (
                  <AssetImage asset={partRenderAssetsByPartId[part.id]} src={partRenders[part.id]} alt="" fallback={<i style={{ background: part.color ?? "#39423c" }} />} />
                ) : (
                  <i style={{ background: part.color ?? "#39423c" }} />
                )}
                <span>{slotCode(part.slot)}</span>
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
                  type="button"
                  aria-pressed={activeSlot === slot}
                  aria-label={`${slotLabels[slot]} slot, ${selected ? selected.name : `${count} compatible parts`}`}
                  onClick={() => focusSlot(slot)}
                >
                  <span>{slotCode(slot)}</span>
                  <strong>{selected ? itemAbbrev(selected.name) : "+"}</strong>
                  <small>{selected ? selected.type : `${count} fit`}</small>
                </button>
              );
            })}
          </div>

          <p className="weapon-copy">
            Compatibility is calculated from installed receivers, rails, adapters, and muzzle threads. Add a mount to expose more parts.
          </p>
        </aside>

        <aside className="locker glass">
          <div className="locker-head">
            <PanelTitle label="Your Locker" />
            <strong>$ 10,000</strong>
          </div>

          <a className="official-card" href={gameAssets.storeUrl} target="_blank" rel="noreferrer">
            <AssetImage src={gameAssets.header} alt="Gray Zone Warfare official Steam header" />
            <span>Official Steam media</span>
          </a>

          <div className="platform-grid">
            {platforms.map((item) => (
              <button
                key={item.id}
                className={item.id === platform.id ? "weapon-tile active" : "weapon-tile"}
                type="button"
                aria-pressed={item.id === platform.id}
                onClick={() => selectPlatform(item.id)}
              >
                <Crosshair size={15} />
                <span>{item.name}</span>
                <small>{item.caliber}</small>
              </button>
            ))}
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
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter stash" aria-label="Filter stash" />
            </label>
          </div>

          <div className="locker-filters" aria-label="Stash filters">
            <button
              className={currentSlotOnly ? "active" : ""}
              type="button"
              aria-label={`Show only ${slotLabels[activeSlot]} parts`}
              aria-pressed={currentSlotOnly}
              onClick={() => setCurrentSlotOnly((enabled) => !enabled)}
            >
              {slotCode(activeSlot)}
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
              aria-label="Hide loyalty locked parts"
              aria-pressed={hideLocked}
              onClick={() => setHideLocked((enabled) => !enabled)}
            >
              LL Open
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
              <select aria-label="Sort stash" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
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

          <div className="stash-grid">
            {lockerParts.map(({ part, availability }) => (
              <StashItem
                key={part.id}
                part={part}
                active={selections[part.slot] === part.id}
                available={availability.available}
                traderLocked={isVendorLocked(part)}
                reason={availability.reasons[0] ?? vendorLockHint(part)}
                onClick={() => inspectPart(part)}
              />
            ))}
            {Array.from({ length: Math.max(0, 42 - lockerParts.length) }).map((_, index) => (
              <div className="stash-empty" key={`empty-${index}`} />
            ))}
          </div>
        </aside>
      </section>

      <section className="bench glass">
        <div className="bench-head">
          <PanelTitle label="Build Workbench" icon={<SlidersHorizontal size={15} />} />
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
            vendorLocked={inspectedPart ? isVendorLocked(inspectedPart) : false}
            lockHint={inspectedPart ? vendorLockHint(inspectedPart) : undefined}
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

function Dialog({
  children,
  className,
  labelledBy,
  onClose,
}: {
  children: ReactNode;
  className: string;
  labelledBy: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = getFocusableElements(dialogRef.current);
    (focusable[0] ?? dialogRef.current)?.focus();

    return () => {
      restoreFocusRef.current?.focus();
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusable = getFocusableElements(dialogRef.current);
    if (!focusable.length) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        ref={dialogRef}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {children}
      </section>
    </div>
  );
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) {
    return [];
  }

  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("hidden") && element.offsetParent !== null);
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
  available,
  traderLocked,
  reason,
  onClick,
}: {
  part: Part;
  active: boolean;
  available: boolean;
  traderLocked: boolean;
  reason?: string;
  onClick: () => void;
}) {
  const locked = !available || traderLocked;

  return (
    <button
      className={`stash-item ${active ? "active" : ""} ${locked ? "locked" : ""}`}
      title={locked ? reason : part.name}
      type="button"
      aria-pressed={active}
      aria-label={`${part.name}, ${slotLabels[part.slot]}, ${locked ? reason ?? "locked" : deltaPreview(part)}`}
      onClick={onClick}
    >
      <i style={{ background: part.color ?? "#39423c" }} />
      {(partRenderAssetsByPartId[part.id] || partRenders[part.id]) && (
        <AssetImage asset={partRenderAssetsByPartId[part.id]} src={partRenders[part.id]} alt="" fallback={null} />
      )}
      <strong>{itemAbbrev(part.name)}</strong>
      <small>{locked ? reason ?? "LOCKED" : deltaPreview(part)}</small>
      <span>{locked ? <CircleOff size={13} /> : <BadgeCheck size={13} />}</span>
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
      <em className={positive ? "good" : "bad"}>{signed(delta)}</em>
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

  return entries.map(({ key, value }) => `${statLabels[key]} ${signed(value)}`).join(" / ");
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

function isVendorLocked(part: Part) {
  return (loyaltyLevel(part) ?? 1) > 1;
}

function vendorLockHint(part: Part) {
  const level = loyaltyLevel(part);
  if (!level || level <= 1) {
    return undefined;
  }

  const unlock = part.unlock;
  const vendor = unlock?.vendor ?? vendorName(part.vendor);
  const task = unlock?.task ? `: ${unlock.task}` : "";
  return `Reach ${vendor} LL${level}${task}`;
}

function slotCode(slot: Slot) {
  const codes: Record<Slot, string> = {
    receiver: "RCVR",
    barrel: "BRL",
    handguard: "HND",
    muzzle: "MZL",
    stock: "STK",
    pistolGrip: "GRP",
    magazine: "MAG",
    opticMount: "MNT",
    optic: "OPT",
    foregrip: "FGR",
    tactical: "LGT",
    laser: "LSR",
    underbarrelAdapter: "BOT",
    sideRailAdapter: "RAIL",
  };

  return codes[slot];
}

function itemAbbrev(name: string) {
  return name
    .replace(/\b(AR-15|AKM|AK|G17|M-LOK|SOCOM|STANAG|PMAG|RMR)\b/g, (match) => match)
    .split(/\s+/)
    .filter((word) => !["Round", "Tactical", "Polymer", "Combat", "Weapon"].includes(word))
    .slice(0, 3)
    .join(" ");
}

function signed(value: number) {
  if (value === 0) {
    return "0";
  }

  const normalized = Number.isInteger(value) ? value.toString() : value.toFixed(2);
  return value > 0 ? `+${normalized}` : normalized;
}

export default App;
