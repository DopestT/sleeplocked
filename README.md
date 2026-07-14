# Dream Visualizer

A real-time, audio-reactive WebGL music visualizer. Drop in an audio file or
switch on your microphone, and it drives three GPU-shader scenes straight off
live frequency and waveform analysis — no canned animations.

## Scenes

- **Nebula Core** — a noise-displaced icosahedron wrapped in a drifting
  particle field. Bass drives the core's swell, treble crackles across its
  surface, beats punch a fresnel glow.
- **Pulse Grid** — a neon spectrogram cityscape. Each column reads a
  logarithmically-spaced frequency bin (bass on the left, treble on the
  right) and rows trail behind in a delayed wave for depth.
- **Waveform Tunnel** — a flythrough of oscilloscope rings, each one shaped
  from the raw time-domain waveform at the moment it spawns, lit by a
  beat-reactive dolly camera.

All three run through a shared bloom/vignette/chromatic-aberration
postprocessing stack ([`@react-three/postprocessing`](https://github.com/pmndrs/postprocessing)).

## How it works

- **Audio**: `src/audio/AudioEngine.ts` wraps the Web Audio API — it can play
  an uploaded file through an `AnalyserNode` (audible, looped) or tap the
  microphone via `getUserMedia` (analysis-only, never routed to the
  speakers, so no feedback). Every rendered frame, `sample()` reads the
  analyser into bass/mid/treble/overall band energies (0..1).
- **Beat detection**: `src/audio/BeatDetector.ts` tracks a rolling average of
  bass energy and flags a beat when it spikes well above that average, with
  a short cooldown so it doesn't double-trigger.
- **Rendering**: built on [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber).
  Each scene samples the engine directly inside its own `useFrame` loop
  (via `src/visualizer/useAudioFrame.ts`) and mutates shader uniforms /
  instance attributes in place — no React re-renders on the audio hot path.
- **Camera**: `src/visualizer/CameraRig.tsx` gives every preset a shared
  gentle sway/bob plus a beat-reactive dolly toward the subject.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run lint      # oxlint
```

Open it in a browser, drop an audio file onto the panel (or click it to pick
one), or hit **Use Microphone**. Switch scenes with the Visual buttons,
tweak **Sensitivity** if the visuals feel too calm or too jumpy, and
**Fullscreen** for the full effect.

## Structure

```
src/
  audio/
    AudioEngine.ts        # Web Audio wrapper: file playback + mic capture + band analysis
    BeatDetector.ts        # rolling-average onset detector
    useAudioEngine.ts      # React hook exposing engine controls + UI state
  visualizer/
    useAudioFrame.ts        # per-frame audio + beat sampling hook (used by every scene)
    shaderChunks.ts          # shared GLSL (simplex noise)
    NebulaCore.tsx            # scene: noise-displaced core + particle field
    PulseGrid.tsx              # scene: instanced spectrogram grid
    WaveformTunnel.tsx          # scene: oscilloscope-ring flythrough
    CameraRig.tsx                # shared camera sway/dolly
    presets.ts                    # per-scene camera + color config
    Visualizer.tsx                 # Canvas + preset switch + postprocessing
  components/
    ControlPanel.tsx        # upload/mic/preset/sensitivity/fullscreen UI
  App.tsx, App.css, index.css
```

## Also in this repo

[`dream-journal/`](./dream-journal) is a second, independent app: a mobile
(Expo/React Native) dream journal that generates a visual scene per dream
entry and charts mood/tag/sleep-quality patterns over time. It's a
different interpretation of "Dream Visualizer" built in parallel, kept
alongside this one rather than merged into it since the two don't share a
stack. See its own README for details.
