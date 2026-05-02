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
import { useEffect, useMemo, useState, type ReactNode } from "react";
import packageJson from "../package.json";
import { AssetImage } from "./components/AssetImage";
import { BuildSummary, type PriceCatalog } from "./components/BuildSummary";
import { PartInspector } from "./components/PartInspector";
import WeaponPreview from "./components/WeaponPreview";
import {
  platforms,
  parts,
  slotLabels,
  slotOrder,
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
  getSelectedParts,
  getTagSet,
  sanitizeSelections,
  starterSelections,
  statDelta,
  totalStats,
  type BuildSelections,
} from "./lib/build";
import { createShareUrl, readBuildShareFromUrl } from "./lib/share";

const statKeys: StatKey[] = ["accuracy", "recoil", "ads", "ergonomics", "weight", "velocity"];

const intentWeights: Record<string, Partial<Record<StatKey, number>>> = {
  factory: { ergonomics: 0.4, recoil: -0.5, accuracy: 0.4, weight: -0.3, ads: -0.3 },
  assault: { ergonomics: 1.1, recoil: -1.25, accuracy: 1, weight: -0.45, ads: -0.75, velocity: 0.25 },
  recce: { ergonomics: 0.45, recoil: -1, accuracy: 1.8, weight: -0.35, ads: -0.35, velocity: 0.65 },
  suppressed: { ergonomics: 0.7, recoil: -1.4, accuracy: 1.1, weight: -0.35, ads: -0.4 },
};

function App() {
  const [platformId, setPlatformId] = useState(platforms[0].id);
  const platform = platforms.find((item) => item.id === platformId) ?? platforms[0];
  const [selections, setSelections] = useState<BuildSelections>(() => starterSelections(platform));
  const [activeSlot, setActiveSlot] = useState<Slot>("optic");
  const [query, setQuery] = useState("");
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inspectedPartId, setInspectedPartId] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const selectedParts = useMemo(() => getSelectedParts(selections), [selections]);
  const inspectedPart = useMemo(() => {
    if (inspectedPartId) {
      return parts.find((part) => part.id === inspectedPartId) ?? null;
    }

    return parts.find((part) => part.id === selections[activeSlot]) ?? null;
  }, [activeSlot, inspectedPartId, selections]);
  const stats = useMemo(() => totalStats(platform, selections), [platform, selections]);
  const priceCatalog = useMemo<PriceCatalog>(() => {
    const entries = [
      ...platforms.map((item) => [item.id, item.price?.amount] as const),
      ...parts.map((part) => [part.id, part.price?.amount] as const),
    ].filter((entry): entry is readonly [string, number] => typeof entry[1] === "number");

    return Object.fromEntries(entries);
  }, []);
  const availableSlots = useMemo(
    () => slotOrder.filter((slot) => platform.requiredSlots.includes(slot) || platform.optionalSlots.includes(slot)),
    [platform],
  );
  const tagSet = useMemo(() => Array.from(getTagSet(platform, selections)).sort(), [platform, selections]);
  const lockerParts = useMemo(() => {
    const rows = parts
      .filter((part) => availableSlots.includes(part.slot))
      .map((part) => ({ part, availability: checkAvailability(platform, part, selections) }));
    const normalized = query.trim().toLowerCase();

    return rows
      .filter(({ part }) => {
        if (!normalized) {
          return true;
        }

        return `${part.name} ${part.vendor} ${part.type} ${slotLabels[part.slot]} ${part.notes ?? ""}`.toLowerCase().includes(normalized);
      })
      .sort((a, b) => {
        const selectedA = selections[a.part.slot] === a.part.id ? 1 : 0;
        const selectedB = selections[b.part.slot] === b.part.id ? 1 : 0;
        const slotA = a.part.slot === activeSlot ? 1 : 0;
        const slotB = b.part.slot === activeSlot ? 1 : 0;
        const availableA = a.availability.available ? 1 : 0;
        const availableB = b.availability.available ? 1 : 0;

        return selectedB - selectedA || slotB - slotA || availableB - availableA || a.part.slot.localeCompare(b.part.slot);
      });
  }, [activeSlot, availableSlots, platform, query, selections]);

  useEffect(() => {
    const nextPlatform = platforms.find((item) => item.id === platformId) ?? platforms[0];
    setSelections(starterSelections(nextPlatform));
    setActiveSlot(nextPlatform.optionalSlots.includes("optic") ? "optic" : nextPlatform.requiredSlots[0]);
    setInspectedPartId(null);
  }, [platformId]);

  useEffect(() => {
    const shared = readBuildShareFromUrl(window.location.href);
    if (!shared.ok) {
      return;
    }

    setPlatformId(shared.platform.id);
    setSelections(shared.selections);
    setActiveSlot(shared.platform.optionalSlots.includes("optic") ? "optic" : shared.platform.requiredSlots[0]);
    setShareStatus(shared.warnings[0] ?? "Shared build loaded");
  }, []);

  function choosePart(part: Part) {
    setInspectedPartId(part.id);
    const availability = checkAvailability(platform, part, selections);
    if (!availability.available) {
      return;
    }

    setSelections((current) => sanitizeSelections(platform, { ...current, [part.slot]: part.id }));
  }

  function clearSlot(slot: Slot) {
    setSelections((current) => {
      const next = { ...current };
      delete next[slot];
      return sanitizeSelections(platform, next);
    });
    setInspectedPartId(null);
  }

  function applyIntent(intent: keyof typeof intentWeights) {
    let next = starterSelections(platform);
    const weights = intentWeights[intent];

    for (const slot of availableSlots) {
      const candidates = compatibleParts(platform, slot, next).filter(({ availability }) => availability.available);
      if (!candidates.length) {
        continue;
      }

      const ranked = [...candidates].sort((a, b) => scorePart(b.part, weights, intent) - scorePart(a.part, weights, intent));
      next = sanitizeSelections(platform, { ...next, [slot]: ranked[0].part.id });
    }

    setSelections(next);
    setInspectedPartId(null);
  }

  async function copyShareLink() {
    const url = createShareUrl(window.location.href, platform, selections);
    await navigator.clipboard.writeText(url);
    setShareStatus("Build link copied");
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
              className={settingsOpen ? "icon-button active" : "icon-button"}
              type="button"
              aria-label="Settings"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </header>

      {settingsOpen && (
        <div className="settings-menu" role="menu" aria-label="Settings">
          <div className="settings-row">
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
        <div className="modal-backdrop" role="presentation" onClick={() => setShowSquadModal(false)}>
          <section className="coming-soon-modal" role="dialog" aria-modal="true" aria-labelledby="coming-soon-title" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close" onClick={() => setShowSquadModal(false)}>
              <X size={16} />
            </button>
            <div className="coming-soon-icon">
              <Construction size={34} />
            </div>
            <h2 id="coming-soon-title">Feature Coming Soon</h2>
          </section>
        </div>
      )}

      <section className="inventory-layout">
        <aside className="weapon-window glass">
          <div className="window-head">
            <div>
              <h1>{platform.name}</h1>
              <span>{platform.caliber}</span>
            </div>
            <button type="button" aria-label="Close"><X size={16} /></button>
          </div>

          <div className="weapon-scene">
            <WeaponPreview
              platform={platform}
              selectedParts={selectedParts}
              activeSlot={activeSlot}
              onSlotFocus={(slot) => {
                setActiveSlot(slot);
                setInspectedPartId(selections[slot] ?? null);
              }}
            />
          </div>

          <div className="weapon-ammo">
            <span>{selectedParts.length} parts installed</span>
            <strong>{platform.unlock ? `${platform.vendor} LL${platform.unlock.level}` : platform.vendor}</strong>
          </div>

          <div className="installed-assets" aria-label="Installed weapon parts">
            {selectedParts.slice(0, 8).map((part) => (
              <button key={part.id} type="button" onClick={() => setActiveSlot(part.slot)}>
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
                  onClick={() => setActiveSlot(slot)}
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
                onClick={() => setPlatformId(item.id)}
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
                value={activeSlot}
                onChange={(event) => {
                  const slot = event.target.value as Slot;
                  setActiveSlot(slot);
                  setInspectedPartId(selections[slot] ?? null);
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
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter stash" />
            </label>
          </div>

          <div className="stash-grid">
            {lockerParts.map(({ part, availability }) => (
              <StashItem
                key={part.id}
                part={part}
                active={selections[part.slot] === part.id}
                available={availability.available}
                reason={availability.reasons[0]}
                onClick={() => {
                  setActiveSlot(part.slot);
                  choosePart(part);
                }}
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
            onApply={choosePart}
            onClearSlot={clearSlot}
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
  available,
  reason,
  onClick,
}: {
  part: Part;
  active: boolean;
  available: boolean;
  reason?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`stash-item ${active ? "active" : ""} ${available ? "" : "locked"}`}
      title={available ? part.name : reason}
      type="button"
      onClick={onClick}
    >
      <i style={{ background: part.color ?? "#39423c" }} />
      {(partRenderAssetsByPartId[part.id] || partRenders[part.id]) && (
        <AssetImage asset={partRenderAssetsByPartId[part.id]} src={partRenders[part.id]} alt="" fallback={null} />
      )}
      <strong>{itemAbbrev(part.name)}</strong>
      <small>{available ? deltaPreview(part) : reason ?? "LOCKED"}</small>
      <span>{available ? <BadgeCheck size={13} /> : <CircleOff size={13} />}</span>
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

function scorePart(part: Part, weights: Partial<Record<StatKey, number>>, intent: string) {
  let score = 0;

  for (const key of statKeys) {
    score += (part.stats[key] ?? 0) * (weights[key] ?? 0);
  }

  if (intent === "suppressed" && part.tags.includes("suppressor")) {
    score += 25;
  }

  return score;
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
