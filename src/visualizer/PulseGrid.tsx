import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { InstancedMesh } from "three";
import type { AudioEngine } from "../audio/AudioEngine";
import { useAudioFrame } from "./useAudioFrame";

const COLUMNS = 32;
const ROWS = 14;
const COUNT = COLUMNS * ROWS;
const SPACING_X = 0.32;
const SPACING_Z = 0.55;
const HISTORY_LEN = ROWS * 6;
const ROW_DELAY_FRAMES = 4;
const BASE_HEIGHT = 0.06;
const HEIGHT_SCALE = 3.4;

const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

interface PulseGridProps {
  engine: AudioEngine;
  sensitivity: number;
  colorA: THREE.Color;
  colorB: THREE.Color;
}

/** Logarithmic bin lookup so low columns sample bass (dense, low bins) and high columns sample treble (sparse, high bins). */
function buildColumnBins(binCount: number): number[] {
  const usable = Math.floor(binCount * 0.55);
  const bins: number[] = [];
  for (let c = 0; c < COLUMNS; c++) {
    const t = c / (COLUMNS - 1);
    const bin = Math.floor(Math.pow(t, 1.8) * (usable - 2)) + 1;
    bins.push(bin);
  }
  return bins;
}

export function PulseGrid({ engine, sensitivity, colorA, colorB }: PulseGridProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const frameCounter = useRef(0);
  const history = useMemo(() => {
    const arr: Float32Array[] = [];
    for (let c = 0; c < COLUMNS; c++) arr.push(new Float32Array(HISTORY_LEN));
    return arr;
  }, []);
  const columnBins = useRef<number[] | null>(null);

  const geometry = useMemo(() => {
    const box = new THREE.BoxGeometry(0.22, 1, 0.22);
    box.translate(0, 0.5, 0);
    return box;
  }, []);

  useAudioFrame(engine, sensitivity, (frame) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const freq = engine.getFrequencyData();
    if (freq && !columnBins.current) {
      columnBins.current = buildColumnBins(freq.length);
    }
    const bins = columnBins.current;
    frameCounter.current += 1;
    const fc = frameCounter.current;

    for (let c = 0; c < COLUMNS; c++) {
      const magnitude = freq && bins ? freq[bins[c]] / 255 : 0;
      history[c][fc % HISTORY_LEN] = magnitude;
    }

    let instanceIndex = 0;
    const hueShift = (frame.time * 0.02) % 1;
    for (let r = 0; r < ROWS; r++) {
      const delay = r * ROW_DELAY_FRAMES;
      for (let c = 0; c < COLUMNS; c++) {
        const idx = ((fc - delay) % HISTORY_LEN + HISTORY_LEN) % HISTORY_LEN;
        const magnitude = history[c][idx];
        const height = BASE_HEIGHT + magnitude * HEIGHT_SCALE * (1 - r / (ROWS * 1.6));

        const x = (c - (COLUMNS - 1) / 2) * SPACING_X;
        const z = -r * SPACING_Z;
        dummy.position.set(x, 0, z);
        dummy.scale.set(1, Math.max(0.02, height), 1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIndex, dummy.matrix);

        const t = c / (COLUMNS - 1);
        tmpColor.copy(colorA).lerp(colorB, t);
        tmpColor.offsetHSL(hueShift, 0, 0);
        const brightness = 1.4 + magnitude * 2.4 + frame.beatStrength * 1.2;
        tmpColor.multiplyScalar(brightness);
        mesh.setColorAt(instanceIndex, tmpColor);

        instanceIndex += 1;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, COUNT]}>
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
