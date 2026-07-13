import { MoodId } from "@/constants/moods";

export type SceneShapeType = "orb" | "streak" | "spiral";

export interface SceneShape {
  type: SceneShapeType;
  x: number; // 0-100, percent of canvas width
  y: number; // 0-100, percent of canvas height
  size: number; // 0-100, percent of canvas width
  rotation: number; // degrees
  color: string;
  opacity: number; // 0-1
}

export interface DreamScene {
  gradient: [string, string];
  shapes: SceneShape[];
}

export interface VisualizationRequest {
  title: string;
  description: string;
  mood: MoodId;
  tags: string[];
  seed: string;
}

export interface DreamVisualizationProvider {
  generateScene(request: VisualizationRequest): Promise<DreamScene>;
}
