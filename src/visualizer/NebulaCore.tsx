import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { Mesh, Points, ShaderMaterial } from "three";
import type { AudioEngine } from "../audio/AudioEngine";
import { useAudioFrame } from "./useAudioFrame";
import { SIMPLEX_NOISE_GLSL } from "./shaderChunks";

const CORE_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uBass;
  uniform float uTreble;
  uniform float uBeat;

  varying vec3 vNormal;
  varying float vDisplacement;

  ${SIMPLEX_NOISE_GLSL}

  void main() {
    vNormal = normal;
    float slow = snoise(position * 1.4 + uTime * 0.12) * 0.28;
    float fast = snoise(position * 3.1 - uTime * 0.4) * uTreble * 0.22;
    float displacement = slow + fast + uBass * 0.55 + uBeat * 0.25;
    vDisplacement = displacement;

    vec3 displaced = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const CORE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uMid;
  uniform float uBeat;

  varying vec3 vNormal;
  varying float vDisplacement;

  void main() {
    float fresnel = pow(1.0 - abs(vNormal.z), 2.6);
    vec3 base = mix(uColorA, uColorB, clamp(vDisplacement * 0.9 + uMid, 0.0, 1.0)) * 0.6;
    vec3 glow = base + fresnel * (0.22 + uBeat * 0.35) * uColorB;
    gl_FragColor = vec4(glow, 1.0);
  }
`;

const PARTICLE_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uBass;
  uniform float uTreble;
  attribute float aSeed;
  varying float vSeed;

  void main() {
    vSeed = aSeed;
    vec3 pos = position;
    float pulse = 1.0 + uBass * 0.35 * sin(aSeed * 6.28 + uTime * 0.6);
    pos *= pulse;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float size = (1.2 + uTreble * 3.5 + aSeed * 1.5) * (220.0 / max(-mvPosition.z, 1.5));
    gl_PointSize = min(size, 28.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const PARTICLE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    vec3 color = mix(uColorA, uColorB, vSeed);
    gl_FragColor = vec4(color, alpha * 0.55);
  }
`;

function makeParticleGeometry(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = radius * (0.75 + Math.random() * 0.6);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    seeds[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  return geometry;
}

interface NebulaCoreProps {
  engine: AudioEngine;
  sensitivity: number;
  colorA: THREE.Color;
  colorB: THREE.Color;
}

export function NebulaCore({ engine, sensitivity, colorA, colorB }: NebulaCoreProps) {
  const coreRef = useRef<Mesh>(null);
  const particlesRef = useRef<Points>(null);
  const coreMaterialRef = useRef<ShaderMaterial>(null);
  const particleMaterialRef = useRef<ShaderMaterial>(null);

  const particleGeometry = useMemo(() => makeParticleGeometry(1800, 2.1), []);

  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBass: { value: 0 },
      uTreble: { value: 0 },
      uMid: { value: 0 },
      uBeat: { value: 0 },
      uColorA: { value: colorA },
      uColorB: { value: colorB },
    }),
    [colorA, colorB],
  );

  const particleUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBass: { value: 0 },
      uTreble: { value: 0 },
      uColorA: { value: colorA },
      uColorB: { value: colorB },
    }),
    [colorA, colorB],
  );

  useAudioFrame(engine, sensitivity, (frame) => {
    coreUniforms.uTime.value = frame.time;
    coreUniforms.uBass.value = frame.bass;
    coreUniforms.uTreble.value = frame.treble;
    coreUniforms.uMid.value = frame.mid;
    coreUniforms.uBeat.value = frame.beatStrength;

    particleUniforms.uTime.value = frame.time;
    particleUniforms.uBass.value = frame.bass;
    particleUniforms.uTreble.value = frame.treble;

    if (coreRef.current) {
      coreRef.current.rotation.y += frame.delta * (0.08 + frame.mid * 0.3);
      coreRef.current.rotation.x += frame.delta * 0.02;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= frame.delta * 0.03;
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.3, 5]} />
        <shaderMaterial
          ref={coreMaterialRef}
          uniforms={coreUniforms}
          vertexShader={CORE_VERTEX_SHADER}
          fragmentShader={CORE_FRAGMENT_SHADER}
        />
      </mesh>
      <points ref={particlesRef} geometry={particleGeometry}>
        <shaderMaterial
          ref={particleMaterialRef}
          uniforms={particleUniforms}
          vertexShader={PARTICLE_VERTEX_SHADER}
          fragmentShader={PARTICLE_FRAGMENT_SHADER}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}
