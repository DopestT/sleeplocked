import { useCallback, useEffect, useState } from "react";
import { Visualizer } from "./visualizer/Visualizer";
import { ControlPanel } from "./components/ControlPanel";
import { useAudioEngine } from "./audio/useAudioEngine";
import type { PresetId } from "./visualizer/presets";
import "./App.css";

function App() {
  const audio = useAudioEngine();
  const [preset, setPreset] = useState<PresetId>("nebula");
  const [sensitivity, setSensitivity] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  }, []);

  return (
    <div className="app-shell">
      <Visualizer engine={audio.engine} preset={preset} sensitivity={sensitivity} />

      <header className="app-header">
        <h1>
          Dream <span>Visualizer</span>
        </h1>
        <button
          type="button"
          className="btn btn--ghost panel-toggle"
          onClick={() => setIsPanelOpen((open) => !open)}
        >
          {isPanelOpen ? "Hide controls" : "Show controls"}
        </button>
      </header>

      {isPanelOpen && (
        <ControlPanel
          connectionState={audio.state}
          trackName={audio.trackName}
          errorMessage={audio.errorMessage}
          isPaused={audio.isPaused}
          isFileSource={audio.isFileSource}
          preset={preset}
          sensitivity={sensitivity}
          isFullscreen={isFullscreen}
          onFileSelected={audio.loadFile}
          onUseMicrophone={audio.useMicrophone}
          onTogglePause={audio.togglePause}
          onStop={audio.stop}
          onPresetChange={setPreset}
          onSensitivityChange={setSensitivity}
          onToggleFullscreen={toggleFullscreen}
        />
      )}
    </div>
  );
}

export default App;
