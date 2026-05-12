import { CheckCircle2, CircleOff, Eraser, ShieldCheck, Wrench } from "lucide-react";
import { parts, slotLabels, statDirection, statLabels, type Part, type StatKey, type WeaponPlatform } from "../data/armory";
import { checkAvailability, statDelta, type BuildSelections } from "../lib/build";
import { formatSigned, formatTag, statKeys } from "../lib/formatting";
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
        <div className="part-inspector__empty">
          <Wrench size={18} />
          <p>Select a part to inspect fit and stat changes.</p>
        </div>
      </aside>
    );
  }

  const availability = checkAvailability(platform, part, selections);
  const canApply = availability.available;
  const active = selections[part.slot] === part.id;
  const installedPart = selections[part.slot] ? parts.find((candidate) => candidate.id === selections[part.slot]) ?? null : null;
  const price = priceCatalog[part.id];
  const statusLabel = active ? "Installed" : vendorLocked ? "Higher loyalty listing" : availability.available ? "Ready to mount" : "Blocked";

  return (
    <aside className={["part-inspector", className].filter(Boolean).join(" ")} aria-label={`${part.name} inspector`}>
      <header className="part-inspector__header">
        <div>
          <span>{slotLabels[part.slot]}</span>
          <h2>{part.name}</h2>
        </div>
        <strong>{price === undefined ? "No price data" : `${currency}${price.toLocaleString()}`}</strong>
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
          <dd>{statusLabel}</dd>
        </div>
      </dl>

      <div className="part-inspector__compatibility" data-compatible={canApply || active}>
        {active ? <CheckCircle2 size={15} /> : canApply ? <ShieldCheck size={15} /> : <CircleOff size={15} />}
        <span>{active ? `Mounted on ${slotLabels[part.slot]}` : canApply ? lockHint ?? `Fits ${platform.name}` : availability.reasons[0] ?? `Does not fit ${platform.name}`}</span>
      </div>

      {!active && installedPart && (
        <div className="part-inspector__swap">
          <span>Compare vs {installedPart.name}</span>
          <strong>{canApply ? "Ready to apply" : nextActionLabel(availability.reasons[0], lockHint)}</strong>
        </div>
      )}

      {!canApply && !active && (lockHint || availability.reasons.length > 0) && (
        <div className="part-inspector__warnings" role="status">
          {(lockHint ? [lockHint] : availability.reasons).slice(0, 3).map((reason) => (
            <span key={reason}>{reason}</span>
          ))}
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
          {active ? <CheckCircle2 size={13} /> : <Wrench size={13} />}
          {active ? "Installed" : installedPart ? "Apply swap" : "Mount part"}
        </button>
        {active && (
          <button type="button" disabled={!onClearSlot} onClick={() => onClearSlot?.(part.slot)}>
            <Eraser size={13} />
            Clear slot
          </button>
        )}
      </div>
    </aside>
  );
}

function PartStatDelta({ part, installedPart, statKey }: { part: Part; installedPart: Part | null; statKey: StatKey }) {
  const current = installedPart && installedPart.id !== part.id ? statDelta(installedPart, statKey) : 0;
  const next = statDelta(part, statKey);
  const delta = next - current;
  const improved = statDirection[statKey] === "higher" ? delta >= 0 : delta <= 0;

  return (
    <div className="part-inspector__stat">
      <span>{statLabels[statKey]}</span>
      <strong data-tone={improved ? "good" : "bad"}>{formatSigned(delta)}</strong>
      {installedPart && installedPart.id !== part.id && <small>{formatSigned(current)} to {formatSigned(next)}</small>}
    </div>
  );
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
