import { moodColors, colors } from "@/theme/colors";
import {
  DreamScene,
  DreamVisualizationProvider,
  SceneShape,
  SceneShapeType,
  VisualizationRequest,
} from "./types";

// Small deterministic PRNG (mulberry32) so the same dream always renders the
// same scene, without any network call or image-generation API. Swapping in
// a real image model later (see cloudProvider.ts) only requires implementing
// DreamVisualizationProvider and returning it from createVisualizationProvider.
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SHAPE_TYPES: SceneShapeType[] = ["orb", "streak", "spiral"];

function buildPalette(moodColor: string): [string, string] {
  return [moodColor, colors.background];
}

export class MockDreamVisualizationProvider implements DreamVisualizationProvider {
  async generateScene(request: VisualizationRequest): Promise<DreamScene> {
    const seedText = `${request.seed}:${request.title}:${request.description}:${request.tags.join(",")}`;
    const random = mulberry32(hashString(seedText));
    const moodColor = moodColors[request.mood] ?? colors.accent;

    // More text/tags -> a slightly busier scene, capped for readability.
    const richness = Math.min(
      10,
      Math.max(4, Math.round(request.description.length / 40) + request.tags.length)
    );

    const shapes: SceneShape[] = Array.from({ length: richness }).map(() => {
      const type = SHAPE_TYPES[Math.floor(random() * SHAPE_TYPES.length)];
      return {
        type,
        x: random() * 100,
        y: random() * 100,
        size: 8 + random() * 26,
        rotation: random() * 360,
        color: random() > 0.5 ? moodColor : colors.accentAlt,
        opacity: 0.25 + random() * 0.5,
      };
    });

    return {
      gradient: buildPalette(moodColor),
      shapes,
    };
  }
}
