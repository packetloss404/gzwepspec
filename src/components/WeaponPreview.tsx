import { useMemo, type CSSProperties } from "react";
import { partRenders, weaponRenders } from "../data/gameAssets";
import { getWeaponVisualProfile, type VisualAnchor } from "../data/visuals";
import { slotLabels, type Part, type Slot, type WeaponPlatform } from "../data/armory";
import "./WeaponPreview.css";

export type WeaponPreviewProps = {
  platform: WeaponPlatform;
  selectedParts: Part[];
  activeSlot?: Slot;
  className?: string;
  onSlotFocus?: (slot: Slot) => void;
};

type PreviewStyle = CSSProperties & Record<`--${string}`, string | number>;

export function WeaponPreview({ platform, selectedParts, activeSlot, className, onSlotFocus }: WeaponPreviewProps) {
  const profile = getWeaponVisualProfile(platform);
  const selectedBySlot = useMemo(() => {
    return new Map(selectedParts.map((part) => [part.slot, part]));
  }, [selectedParts]);
  const enabledSlots = useMemo(() => new Set([...platform.requiredSlots, ...platform.optionalSlots, "receiver" as Slot]), [platform]);
  const anchors = profile.anchors.filter((anchor) => enabledSlots.has(anchor.slot));
  const selectedLayers = anchors
    .map((anchor) => ({ anchor, part: selectedBySlot.get(anchor.slot) }))
    .filter((layer): layer is { anchor: VisualAnchor; part: Part } => Boolean(layer.part))
    .sort((a, b) => a.anchor.layer - b.anchor.layer);
  const rootClassName = className ? `weapon-preview ${className}` : "weapon-preview";

  return (
    <section className={rootClassName} aria-label={`${platform.name} weapon preview`}>
      <div className="weapon-preview__stage">
        <div
          className="weapon-preview__base"
          style={{
            "--weapon-offset-y": `${profile.weaponOffsetY}%`,
            "--weapon-scale": profile.weaponScale,
          } as PreviewStyle}
        >
          {weaponRenders[platform.id] ? (
            <img src={weaponRenders[platform.id]} alt="" draggable={false} />
          ) : (
            <div className="weapon-preview__fallback-weapon" aria-hidden="true" />
          )}
        </div>

        {selectedLayers.map(({ anchor, part }) => (
          <div key={part.id} className="weapon-preview__layer" style={anchorStyle(anchor)}>
            {partRenders[part.id] ? (
              <img className="weapon-preview__part-art" src={partRenders[part.id]} alt="" draggable={false} />
            ) : (
              <span
                className={`weapon-preview__shape weapon-preview__shape--${anchor.shape}`}
                style={{ "--part-color": part.color ?? "#3d463f" } as PreviewStyle}
                aria-hidden="true"
              />
            )}
          </div>
        ))}

        {anchors.map((anchor) => {
          const part = selectedBySlot.get(anchor.slot);
          const isActive = activeSlot === anchor.slot;
          const classNames = [
            "weapon-preview__anchor",
            isActive ? "is-active is-visible" : "",
            part ? "is-installed" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={anchor.slot}
              className={classNames}
              type="button"
              style={anchorStyle(anchor)}
              title={part ? `${slotLabels[anchor.slot]}: ${part.name}` : slotLabels[anchor.slot]}
              aria-pressed={isActive}
              aria-label={part ? `Focus ${slotLabels[anchor.slot]}, ${part.name}` : `Focus ${slotLabels[anchor.slot]}`}
              onClick={() => onSlotFocus?.(anchor.slot)}
            >
              <span className="weapon-preview__anchor-label">{slotCode(anchor.slot)}</span>
            </button>
          );
        })}
      </div>

      <div className="weapon-preview__meta">
        <span>{selectedParts.length} parts installed</span>
        <strong>{activeSlot ? slotLabels[activeSlot] : platform.family}</strong>
      </div>
    </section>
  );
}

export default WeaponPreview;

function anchorStyle(anchor: VisualAnchor): PreviewStyle {
  return {
    "--anchor-x": `${anchor.x}%`,
    "--anchor-y": `${anchor.y}%`,
    "--anchor-width": `${anchor.width}%`,
    "--anchor-height": `${anchor.height}%`,
    "--anchor-rotation": `${anchor.rotation ?? 0}deg`,
    "--anchor-layer": anchor.layer,
  };
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
