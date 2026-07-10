export type PresetId = "nebula" | "grid" | "tunnel";

export interface PresetConfig {
  id: PresetId;
  label: string;
  description: string;
  camera: {
    base: [number, number, number];
    look: [number, number, number];
  };
  colors: [string, string];
}

export const PRESETS: PresetConfig[] = [
  {
    id: "nebula",
    label: "Nebula Core",
    description: "A living, noise-displaced core wrapped in drifting particles.",
    camera: { base: [0, 0.4, 5.6], look: [0, 0, 0] },
    colors: ["#7c3aed", "#22d3ee"],
  },
  {
    id: "grid",
    label: "Pulse Grid",
    description: "A neon spectrogram cityscape rippling with the frequency spectrum.",
    camera: { base: [0, 3.6, 6.4], look: [0, 0.6, -3.2] },
    colors: ["#f472b6", "#38bdf8"],
  },
  {
    id: "tunnel",
    label: "Waveform Tunnel",
    description: "A flythrough of oscilloscope rings shaped by the raw waveform.",
    camera: { base: [0, 0, 4.9], look: [0, 0, -3] },
    colors: ["#facc15", "#a855f7"],
  },
];
