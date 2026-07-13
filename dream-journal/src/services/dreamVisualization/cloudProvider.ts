import { DreamVisualizationProvider, DreamScene, VisualizationRequest } from "./types";

// Placeholder for a real image-generation backend (e.g. an LLM image model
// or Stable Diffusion) that turns the dream description into an actual
// generated image rather than the on-device generative scene MockDreamVisualizationProvider
// produces. Implement generateScene to call the provider and return a
// DreamScene (or extend DreamScene with an `imageUrl` field once a real
// provider is wired in), then return this class from
// createVisualizationProvider in index.ts.
export class CloudDreamVisualizationProvider implements DreamVisualizationProvider {
  async generateScene(_request: VisualizationRequest): Promise<DreamScene> {
    throw new Error(
      "CloudDreamVisualizationProvider is not implemented yet. Wire up a real image-generation API here."
    );
  }
}
