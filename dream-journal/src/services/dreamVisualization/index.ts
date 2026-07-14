import { DreamVisualizationProvider } from "./types";
import { MockDreamVisualizationProvider } from "./mockProvider";

export function createVisualizationProvider(): DreamVisualizationProvider {
  return new MockDreamVisualizationProvider();
}

export * from "./types";
