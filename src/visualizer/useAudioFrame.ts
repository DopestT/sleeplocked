import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { AudioEngine, AudioBands } from "../audio/AudioEngine";
import { BeatDetector } from "../audio/BeatDetector";

export interface AudioFrame extends AudioBands {
  time: number;
  delta: number;
  isBeat: boolean;
  beatStrength: number;
}

/** Samples the audio engine + beat detector once per rendered frame. */
export function useAudioFrame(engine: AudioEngine, sensitivity: number, onFrame: (frame: AudioFrame) => void) {
  const beatDetector = useRef(new BeatDetector());
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const bands = engine.sample();
    const scaled = {
      bass: Math.min(1, bands.bass * sensitivity),
      mid: Math.min(1, bands.mid * sensitivity),
      treble: Math.min(1, bands.treble * sensitivity),
      overall: Math.min(1, bands.overall * sensitivity),
    };
    const { isBeat, strength } = beatDetector.current.update(scaled.bass, delta);

    onFrame({
      ...scaled,
      time: elapsed.current,
      delta,
      isBeat,
      beatStrength: strength,
    });
  });
}
