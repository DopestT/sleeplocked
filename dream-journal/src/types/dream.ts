import { MoodId } from "@/constants/moods";

export interface Dream {
  id: string;
  title: string;
  description: string;
  mood: MoodId;
  tags: string[];
  sleepQuality: number; // 1-5
  createdAt: string; // ISO date the dream was logged
  visualizationSeed: string;
}

export type NewDreamInput = Omit<Dream, "id" | "createdAt" | "visualizationSeed">;
