import { Suspense, useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { AudioEngine } from "../audio/AudioEngine";
import { NebulaCore } from "./NebulaCore";
import { PulseGrid } from "./PulseGrid";
import { WaveformTunnel } from "./WaveformTunnel";
import { CameraRig } from "./CameraRig";
import { PRESETS, type PresetId } from "./presets";

interface VisualizerProps {
  engine: AudioEngine;
  preset: PresetId;
  sensitivity: number;
}

export function Visualizer({ engine, preset, sensitivity }: VisualizerProps) {
  const config = useMemo(() => PRESETS.find((p) => p.id === preset) ?? PRESETS[0], [preset]);
  const colorA = useMemo(() => new THREE.Color(config.colors[0]), [config]);
  const colorB = useMemo(() => new THREE.Color(config.colors[1]), [config]);

  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 55, position: config.camera.base, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#03030a"]} />
      <CameraRig engine={engine} sensitivity={sensitivity} basePosition={config.camera.base} lookAt={config.camera.look} />

      {preset === "nebula" && <NebulaCore engine={engine} sensitivity={sensitivity} colorA={colorA} colorB={colorB} />}
      {preset === "grid" && <PulseGrid engine={engine} sensitivity={sensitivity} colorA={colorA} colorB={colorB} />}
      {preset === "tunnel" && <WaveformTunnel engine={engine} sensitivity={sensitivity} colorA={colorA} colorB={colorB} />}

      <Suspense fallback={null}>
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.85}
            luminanceThreshold={0.32}
            luminanceSmoothing={0.2}
            mipmapBlur
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0006, 0.0006]}
            radialModulation={false}
            modulationOffset={0}
          />
          <Vignette eskil={false} offset={0.15} darkness={0.9} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
