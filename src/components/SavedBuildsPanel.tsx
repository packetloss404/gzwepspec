import { AlertTriangle, Check, Clipboard, Download, FileInput, Link2, Save, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { platforms, slotLabels, slotOrder } from "../data/armory";
import type { BuildPreset } from "../lib/buildPresets";

type SavedBuildsPanelProps = {
  builds: BuildPreset[];
  currentShareCode: string;
  copied: boolean;
  importCode: string;
  warnings: string[];
  dirtyShare: boolean;
  onSave: (name: string) => void;
  onApply: (preset: BuildPreset) => void;
  onDelete: (presetId: string) => void;
  onCopy: () => void;
  onImportCodeChange: (value: string) => void;
  onImport: () => void;
};

export function SavedBuildsPanel({
  builds,
  currentShareCode,
  copied,
  importCode,
  warnings,
  dirtyShare,
  onSave,
  onApply,
  onDelete,
  onCopy,
  onImportCodeChange,
  onImport,
}: SavedBuildsPanelProps) {
  const [saveName, setSaveName] = useState("");
  const importReady = importCode.trim().length > 0;

  return (
    <section className="saved-builds">
      <header className="saved-builds__header">
        <div>
          <span>Saved Builds</span>
          <strong>{builds.length} build{builds.length === 1 ? "" : "s"}</strong>
        </div>
        {warnings.length > 0 && <em>{warnings.length} warning{warnings.length === 1 ? "" : "s"}</em>}
      </header>

      <div className="saved-builds__controls">
        <label>
          <span>Save as</span>
          <input value={saveName} onChange={(event) => setSaveName(event.target.value)} placeholder="Raid build" />
        </label>
        <button
          type="button"
          onClick={() => {
            onSave(saveName);
            setSaveName("");
          }}
        >
          <Save size={13} /> Save
        </button>
      </div>

      <div className="share-console">
        <div className="share-console__head">
          <span><Link2 size={12} /> Share build</span>
          {dirtyShare && (
            <strong>
              <AlertTriangle size={12} /> Stale
            </strong>
          )}
        </div>
        <textarea readOnly value={currentShareCode} aria-label="Current share code" spellCheck={false} />
        <div className="share-console__meta">
          <small>{currentShareCode.length.toLocaleString()} chars</small>
          <small>{dirtyShare ? "Copy again after changes" : "Current build"}</small>
        </div>
        <button type="button" onClick={onCopy}>
          {copied ? <Check size={13} /> : <Clipboard size={13} />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <div className="share-console share-console--import">
        <div className="share-console__head">
          <span><FileInput size={12} /> Import build</span>
        </div>
        <textarea
          value={importCode}
          onChange={(event) => onImportCodeChange(event.target.value)}
          placeholder="Paste code or build URL"
          aria-label="Import share code"
          spellCheck={false}
        />
        <button type="button" onClick={onImport} disabled={!importReady}>
          <Upload size={13} /> Import
        </button>
      </div>

      {warnings.length > 0 && (
        <div className="saved-builds__warnings" role="status">
          {warnings.slice(0, 3).map((warning) => (
            <span key={warning}>
              <AlertTriangle size={12} /> {warning}
            </span>
          ))}
        </div>
      )}

      <div className="saved-builds__list" aria-label="Saved builds">
        {builds.length === 0 ? (
          <p>No saved builds yet.</p>
        ) : (
          builds.map((build) => (
            <SavedBuildCard key={build.id} build={build} onApply={onApply} onDelete={onDelete} />
          ))
        )}
      </div>
    </section>
  );
}

function SavedBuildCard({
  build,
  onApply,
  onDelete,
}: {
  build: BuildPreset;
  onApply: (preset: BuildPreset) => void;
  onDelete: (presetId: string) => void;
}) {
  const platform = platforms.find((item) => item.id === build.platformId);
  const selectedSlots = slotOrder.filter((slot) => build.selections[slot]);
  const requiredSlots = platform?.requiredSlots ?? [];
  const missingRequired = requiredSlots.filter((slot) => !build.selections[slot]);

  return (
    <article className="saved-build" data-ready={missingRequired.length === 0}>
      <div className="saved-build__body">
        <span>{platform?.family ?? build.platformId.toUpperCase()}</span>
        <strong>{build.name}</strong>
        <small>
          {platform?.name ?? build.platformId.toUpperCase()} / {selectedSlots.length} mounted
        </small>
        <div className="saved-build__slots" aria-label={`${build.name} mounted slots`}>
          {selectedSlots.slice(0, 5).map((slot) => (
            <i key={slot}>{slotLabels[slot]}</i>
          ))}
          {selectedSlots.length > 5 && <i>+{selectedSlots.length - 5}</i>}
        </div>
      </div>
      <div className="saved-build__actions">
        <button type="button" onClick={() => onApply(build)}>
          <Download size={13} />
          Apply
        </button>
        <button type="button" aria-label={`Delete ${build.name}`} onClick={() => onDelete(build.id)}>
          <Trash2 size={13} />
        </button>
      </div>
    </article>
  );
}
