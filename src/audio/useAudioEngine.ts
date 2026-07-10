import { useMemo, useRef, useState, useCallback } from "react";
import { AudioEngine } from "./AudioEngine";

export type ConnectionState = "idle" | "connecting" | "playing" | "error";

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);
  if (!engineRef.current) engineRef.current = new AudioEngine();
  const engine = engineRef.current;

  const [state, setState] = useState<ConnectionState>("idle");
  const [trackName, setTrackName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const loadFile = useCallback(
    async (file: File) => {
      setState("connecting");
      setErrorMessage(null);
      try {
        await engine.loadFile(file);
        setTrackName(file.name);
        setIsPaused(false);
        setState("playing");
      } catch (err) {
        setState("error");
        setErrorMessage(err instanceof Error ? err.message : "Could not load that audio file.");
      }
    },
    [engine],
  );

  const useMicrophone = useCallback(async () => {
    setState("connecting");
    setErrorMessage(null);
    try {
      await engine.useMicrophone();
      setTrackName("Microphone");
      setIsPaused(false);
      setState("playing");
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Microphone access was denied or is unavailable.",
      );
    }
  }, [engine]);

  const togglePause = useCallback(() => {
    if (!engine.isFileSource) return;
    if (engine.isPaused) {
      engine.play();
      setIsPaused(false);
    } else {
      engine.pause();
      setIsPaused(true);
    }
  }, [engine]);

  const stop = useCallback(() => {
    engine.stop();
    setTrackName(null);
    setState("idle");
    setIsPaused(false);
  }, [engine]);

  return useMemo(
    () => ({
      engine,
      state,
      trackName,
      errorMessage,
      isPaused,
      isFileSource: engine.isFileSource,
      loadFile,
      useMicrophone,
      togglePause,
      stop,
    }),
    [engine, state, trackName, errorMessage, isPaused, loadFile, useMicrophone, togglePause, stop],
  );
}
