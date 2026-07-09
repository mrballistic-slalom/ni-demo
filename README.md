# NI Play

A zero-backend, mobile-first, browser step-sequencer beat toy. Pick a genre — a beat’s already grooving — tinker with it, then share a link or export a WAV. No accounts, no server.

---

## What It Is

NI Play is a creative toy, not a DAW. The core loop is:

1. Land on the app, read the pitch, and pick a genre (Trap, Lo-Fi, House, Drill, or Hyperpop).
2. A pre-built beat starts playing immediately on a 6-track × 16-step grid.
3. Toggle cells, swap sounds, adjust BPM/bars/swing, mute/solo tracks.
4. Share a link (the beat is encoded right into the URL) or export a WAV.

There’s no sign-up, no save-to-account flow, and no server-side state — everything lives in the browser and in the share URL itself.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI Library | React 19 |
| Language | TypeScript 6.0.3 |
| Styling | Emotion (`@emotion/react`, `@emotion/styled`) |
| Animation | Motion (`motion`) |
| Icons | `lucide-react` |
| Audio | Tone.js |
| State | Zustand |
| Testing | Vitest 4 (+ `@vitest/coverage-v8`) |
| Runtime | Node ≥ 24 |
| Deployment | Vercel |

**Explicitly not used:** Supabase, MUI, Tailwind. All three were part of the original build and were removed in the redesign — there’s no backend, no auth, and no database.

---

## Audio Architecture (hybrid)

Two different signal sources feed the same sequencer:

- **Drum/FX one-shots** are rendered **offline** ahead of time by `scripts/renderSounds.mjs` — a small DSP renderer that synthesizes each hit (noise, saturation, envelopes, etc.) — into WAV files under `public/sounds/<genre>/…wav`. These play back at runtime via `Tone.Player`.
- **Bass and melody** are live Tone.js synth voices, triggered with a note at each step rather than a fixed sample.

Both are unified behind a single `Voice` abstraction (`src/audio/voice.ts`), so the sequencer doesn’t need to know whether a track is a sample or a synth. `src/audio/synthKit.ts` builds a kit of voices per genre and routes each one → a per-track `Tone.Gain` (for mute/solo/volume) → a shared master limiter → the destination. `src/audio/sequencer.ts` drives a `Tone.Sequence` that triggers whichever voice is armed for each track on each active step. WAV export (`src/audio/exporter.ts`) mirrors the same voice/gain/limiter chain through an offline `OfflineAudioContext` render.

---

## Genres

Five genres, each a full “skin”: color palette, display font, background texture, cell geometry, glow treatment, and motion feel — plus a tuned kit of sounds and a genre-appropriate melody/bass note range.

| Genre | Vibe |
|---|---|
| Trap | Dark, hard-hitting |
| Lo-Fi | Warm, dusty, chill |
| House | Driving, groovy |
| Drill | Aggressive, sliding bass |
| Hyperpop | Chaotic, detuned, glitchy |

Genre skins live in `src/theme/skins.ts`; genre patterns/kits live in `src/data/genres.ts`.

---

## Features

- **Landing page** — a short explainer (hero + “how it works”) that flows into the genre picker, each tile skinned in its genre’s palette.
- **Step grid** — a tactile 6-track × 16-step (× pattern length) grid with an animated beam-style playhead sweeping across the active column.
- **Hardware-feel transport** — play/stop, BPM, bar count (1/2/4 bars), and swing.
- **Track controls** — mute, solo, and volume per track.
- **Sound browser** — preview and swap the sound assigned to any track.
- **URL share** — the entire beat (genre, grid, sounds, BPM, swing, etc.) is encoded directly into the share URL — no database round-trip needed to reopen it.
- **WAV export** — client-side render via `OfflineAudioContext`, no server involved.
- **Shareable `/beat` page** — opening a share link plays the beat back and renders a per-beat dynamic Open Graph image for link previews.

---

## Project Structure

```
src/
├── app/             # Next.js App Router pages (/, /studio, /beat, /beat/og)
├── audio/           # Tone.js engine, sequencer, voice abstraction, synth kit, sound loader, exporter
├── components/      # UI components (Landing, Grid, Transport, TrackRow, SoundBrowser, Share, Export, Studio, Layout, common)
├── data/            # Genre definitions, sound catalog, track metadata
├── lib/             # Share-URL encode/decode, WAV encoding, beat-preview helpers, general utilities
├── stores/          # Zustand stores (grid, transport, etc.)
├── theme/           # Per-genre skins, fonts, Emotion registry
├── test/            # Vitest setup
└── types/           # Shared TypeScript types
scripts/
└── renderSounds.mjs # Offline DSP renderer — generates the WAV files in public/sounds/
public/
└── sounds/          # Rendered per-genre audio (output of renderSounds.mjs)
```

---

## Getting Started

### Prerequisites

- Node.js 24 (see `.nvmrc`)

### Install and run

```bash
git clone https://github.com/mrballistic-slalom/ni-demo.git
cd ni-demo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

There’s no environment configuration required — no API keys, no database URL, nothing to fill in. If `public/sounds/` is missing or stale, regenerate it:

```bash
npm run generate-sounds
```

This re-runs `scripts/renderSounds.mjs` and rebuilds every genre’s WAV files from scratch.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run the suite with v8 coverage |
| `npm run generate-sounds` | Regenerate `public/sounds/` via `scripts/renderSounds.mjs` |

Coverage is enforced at **≥80%** (lines, functions, branches, statements) for the covered set defined in `vitest.config.ts` — currently `src/lib/`, `src/audio/voice.ts`, `src/data/genres.ts`, `src/data/sounds.ts`, `src/theme/skins.ts`, and `scripts/renderSounds.mjs`.

---

## CI / Deployment

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request against **Node 24**: `npm ci` → `typecheck` → `test:coverage` → `generate-sounds` → `build`.

Deployment is via Vercel’s Git integration — no manual deploy step, no separate infrastructure to provision.

---

## Audio Notes

- `Tone.start()` is called on the first user gesture (the genre tap) to satisfy browser autoplay policies, including iOS Safari.
- The app listens for `visibilitychange` to resume the `AudioContext` when the user returns to the tab.
- Drum/FX sounds are pre-rendered WAVs served from `public/sounds/<genre>/`; bass and melody are synthesized live by Tone.js — see “Audio Architecture” above.

---

## License

MIT — see [LICENSE](LICENSE).
