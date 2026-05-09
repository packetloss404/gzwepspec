import { Check, Clipboard, Download, Save, Trash2, Upload, AlertTriangle } from "lucide-react";
import { useState } from "react";
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

  return (
    <section className="saved-builds">
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
          <span>Share Code</span>
          {dirtyShare && (
            <strong>
              <AlertTriangle size={12} /> Stale
            </strong>
          )}
        </div>
        <textarea readOnly value={currentShareCode} aria-label="Current share code" />
        <button type="button" onClick={onCopy}>
          {copied ? <Check size={13} /> : <Clipboard size={13} />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <div className="share-console share-console--import">
        <div className="share-console__head">
          <span>Import</span>
        </div>
        <textarea
          value={importCode}
          onChange={(event) => onImportCodeChange(event.target.value)}
          placeholder="Paste code or build URL"
          aria-label="Import share code"
        />
        <button type="button" onClick={onImport}>
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
            <div className="saved-build" key={build.id}>
              <button type="button" onClick={() => onApply(build)}>
                <Download size={13} />
                <span>
                  <strong>{build.name}</strong>
                  <small>{build.platformId.toUpperCase()} / {Object.keys(build.selections).length} parts</small>
                </span>
              </button>
              <button type="button" aria-label={`Delete ${build.name}`} onClick={() => onDelete(build.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
