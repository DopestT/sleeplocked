import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { PRESETS, type PresetId } from "../visualizer/presets";
import type { ConnectionState } from "../audio/useAudioEngine";

interface ControlPanelProps {
  connectionState: ConnectionState;
  trackName: string | null;
  errorMessage: string | null;
  isPaused: boolean;
  isFileSource: boolean;
  preset: PresetId;
  sensitivity: number;
  isFullscreen: boolean;
  onFileSelected: (file: File) => void;
  onUseMicrophone: () => void;
  onTogglePause: () => void;
  onStop: () => void;
  onPresetChange: (preset: PresetId) => void;
  onSensitivityChange: (value: number) => void;
  onToggleFullscreen: () => void;
}

export function ControlPanel({
  connectionState,
  trackName,
  errorMessage,
  isPaused,
  isFileSource,
  preset,
  sensitivity,
  isFullscreen,
  onFileSelected,
  onUseMicrophone,
  onTogglePause,
  onStop,
  onPresetChange,
  onSensitivityChange,
  onToggleFullscreen,
}: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) onFileSelected(file);
      event.target.value = "";
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file && file.type.startsWith("audio/")) onFileSelected(file);
    },
    [onFileSelected],
  );

  const isActive = connectionState === "playing" || connectionState === "connecting";

  return (
    <div className="control-panel">
      <div className="panel-section">
        <div
          className={`dropzone ${isDragging ? "dropzone--active" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="visually-hidden"
            onChange={handleFileInput}
          />
          <span className="dropzone-icon">♪</span>
          <span>{trackName && isFileSource ? trackName : "Drop audio or click to upload"}</span>
        </div>

        <div className="button-row">
          <button type="button" className="btn" onClick={onUseMicrophone}>
            {connectionState === "playing" && !isFileSource ? "🎙 Listening…" : "🎙 Use Microphone"}
          </button>
          {isFileSource && (
            <button type="button" className="btn" onClick={onTogglePause}>
              {isPaused ? "▶ Play" : "⏸ Pause"}
            </button>
          )}
          {isActive && (
            <button type="button" className="btn btn--ghost" onClick={onStop}>
              ✕ Stop
            </button>
          )}
        </div>

        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </div>

      <div className="panel-section">
        <label className="panel-label">Visual</label>
        <div className="preset-row">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`preset-btn ${preset === p.id ? "preset-btn--active" : ""}`}
              onClick={() => onPresetChange(p.id)}
              title={p.description}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section panel-section--row">
        <div className="slider-block">
          <label className="panel-label" htmlFor="sensitivity">
            Sensitivity
          </label>
          <input
            id="sensitivity"
            type="range"
            min={0.5}
            max={2.5}
            step={0.05}
            value={sensitivity}
            onChange={(event) => onSensitivityChange(Number(event.target.value))}
          />
        </div>
        <button type="button" className="btn btn--icon" onClick={onToggleFullscreen}>
          {isFullscreen ? "⤡ Exit" : "⤢ Fullscreen"}
        </button>
      </div>
    </div>
  );
}
