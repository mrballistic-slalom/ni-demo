# NI Play — Redesign Design Spec

**Date:** 2026-07-08
**Status:** Proposed (supersedes `prd.md` as the source of truth)
**Author:** Todd Greco + Claude

---

## 1. What this is

A zero-backend, install-free, mobile-first beat *toy* that lives entirely in the browser. You land, pick a genre, a beat is already grooving, and you tinker. The entire product is a fast delight loop:

> tap a square → hear it → "oh, nice" → make it yours → share it.

It is a creative toy, not a DAW. Success = the loop feels great on a phone in under 20 seconds, and sharing/exporting gives a satisfying "I made this" payoff.

This spec is a ground-up reconception. The original `prd.md` assumed a Supabase backend, sample-library audio, and generic Material UI. All three assumptions are dropped. `prd.md` stays in the repo but is superseded by this document.

### Goals

1. Each genre sounds *genuinely like itself* (the current build secretly plays the same house oscillator blips for every genre).
2. Each genre *looks and feels* like its own thing — a distinct skin, not one theme with five hues.
3. The grid is a tactile, delightful hero surface.
4. Everything real works with no backend; nothing is a fake stub.

### Non-goals (the honest trim)

Cut, because they depended on the now-removed Supabase backend:

- User accounts / auth.
- Server-side Save and the "Your Beats" dashboard.
- Milestone tracking tied to a user profile.
- The `nanoid` dependency and API routes.

Kept, because they genuinely work client-side and deliver the payoff:

- **Share via URL** — a beat is just data (genre + grid + bpm + swing + sound selections). Encode it into the share link; `/beat` decodes and plays it. On Vercel we also render a dynamic OG preview image from that data.
- **Export WAV** — `OfflineAudioContext` renders the loop client-side and downloads it. (No MP3 / `lamejs` — WAV is a clean, real payoff.)

---

## 2. Stack decisions

| Layer | Current | New | Why |
|---|---|---|---|
| Framework | Next.js 14 App Router | **Keep** | Solved deployment quirks; framework isn't the stale part. |
| Styling | MUI v5 (`sx`/`styled`) | **Emotion `styled` + CSS-variable theming** | Bespoke per-genre skins fight Material defaults; Emotion is already a dep and gives full control. **No Tailwind** (standing rule). |
| Icons | `@mui/icons-material` | **`lucide-react`** | Clean, tree-shakeable, matches a custom look. |
| Animation | framer-motion (installed, unused) | **framer-motion** | Cell toggles, playhead, genre transitions. |
| State | Zustand | **Keep** | Works; single source of truth. |
| Audio | `Tone.Player` per track loading WAVs | **Hybrid: offline-rendered sample one-shots + Tone.js synth voices** (see §5) | Best result-to-effort; samples where they win, synthesis where it's the right tool. |
| Deploy | Static export → GitHub Pages at `/ni-demo` | **Vercel, served at root** | Removes `basePath`/`assetPrefix` friction; unlocks dynamic OG images. |
| Backend | Supabase | **None** | Client-only demo. |
| Toolchain | Node (unpinned), mixed dep versions | **Node ≥ 24, all libraries upgraded to latest** | User request; `.nvmrc` + `engines` pin it; CI runs on Node 24. |

Upgrading to latest pulls **Next.js 15 + React 19** (and latest Tone/Zustand/Emotion/framer-motion/TypeScript/ESLint). Since the app is being rebuilt, this is low marginal cost; the upgrade task fixes any React 19 / Next 15 breakages.

**Removed deps:** `@mui/material`, `@mui/icons-material`, `nanoid`.
**Added deps:** `lucide-react`. (Emotion, framer-motion, zustand, tone already present.)

---

## 3. Deployment (Vercel)

- Drop `output: 'export'`, `basePath`, `assetPrefix`, and `images: { unoptimized: true }` from `next.config.js`.
- Remove the `NEXT_PUBLIC_BASE_PATH` env plumbing and the base-path prefixing in `getSoundUrl`.
- Keep the Tone.js ESM webpack alias.
- The repo is **already connected to Vercel via Git integration**, so deploys happen automatically: pushing the `redesign/ni-play` branch produces a preview deploy, and merging to the default branch produces production. Remove the old `.github/workflows/deploy.yml` (GitHub Pages).
- Add a **CI workflow** (`.github/workflows/ci.yml`) on **Node 24+** running `typecheck`, `test`, and `build` on push/PR — separate from Vercel's own build.
- **Dynamic OG image:** a route (`app/beat/opengraph-image.tsx` or an `og` route handler) reads the URL-encoded beat and renders a branded preview (genre color, title, a mini render of the pattern) via `next/og`. No database needed.

---

## 4. Genre system — identities + skins

A genre is no longer "a label + a hex color." Each genre is a full **identity**: evocative copy, a signature sonic hook, a tuned synth/sample **kit**, a template pattern that shows it off, and a complete **visual skin**.

### 4.1 Copy (user-facing — curly punctuation per standing standard)

| Genre | Tagline | Signature hook |
|---|---|---|
| **Trap** | "Booming 808s and rattling hats." | Sliding sub-bass, triplet hi-hat rolls, space to swagger. |
| **Lo-Fi** | "Dusty keys, lazy swing, a rainy afternoon." | Detuned Rhodes, vinyl hiss, soft off-grid drums. |
| **House** | "Four-on-the-floor, built for 2 a.m." | Punchy kick every beat, off-beat open hats, bright chord stabs. |
| **Drill** | "Sliding sub and skittering triplets. Menace." | Gliding 808, dark keys, stuttering hats. |
| **Hyperpop** | "Detuned, sugar-rushed, gloriously too much." | Pitched-up, distorted, glitchy, maximal. |

Lineup stays at these 5.

### 4.2 Per-genre skin (the "separate versions")

Each genre defines a `GenreSkin` token set. Switching genre swaps the entire look, not just an accent color:

```
GenreSkin {
  palette:    { bgGradient, surface, primary, accent, cellOn, cellOff, glow, text, textDim }
  typography: { displayFont, displayCase, displayWeight, letterSpacing }   // distinct display font per genre
  texture:    'grain' | 'scanlines' | 'paper' | 'chromatic' | 'none'       // overlay treatment
  geometry:   { cellRadius, cellGap, cellShape }                           // sharp vs rounded vs pill
  glow:       { intensity, blur }                                          // how much cells/UI bloom
  motion:     { easing, springiness, hitPop }                              // character of animations
}
```

Intended moods (final values chosen during build with the ui-ux-pro-max + impeccable skills):

- **Trap** — dark, sharp, chrome + blood-red glow; hard condensed grotesque display font; subtle grain.
- **Lo-Fi** — warm amber/sepia, rounded, papery texture; soft rounded/humanist display font; vinyl-noise overlay.
- **House** — neon purple club, pulsing glow; clean geometric display font; smooth motion.
- **Drill** — cold, brutalist, toxic-green; stencil/condensed display font; low glow, hard motion.
- **Hyperpop** — candy pink/cyan, maximal bloom; bubbly display font; chromatic-aberration texture, bouncy motion.

Skins are applied by setting CSS custom properties on a wrapper element (extending today's `--genre-*` scaffolding) plus a small set of conditional overlay components (grain/scanline/vinyl/chromatic) gated by `texture`.

### 4.3 Fonts

`next/font` (Google) — Inter for UI body, plus one display face per genre. Chosen at build so each genre's wordmark and headings read as a different world.

---

## 5. Audio architecture (the real work)

### 5.1 The `Voice` interface

Every track is driven by a `Voice`:

```ts
interface Voice {
  trigger(time: number, opts?: { velocity?: number; note?: string }): void;
  dispose(): void;
  connect(node): void;   // to per-track volume/mute → master
}
```

Two implementations:

- **`SampleVoice`** — wraps a `Tone.Player` playing an offline-rendered one-shot. Used for **kick, snare, hi-hat, fx** (fixed-pitch percussive hits — where processed samples beat live synthesis).
- **`SynthVoice`** — wraps a Tone.js instrument (`MonoSynth` 808 for bass with portamento; `PolySynth`/`FMSynth` for melody). Used for **bass, melody** (need to play different notes across the grid).

A genre's kit maps each track → a voice spec. The sequencer calls `voice.trigger(time, { note })` on active steps; it does not know or care which implementation it is.

### 5.2 Notes for melody & bass

The grid stays a **binary 6×16 on/off toy** (no piano roll). Each genre defines a `noteRow` for melody and bass: a length-16 array mapping each step index → the note that step plays *if* it's on. So "on" cells play a musical, genre-appropriate riff/bassline; the user just decides which steps fire. Extending to 2/4 bars tiles the note row alongside the pattern.

### 5.3 Offline sample render script

`scripts/renderSounds.mjs` replaces `scripts/generateSounds.mjs`. It is a real (headless) DSP renderer, not decaying oscillators:

- Envelopes (ADSR), pitch envelopes (kick sweep 120→45 Hz), biquad filters (LP/HP/BP), noise sources, FM, and soft-clip saturation.
- Layered hits (e.g. kick = sub sine + click transient + a touch of noise).
- Per-genre tuning (trap kick ≠ house kick ≠ lofi kick).
- Renders **kick, snare, hi-hat, fx** × 5 genres × ~3 variants = ~60 short one-shots.
- Output: compressed audio (small; target the whole set well under a few MB). Committed to `public/sounds/<genre>/`.
- Deterministic and fully offline — no licensing, no network.

Implementation approach for the render (decided at build): either a pure-Node DSP implementation writing WAV directly, or a Tone.js `OfflineContext` run under a headless browser (Playwright) if that yields better quality per effort. Either way the output is static files.

### 5.4 Engine modules

- `src/audio/synthKit.ts` — builds a genre's voices (Sample + Synth) from its kit spec; wires per-track volume/mute/solo → master.
- `src/audio/sequencer.ts` — `Tone.Sequence` triggering voices (replaces the direct `players[track].start`).
- `src/audio/soundLoader.ts` — becomes "build kit + preload sample voices"; melody/bass synth voices need no network.
- `src/audio/exporter.ts` — `OfflineAudioContext` render of the loop → WAV download.
- `src/data/sounds.ts` — reframed catalog of **variants** per track/genre. A drum variant = a rendered file; a melody/bass variant = a synth preset (params). `getSounds`/`getSound` keep working; the base-path hack in `getSoundUrl` is removed.

The Sound Browser swaps variants uniformly regardless of whether the variant is a sample or a preset.

---

## 6. Screens & components

### Landing (`/`)
One page, two acts — an explainer that flows straight into the picker. No one is dropped cold into a grid.

**Act 1 — Hero / explainer (first view).** Confident wordmark and a one-line pitch ("Make a beat in your browser. No app, no account, no clue required."). A live, autoplaying-muted-until-tapped mini demo of the grid grooving (or a looping animated preview) so the concept is instantly legible. A tight "how it works" in three beats — *pick a genre → tap the squares → share it* — using icons, not paragraphs. A single primary CTA ("Pick your sound") that scrolls/reveals Act 2. Fast and on-brand; a hero, not a bloated marketing site.

**Act 2 — Genre picker (*the* moment).** Five large cards, each in its own skin: its color, its display font, its tagline, and its signature pattern shimmering as a mini animated equalizer/preview. Tapping a card → `initAudio()` (satisfies the iOS gesture requirement — the first tap must be a real user gesture) → `setGenre()` → transitions into `/studio` with the whole app morphing into that genre's skin.

Returning/deep-link visitors can skip to the picker; a `localStorage` flag can collapse the hero to a compact header on repeat visits so it never nags.

### Studio (`/studio`)
- **Header:** back, genre wordmark (skinned), and the real actions — Share, Export. (Save removed.)
- **Grid (hero):** 6 instrument rows (icon + color per instrument), 16 steps, beat markers every 4 steps. Cells are tactile: press feedback, active cells glow per skin, and a cell **pops/pulses the instant its step fires**. Playhead is a **sweeping light beam**, not a 2px outline. Horizontal scroll for 2/4-bar patterns.
- **Track controls:** mute / solo / volume per track; tap the instrument name → Sound Browser.
- **Transport (bottom, hardware-feeling):** prominent play/stop, BPM, 1/2/4-bar length, swing.
- **First-run hint:** a light, dismissible "tap the squares" affordance (localStorage flag).

### Sound Browser
Bottom drawer (custom, not MUI). Lists variants for the tapped track filtered by genre + category. Tap to preview in context; confirm to swap; dismiss to revert.

### Share
Encodes the current beat into a URL (`/beat?d=<encoded>` or path param). Offers copy link + native `navigator.share`. On Vercel the link renders a dynamic OG image.

### Export
WAV via `OfflineAudioContext`. Progress indicator; auto-download `{genre}-{bpm}bpm.wav`.

### `/beat` (public playback)
Decodes the beat from the URL, loads that genre's skin, plays it, and shows a bold "Make your own" CTA back into the app. Dynamic OG image for the link preview.

---

## 7. Module structure changes

**Add:** `src/audio/synthKit.ts`, `src/audio/exporter.ts`, `scripts/renderSounds.mjs`, per-genre skin data, OG image route, first-run hint, custom drawer/controls to replace MUI ones.

**Rework:** `src/data/genres.ts` (identities + skins + kits + note rows), `src/data/sounds.ts` (variants), `sequencer.ts`, `soundLoader.ts`, all components (de-MUI + reskin), `next.config.js`, deploy workflow, theme layer (CSS-var skin system).

**Remove:** MUI usage everywhere, `@mui/*` + `nanoid` deps, Supabase-shaped stubs, static-export/basePath config, old `generateSounds.mjs`.

---

## 8. Build order (milestones)

1. **Foundation:** strip MUI + Supabase remnants; Emotion + CSS-var skin system; Vercel config; fonts.
2. **Audio engine:** `Voice` interface, `SynthVoice` (bass/melody), `SampleVoice`; sequencer on voices; playable loop with placeholder hits.
3. **Offline render script:** `renderSounds.mjs`; generate the real one-shots; wire `SampleVoice` to them.
4. **Genre data:** identities, skins, kits, note rows, templates for all 5.
5. **Studio UI:** grid hero (tactile cells, pulse, beam playhead), transport, track controls, sound browser — all skinned + animated.
6. **Landing:** hero/explainer (pitch, live mini-demo, three-beat "how it works", CTA) flowing into skinned genre cards with live previews + morph transition into the studio.
7. **Share + Export + `/beat`:** URL encode/decode, WAV export, OG image.
8. **Polish:** per-genre motion character, textures, first-run hint, mobile pass at 375px, accessibility (touch targets, contrast, reduced-motion).

---

## 9. Testing & verification

- **Typecheck + build** green on Vercel target.
- **Audio smoke:** each genre loads and plays a distinct, genre-appropriate loop; sound swap works; mute/solo/volume/swing/BPM work; iOS gesture unlock works.
- **Grid:** toggling, playhead sync, 1/2/4-bar tiling.
- **Share round-trip:** encode → open link → identical beat plays.
- **Export:** rendered WAV matches the audible loop.
- **Responsive:** usable at 375px; genres visually distinct; `prefers-reduced-motion` respected.
- Verify in a real browser (the `/run` + `/verify` skills), not just tests.

---

## 10. Risks & open questions

- **Offline render quality vs effort:** pure-Node DSP is fully self-contained but hand-written; a headless-browser Tone.js render may sound better per unit effort. Decide at milestone 3; both ship static files, so it's swappable without touching the app.
- **Synth-voice polyphony/timing** on low-end mobile — keep voice counts modest; reuse voices.
- **URL length** for 4-bar beats — use a compact encoding (bit-packed grid + short field codes), not raw JSON.
- **Deploy:** already connected to Vercel via Git integration — no CLI auth needed; pushes deploy automatically. CI on Node 24 guards typecheck/test/build independently.
- **Next 15 / React 19 upgrade** may surface breakages (Emotion SSR, `next/font`, framer-motion). The upgrade task runs codemods and fixes them before feature work.
