import { useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import type { AudioEngine } from "../audio/AudioEngine";
import { useAudioFrame } from "./useAudioFrame";

interface CameraRigProps {
  engine: AudioEngine;
  sensitivity: number;
  basePosition: [number, number, number];
  lookAt: [number, number, number];
}

/** Gentle sway/bob plus a beat-reactive dolly toward the subject, shared across all presets. */
export function CameraRig({ engine, sensitivity, basePosition, lookAt }: CameraRigProps) {
  const { camera } = useThree();
  const base = useRef(new THREE.Vector3(...basePosition));
  const target = useRef(new THREE.Vector3(...lookAt));
  const direction = useRef(
    new THREE.Vector3(...lookAt).sub(new THREE.Vector3(...basePosition)).normalize(),
  );

  useAudioFrame(engine, sensitivity, (frame) => {
    base.current.set(...basePosition);
    target.current.set(...lookAt);
    direction.current.copy(target.current).sub(base.current).normalize();

    const sway = Math.sin(frame.time * 0.35) * 0.25;
    const bob = Math.sin(frame.time * 0.6) * 0.15;
    const dolly = frame.beatStrength * 0.5 + frame.bass * 0.2;

    camera.position.set(
      base.current.x + sway + direction.current.x * dolly,
      base.current.y + bob + direction.current.y * dolly,
      base.current.z + direction.current.z * dolly,
    );
    camera.lookAt(target.current);
  });

  return null;
}
