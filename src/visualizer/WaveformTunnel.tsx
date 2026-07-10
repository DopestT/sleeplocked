import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { LineLoop } from "three";
import type { AudioEngine } from "../audio/AudioEngine";
import { useAudioFrame } from "./useAudioFrame";

const SEGMENTS = 96;
const RING_COUNT = 26;
const SPACING = 0.85;
const TUNNEL_LENGTH = RING_COUNT * SPACING;
const CAMERA_Z = 4.2;
const BASE_RADIUS = 1.6;
const AMPLITUDE = 1.1;

interface RingHandle {
  line: LineLoop;
  material: THREE.LineBasicMaterial;
  hue: number;
}

function sampleRingPositions(waveform: Uint8Array | null, jitter: number): Float32Array {
  const positions = new Float32Array((SEGMENTS + 1) * 3);
  for (let i = 0; i <= SEGMENTS; i++) {
    const angle = (i / SEGMENTS) * Math.PI * 2;
    let norm = 0;
    if (waveform && waveform.length > 0) {
      const sampleIndex = Math.floor((i / SEGMENTS) * waveform.length) % waveform.length;
      norm = (waveform[sampleIndex] - 128) / 128;
    }
    const radius = BASE_RADIUS + norm * AMPLITUDE + Math.sin(angle * 3 + jitter) * 0.06;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = 0;
  }
  return positions;
}

interface WaveformTunnelProps {
  engine: AudioEngine;
  sensitivity: number;
  colorA: THREE.Color;
  colorB: THREE.Color;
}

export function WaveformTunnel({ engine, sensitivity, colorA, colorB }: WaveformTunnelProps) {
  const groupRef = useRef<THREE.Group>(null);

  const rings = useMemo<RingHandle[]>(() => {
    const list: RingHandle[] = [];
    for (let i = 0; i < RING_COUNT; i++) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(sampleRingPositions(null, i), 3));
      const hue = i / RING_COUNT;
      const material = new THREE.LineBasicMaterial({
        color: colorA.clone().lerp(colorB, hue),
        transparent: true,
        toneMapped: false,
        opacity: 0.4,
      });
      const line = new THREE.LineLoop(geometry, material);
      line.position.z = CAMERA_Z - TUNNEL_LENGTH + i * SPACING;
      list.push({ line, material, hue });
    }
    return list;
  }, [colorA, colorB]);

  useAudioFrame(engine, sensitivity, (frame) => {
    const waveform = engine.getTimeDomainData();
    const speed = 2.6 + frame.overall * 7.5 + frame.beatStrength * 3;

    for (const ring of rings) {
      ring.line.position.z += frame.delta * speed;
      ring.line.rotation.z += frame.delta * (0.05 + ring.hue * 0.2);

      if (ring.line.position.z > CAMERA_Z + 0.4) {
        ring.line.position.z -= TUNNEL_LENGTH;
        const positions = sampleRingPositions(waveform, frame.time + ring.hue * 10);
        (ring.line.geometry as THREE.BufferGeometry).setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3),
        );
        const newHue = (ring.hue + frame.time * 0.05) % 1;
        ring.material.color.copy(colorA).lerp(colorB, newHue);
        ring.material.color.multiplyScalar(1.3 + frame.beatStrength);
      }

      const distanceFromCamera = CAMERA_Z - ring.line.position.z;
      const proximity = THREE.MathUtils.clamp(1 - distanceFromCamera / TUNNEL_LENGTH, 0, 1);
      ring.material.opacity = 0.15 + proximity * 0.85;
    }
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <primitive key={i} object={ring.line} />
      ))}
    </group>
  );
}
