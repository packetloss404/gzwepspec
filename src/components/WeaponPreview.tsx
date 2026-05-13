import { useMemo, type CSSProperties } from "react";
import { partRenders, weaponRenders } from "../data/gameAssets";
import { getWeaponVisualProfile, type VisualAnchor } from "../data/visuals";
import { slotLabels, type Part, type Slot, type WeaponPlatform } from "../data/armory";
import { formatSlotCode } from "../lib/formatting";
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
  const requiredSlots = useMemo(() => new Set(platform.requiredSlots), [platform.requiredSlots]);
  const selectedLayers = anchors
    .map((anchor) => ({ anchor, part: selectedBySlot.get(anchor.slot) }))
    .filter((layer): layer is { anchor: VisualAnchor; part: Part } => Boolean(layer.part))
    .sort((a, b) => a.anchor.layer - b.anchor.layer);
  const rootClassName = className ? `weapon-preview ${className}` : "weapon-preview";
  const activePart = activeSlot ? selectedBySlot.get(activeSlot) : undefined;
  const socketCount = anchors.filter((anchor) => anchor.slot !== "receiver" && !selectedBySlot.has(anchor.slot)).length;
  const renderedPartCount = selectedParts.filter((part) => partRenders[part.id]).length;
  const artStatus = weaponRenders[platform.id]
    ? `${renderedPartCount}/${selectedParts.length} reviewed art`
    : "Procedural placeholder";

  return (
    <section className={rootClassName} data-frame={profile.frame} aria-label={`${platform.name} weapon preview`}>
      <div
        className="weapon-preview__stage"
        style={
          {
            "--preview-glow-x": `${profile.glowX}%`,
            "--preview-glow-y": `${profile.glowY}%`,
          } as PreviewStyle
        }
      >
        <div className="weapon-preview__beam weapon-preview__beam--top" aria-hidden="true" />
        <div className="weapon-preview__beam weapon-preview__beam--bottom" aria-hidden="true" />

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
            <div className="weapon-preview__fallback-weapon" aria-hidden="true">
              <span className="weapon-preview__fallback-stock" />
              <span className="weapon-preview__fallback-receiver" />
              <span className="weapon-preview__fallback-rail" />
              <span className="weapon-preview__fallback-barrel" />
              <span className="weapon-preview__fallback-grip" />
              <span className="weapon-preview__fallback-mag" />
              <span className="weapon-preview__fallback-pump" />
            </div>
          )}
        </div>

        {anchors.map((anchor) => {
          const part = selectedBySlot.get(anchor.slot);
          const isActive = activeSlot === anchor.slot;
          const isRequired = requiredSlots.has(anchor.slot);

          return (
            <span
              key={`${anchor.slot}-socket`}
              className={[
                "weapon-preview__socket",
                part ? "is-installed" : "",
                isActive ? "is-active" : "",
                isRequired ? "is-required" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={anchorStyle(anchor)}
              aria-hidden="true"
            />
          );
        })}

        {selectedLayers.map(({ anchor, part }) => {
          const hasPartArt = Boolean(partRenders[part.id]);
          const isActive = activeSlot === anchor.slot;
          const layerClassName = [
            "weapon-preview__layer",
            `weapon-preview__layer--${anchor.slot}`,
            hasPartArt ? "has-art" : "is-procedural",
            isActive ? "is-active" : "",
          ]
            .filter(Boolean)
            .join(" ");
          const shapeClassName = [
            "weapon-preview__shape",
            `weapon-preview__shape--${anchor.shape}`,
            `weapon-preview__shape-slot--${anchor.slot}`,
          ].join(" ");

          return (
            <div
              key={part.id}
              className={layerClassName}
              style={{ ...anchorStyle(anchor), "--part-color": part.color ?? "#3d463f" } as PreviewStyle}
            >
              {hasPartArt ? (
                <img className="weapon-preview__part-art" src={partRenders[part.id]} alt="" draggable={false} />
              ) : (
                <>
                  <span className={shapeClassName} style={{ "--part-color": part.color ?? "#3d463f" } as PreviewStyle} aria-hidden="true" />
                  <span className="weapon-preview__missing-art-label" aria-hidden="true">Proxy</span>
                </>
              )}
            </div>
          );
        })}

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
              <span className="weapon-preview__anchor-pin" aria-hidden="true" />
              <span className="weapon-preview__anchor-label">{formatSlotCode(anchor.slot)}</span>
              <span className="weapon-preview__anchor-name">{part ? part.type : slotLabels[anchor.slot]}</span>
            </button>
          );
        })}
      </div>

      <div className="weapon-preview__meta">
        <span>{selectedParts.length} installed</span>
        <strong>{activePart ? activePart.name : activeSlot ? slotLabels[activeSlot] : platform.family}</strong>
        <em>{artStatus} / {socketCount} open sockets</em>
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
