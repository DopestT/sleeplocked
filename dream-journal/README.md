# Dream Journal

Write down a dream, get a generated visual scene for it, and see patterns
(mood, recurring tags, sleep quality) across your dream journal over time.

## Scope note

The task that produced this app was just the name "Dream Visualizer," with
no other spec. A different interpretation — a real-time audio-reactive
WebGL music visualizer — was built in parallel and already lives at the
repo root; this app is the other interpretation (a dream journal with a
generated-visual per entry), kept alongside it as `dream-journal/` rather
than overwriting it. If a private dream journal isn't what was wanted here
either, this is the starting point to redirect from.

## What's here

1. **Log a dream** — title, free-text description, mood, tags, sleep
   quality (1-5). Stored locally on-device (`AsyncStorage`), nothing leaves
   the phone.
2. **Visualization** — every dream gets a generated abstract scene (a
   gradient plus a handful of orbs/streaks/spirals) derived deterministically
   from that dream's text, mood, and tags, so the same dream always renders
   the same scene. This runs entirely on-device — no image-generation API,
   no network call, no API key required to try the app.
3. **Patterns** — mood distribution, most common tags, and a sleep-quality
   trend line across your logged dreams.

## Why the visualization is generative-on-device, not a real AI image

Wiring up an actual text-to-image model (DALL·E, Stable Diffusion, etc.)
needs an API key and a backend call, which isn't something to bake in
without knowing which provider/budget is wanted. So, following the same
pattern `speaklayer` uses for STT/translation, the visualization sits behind
a small interface:

```
src/services/dreamVisualization/
  types.ts          # DreamVisualizationProvider interface
  mockProvider.ts    # today's implementation: seeded generative SVG scene
  cloudProvider.ts    # placeholder — implement + return from index.ts to
                       # swap in a real image-generation backend
  index.ts            # createVisualizationProvider() factory
```

Swapping in a real model later is a matter of implementing
`DreamVisualizationProvider` in `cloudProvider.ts` and returning it from
`createVisualizationProvider()` — no screen code changes needed.

## App structure

```
App.tsx                        # providers + navigation root
src/
  screens/
    HomeScreen.tsx               # dream list
    NewDreamScreen.tsx            # log-a-dream form
    DreamDetailScreen.tsx         # single dream + its visualization
    PatternsScreen.tsx            # mood/tag/sleep-quality charts
    SettingsScreen.tsx            # about + clear local data
  components/                    # DreamCard, DreamVisualization, MoodPicker,
                                   # TagInput, BarChart, LineChart, EmptyState
  context/DreamsContext.tsx      # dream CRUD + AsyncStorage persistence
  hooks/useDreams.ts
  services/
    dreamVisualization/           # see above
    storage/dreamStorage.ts        # AsyncStorage read/write
  navigation/                     # stack navigator + route types
  theme/, constants/              # colors, moods, suggested tags
```

## Running it

This app lives in its own subdirectory with its own `package.json` —
install and run from inside `dream-journal/`, not the repo root.

```bash
cd dream-journal
npm install
npm run web      # quickest way to sanity-check UI
npm run ios       # requires Xcode / iOS simulator or a physical device
npm run android   # requires Android Studio / emulator or a physical device
```

## Roadmap

1. **This MVP** — local dream journal, on-device generative visualization,
   pattern charts.
2. **Real image generation** — implement `cloudProvider.ts` against a text-to-image
   API and let users toggle "generate a real image" per dream.
3. **Reminders / sleep-schedule tie-in** — given the sibling app name
   ("sleeplocked"), a natural next step is prompting for a dream log right
   after an alarm/wake event, if this app is meant to live alongside a sleep
   tracker.
4. **Cloud sync** — currently everything is device-local; add an account +
   sync layer if dreams should follow the user across devices.
