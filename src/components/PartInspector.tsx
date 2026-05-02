import { CircleOff, ShieldCheck } from "lucide-react";
import { slotLabels, statDirection, statLabels, type Part, type StatKey, type WeaponPlatform } from "../data/armory";
import { checkAvailability, statDelta, type BuildSelections } from "../lib/build";
import type { PriceCatalog } from "./BuildSummary";

type Props = {
  platform: WeaponPlatform;
  part: Part | null;
  selections: BuildSelections;
  priceCatalog?: PriceCatalog;
  currency?: string;
  className?: string;
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
  const active = selections[part.slot] === part.id;
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
          <dd>{availability.available ? "Compatible" : "Locked"}</dd>
        </div>
      </dl>

      <div className="part-inspector__compatibility" data-compatible={availability.available}>
        {availability.available ? <ShieldCheck size={15} /> : <CircleOff size={15} />}
        <span>{availability.available ? `Fits ${platform.name}` : availability.reasons[0] ?? `Does not fit ${platform.name}`}</span>
      </div>

      <div className="part-inspector__stats">
        {statKeys.map((key) => (
          <PartStatDelta key={key} part={part} statKey={key} />
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
        <button type="button" disabled={!availability.available || active || !onApply} onClick={() => onApply?.(part)}>
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

function PartStatDelta({ part, statKey }: { part: Part; statKey: StatKey }) {
  const delta = statDelta(part, statKey);
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
