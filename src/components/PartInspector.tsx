import { CircleOff, ShieldCheck } from "lucide-react";
import { parts, slotLabels, statDirection, statLabels, type Part, type StatKey, type WeaponPlatform } from "../data/armory";
import { checkAvailability, statDelta, type BuildSelections } from "../lib/build";
import type { PriceCatalog } from "./BuildSummary";

type Props = {
  platform: WeaponPlatform;
  part: Part | null;
  selections: BuildSelections;
  priceCatalog?: PriceCatalog;
  currency?: string;
  className?: string;
  vendorLocked?: boolean;
  lockHint?: string;
  onApply?: (part: Part) => void;
  onClearSlot?: (slot: Part["slot"]) => void;
};

const statKeys: StatKey[] = ["accuracy", "recoil", "ads", "ergonomics", "weight", "velocity"];

export function PartInspector({
  platform,
  part,
  selections,
  priceCatalog = {},
  currency = "$",
  className,
  vendorLocked = false,
  lockHint,
  onApply,
  onClearSlot,
}: Props) {
  if (!part) {
    return (
      <aside className={["part-inspector", className].filter(Boolean).join(" ")} aria-label="Part inspector">
        <p>Select a part to inspect vendor, compatibility, and stat deltas.</p>
      </aside>
    );
  }

  const availability = checkAvailability(platform, part, selections);
  const canApply = availability.available && !vendorLocked;
  const active = selections[part.slot] === part.id;
  const installedPart = selections[part.slot] ? parts.find((candidate) => candidate.id === selections[part.slot]) ?? null : null;
  const price = priceCatalog[part.id];

  return (
    <aside className={["part-inspector", className].filter(Boolean).join(" ")} aria-label={`${part.name} inspector`}>
      <header className="part-inspector__header">
        <div>
          <span>{slotLabels[part.slot]}</span>
          <h2>{part.name}</h2>
        </div>
        <strong>{price === undefined ? "Price pending" : `${currency}${price.toLocaleString()}`}</strong>
      </header>

      <dl className="part-inspector__facts">
        <div>
          <dt>Type</dt>
          <dd>{part.type}</dd>
        </div>
        <div>
          <dt>Vendor</dt>
          <dd>{part.vendor}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{vendorLocked ? "Vendor locked" : availability.available ? "Compatible" : "Locked"}</dd>
        </div>
      </dl>

      <div className="part-inspector__compatibility" data-compatible={canApply}>
        {canApply ? <ShieldCheck size={15} /> : <CircleOff size={15} />}
        <span>{canApply ? `Fits ${platform.name}` : lockHint ?? availability.reasons[0] ?? `Does not fit ${platform.name}`}</span>
      </div>

      {!active && installedPart && (
        <div className="part-inspector__swap">
          <span>Compare vs {installedPart.name}</span>
          <strong>{canApply ? "Ready to apply" : nextActionLabel(availability.reasons[0], lockHint)}</strong>
        </div>
      )}

      <div className="part-inspector__stats">
        {statKeys.map((key) => (
          <PartStatDelta key={key} part={part} installedPart={installedPart} statKey={key} />
        ))}
      </div>

      {(part.requires?.length || part.provides?.length || part.conflicts?.length) && (
        <div className="part-inspector__tags">
          {part.requires?.map((tag) => (
            <span key={`requires-${tag}`}>Needs {formatTag(tag)}</span>
          ))}
          {part.provides?.map((tag) => (
            <span key={`provides-${tag}`}>Adds {formatTag(tag)}</span>
          ))}
          {part.conflicts?.map((tag) => (
            <span key={`conflicts-${tag}`}>Blocks {formatTag(tag)}</span>
          ))}
        </div>
      )}

      {part.notes && <p className="part-inspector__notes">{part.notes}</p>}

      <div className="part-inspector__actions">
        <button type="button" disabled={!canApply || active || !onApply} onClick={() => onApply?.(part)}>
          {active ? "Installed" : "Apply"}
        </button>
        {active && (
          <button type="button" disabled={!onClearSlot} onClick={() => onClearSlot?.(part.slot)}>
            Clear slot
          </button>
        )}
      </div>
    </aside>
  );
}

function PartStatDelta({ part, installedPart, statKey }: { part: Part; installedPart: Part | null; statKey: StatKey }) {
  const delta = statDelta(part, statKey) - (installedPart && installedPart.id !== part.id ? statDelta(installedPart, statKey) : 0);
  const improved = statDirection[statKey] === "higher" ? delta >= 0 : delta <= 0;

  return (
    <div className="part-inspector__stat">
      <span>{statLabels[statKey]}</span>
      <strong data-tone={improved ? "good" : "bad"}>{signed(delta)}</strong>
    </div>
  );
}

function signed(value: number) {
  if (value === 0) {
    return "0";
  }

  const normalized = Number.isInteger(value) ? value.toString() : value.toFixed(2);
  return value > 0 ? `+${normalized}` : normalized;
}

function formatTag(tag: string) {
  return tag.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function nextActionLabel(reason?: string, lockHint?: string) {
  if (lockHint) {
    return lockHint;
  }

  if (!reason) {
    return "Check slot chain";
  }

  return reason.replace(/^Needs /, "Add ").replace(/\.$/, "");
}
