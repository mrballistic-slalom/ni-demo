# NI Play Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild NI Play as a zero-backend, per-genre-skinned browser beat toy with genuinely genre-distinct audio (offline-rendered drum one-shots + Tone.js synth voices), a landing explainer that flows into the genre picker, and Vercel deployment.

**Architecture:** Next.js 16 App Router (Turbopack), deployed on Vercel (served at root). Zustand for state. Audio is a `Voice` abstraction: `SampleVoice` (Tone.Player over offline-rendered one-shots) for kick/snare/hihat/fx, `SynthVoice` (Tone.js instruments) for bass/melody. A `Tone.Sequence` triggers voices. Styling is Emotion `styled` + a CSS-custom-property skin system (one full skin per genre), animated with Motion (the `motion` package, imported from `motion/react` — the current name for Framer Motion). Share encodes the beat into the URL; export renders WAV via `OfflineAudioContext`.

**Tech Stack:** Next.js 16 (Turbopack), React 19, TypeScript 6.0.3, Emotion (`@emotion/styled`, `@emotion/react`), Motion (`motion` / `motion/react`), lucide-react, Zustand, Tone.js, `next/font`, Vercel (Git integration).

## Global Constraints

- **Framework:** Next.js 16 App Router only; `src/app/`, no `pages/`. `'use client'` only where audio/state/interaction requires it.
- **No MUI, no Tailwind.** All styling via Emotion `styled()` / `css` + CSS custom properties. Icons via `lucide-react`.
- **Dark, mobile-first.** Design at 375px first; scale up. WCAG touch targets ≥ 44px.
- **Genre colors/skins via CSS custom properties** set on a wrapper element; components read `var(--genre-*)`. Never hardcode a genre color in a component.
- **Grid patterns are always exactly `patternLength * 16` steps** (1 bar = 16 steps).
- **User-facing copy uses smart (curly) punctuation** — `’` for apostrophes, `“ ”` for quotes, en/em dashes. Never straight quotes in rendered text or in string values that render in UI. Tests asserting on copy compare the curly form. Do NOT change code identifiers, import paths, or string delimiters.
- **iOS audio:** `Tone.start()` must be called inside a real user gesture (the first genre tap). Resume `AudioContext` on `visibilitychange`.
- **Tone.js** for all audio; no raw Web Audio API except the `OfflineAudioContext` render in the exporter.
- **Commit after every task.** Conventional commit messages. End commit messages with the `Co-Authored-By` trailer.
- **Test quality gate (user-mandated):** **zero failing tests, always**, and **≥ 80% Vitest coverage** enforced via hard thresholds in `vitest.config.ts` and run in CI (`test:coverage`). Coverage is scoped (via `include`) to the logic-bearing code where unit tests are meaningful — `src/lib/**` (beat codec, grid math), `src/audio/voice.ts` (voice-spec routing), `src/audio/exporter.ts` (`audioBufferToWav`), `src/data/genres.ts`, `src/data/sounds.ts`, `src/theme/skins.ts`, and `scripts/renderSounds.mjs` DSP helpers. Genuinely-untestable runtime/visual code is EXCLUDED and browser-verified instead: `src/audio/sequencer.ts` + `src/audio/synthKit.ts` + `src/audio/soundLoader.ts` + `src/audio/engine.ts` + `src/audio/tone.ts` (Tone.js runtime glue), `src/components/**` (except any with extractable pure logic, which SHOULD be tested), `src/app/**` page shells, `src/stores/**`, `src/theme/GenreSkinProvider.tsx`, `src/theme/fonts.ts`, `src/types/**`, all config, `src/test/**`. Every task that adds an `include`-scoped module MUST add tests keeping it ≥ 80%. `passWithNoTests: true` so an empty suite never reds CI. **CI enforcement ramp:** CI runs plain `npm test` until the end of Milestone 4 (when the entire included set is tested), then switches to `npm run test:coverage` and must stay ≥ 80% thereafter; before then the per-milestone gate reports coverage without hard-failing on the global number.
- **Toolchain:** Node **≥ 24** (`.nvmrc` + `package.json` `engines`). Newest-usable stack — **Next.js 16 (Turbopack) + React 19 + TypeScript 6.0.3**, plus latest Tone/Zustand/Emotion/Motion (`motion`)/lucide-react. **TypeScript pinned to 6.0.3** (the newest JS-based line; `typescript-eslint` peer is `<6.1.0`) and **ESLint at 9.x**. TS **7.x is rejected**: its native compiler ships no programmatic API, breaking Next's type step and `@typescript-eslint` (evidence: `docs/superpowers/spike-next16-ts7.md`). Next 16 removed `next lint`; linting is flat-config ESLint (`eslint.config.mjs`). `tsconfig` `lib` includes `es2025`.
- **Deploy target:** Vercel, at root (no `basePath`), **already connected via Git integration** — pushes deploy automatically; no CLI auth. CI (GitHub Actions, Node 24) runs typecheck/test/build on push/PR.

---

## File Structure

**Created:**
- `.nvmrc` (Node 24), `.github/workflows/ci.yml` (Node 24 CI).
- `src/theme/skins.ts` — `GenreSkin` type + the 5 skin token sets; `skinToCssVars(skin)`.
- `src/theme/GenreSkinProvider.tsx` — client component that sets `--genre-*` CSS vars on a wrapper from the active genre.
- `src/theme/fonts.ts` — `next/font` display faces + Inter, mapped per genre.
- `src/audio/voice.ts` — `Voice` interface, `SampleVoice`, `SynthVoice`, `createVoice(spec)`.
- `src/audio/exporter.ts` — `renderToWav()` via `OfflineAudioContext`.
- `src/lib/beatCodec.ts` — `encodeBeat()` / `decodeBeat()` (compact URL encoding).
- `src/lib/grid.ts` — pure grid helpers (`tileRow`, `resizePattern`, `validatePattern`).
- `scripts/renderSounds.mjs` — offline DSP render of drum/fx one-shots.
- `src/components/Landing/*` — `Hero.tsx`, `HowItWorks.tsx`, `GenrePicker.tsx` (replaces `GenreSelect`).
- `src/components/Grid/Playhead.tsx` — sweeping-beam playhead overlay.
- `src/components/common/*` — `BottomSheet.tsx` (drawer), `Knob.tsx`/`Fader.tsx`, `IconButton.tsx` (Emotion, replacing MUI primitives).
- `src/components/Studio/*` — reskinned `StudioHeader.tsx`.
- `app/beat/opengraph-image.tsx` — dynamic OG image via `next/og`.
- `vercel.json` (if needed) and updated deploy workflow.
- Unit tests: `src/lib/__tests__/beatCodec.test.ts`, `src/lib/__tests__/grid.test.ts`, `src/audio/__tests__/voice.test.ts` (spec-shape tests), `scripts/__tests__/renderSounds.test.mjs` (WAV header + non-silence).

**Modified:**
- `src/types/index.ts` — add voice/kit/skin/note-row types; drop file-only `SoundDefinition` assumptions.
- `src/data/genres.ts` — identities, copy, kits, note rows, templates, skin refs.
- `src/data/sounds.ts` — variants catalog (sample files OR synth presets); drop base-path hack.
- `src/audio/sequencer.ts` — trigger `Voice`s (note-aware) instead of raw players.
- `src/audio/soundLoader.ts` — build kit + preload sample voices.
- `src/audio/engine.ts` — unchanged logic, verify still correct.
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/studio/page.tsx`, `src/app/beat/page.tsx` — de-MUI, reskin, landing.
- `src/components/**` — de-MUI + reskin all.
- `next.config.js` — remove export/basePath/assetPrefix/unoptimized.
- `package.json` — deps swap; add `vitest` + `test` script.

**Removed:**
- `@mui/material`, `@mui/icons-material`, `nanoid` from deps and all imports.
- `scripts/generateSounds.mjs` (replaced).
- `src/app/dashboard/page.tsx` and any auth/save stubs.
- Base-path env plumbing.
- `.github/workflows/deploy.yml` (old GitHub Pages deploy).

---

## Testing setup note

The pure-logic modules (`beatCodec`, `grid`, WAV encoding, voice-spec construction) are unit-tested with **Vitest**. Audio *feel* and visual skins are verified in a real browser via the `superpowers:verification-before-completion` + `run` skills (play each genre, listen, screenshot at 375px), because "sounds like trap" and "looks like its skin" are not unit-testable. UI-building tasks explicitly invoke `ui-ux-pro-max` and `impeccable` to drive the visual implementation.

---

## Milestone 0 — Toolchain (Node 24, latest deps, CI)

### Task T0.1: Pin Node 24 + upgrade all libraries to latest

**Files:**
- Create: `.nvmrc`
- Modify: `package.json` (`engines`, all deps)

**Interfaces:**
- Produces: `node -v` ≥ 24 enforced; Next 15 + React 19 + latest deps installed; `npm run build` green.

- [ ] **Step 1: Confirm local Node.** Run: `node -v` → expect `v24.x` (nvm has it). If not: `nvm install 24 && nvm use 24`.

- [ ] **Step 2: Create `.nvmrc`** with a single line: `24`.

- [ ] **Step 3: Add `engines` to `package.json`:**

```json
"engines": { "node": ">=24" }
```

- [ ] **Step 4: Upgrade deps to latest.** Run (do NOT hardcode versions — take whatever `@latest` resolves, then record them in the commit):

```bash
npm install next@latest react@latest react-dom@latest
npm install tone@latest zustand@latest motion@latest @emotion/react@latest @emotion/styled@latest
npm install -D typescript@latest eslint@latest eslint-config-next@latest @types/node@latest @types/react@latest @types/react-dom@latest
```

- [ ] **Step 5: Apply framework codemods / fixes.** For Next 15 + React 19, run `npx @next/codemod@latest upgrade latest` if offered, and fix breakages: `params`/`searchParams` are now async in some contexts; verify `next/font` and Emotion SSR still work. Address any type errors from React 19 (`@types/react` 19).

- [ ] **Step 6: Verify.** Run: `npm run build && npm run typecheck` → both green. If a dep is incompatible at latest, pin to the newest working version and note it in the commit body.

- [ ] **Step 7: Commit.**

```bash
git add .nvmrc package.json package-lock.json
git commit -m "chore: pin Node 24 and upgrade all libraries to latest (Next 15 / React 19)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task T0.2: CI workflow on Node 24

**Files:**
- Create: `.github/workflows/ci.yml`
- Delete: `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: CI runs typecheck + test + build on Node 24 for push/PR. (Note: `test` script is added in Task 1; until then CI's test step is allowed to no-op — order T0.2 after Task 1, or make the test step `npm test --if-present`.)

- [ ] **Step 1: Create `.github/workflows/ci.yml`:**

```yaml
name: CI
on:
  push:
    branches: ['**']
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v6
        with:
          node-version: '24'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm test --if-present
      - run: npm run generate-sounds
      - run: npm run build
```

- [ ] **Step 2: Delete old deploy workflow.** Run: `git rm .github/workflows/deploy.yml`.

- [ ] **Step 3: Verify YAML locally.** Run: `cat .github/workflows/ci.yml` and sanity-check indentation; optionally `npx --yes @action-validator/cli .github/workflows/ci.yml` if available.

- [ ] **Step 4: Commit.**

```bash
git add .github/workflows/ci.yml
git rm .github/workflows/deploy.yml
git commit -m "ci: add Node 24 CI (typecheck/test/build), drop Pages deploy

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Milestone 1 — Foundation (de-MUI, Emotion, Vitest)

### Task 1: Add Vitest, swap dependencies

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `src/test/setup.ts`

**Interfaces:**
- Produces: `npm test` runs Vitest; `lucide-react` available; MUI/nanoid gone from manifest.

- [ ] **Step 1: Add new deps + swap framer-motion→motion (ADD-ONLY; do NOT remove MUI or nanoid yet).** Take whatever `@latest` resolves:

```bash
npm uninstall framer-motion
npm install lucide-react@latest motion@latest
npm install -D vitest@latest @vitest/ui@latest jsdom@latest @testing-library/react@latest @testing-library/jest-dom@latest
```

Then add scripts to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.

**CRITICAL sequencing note:** Do NOT `npm uninstall @mui/material @mui/icons-material` or `nanoid` in this task. Components and `ShareModal` still import them; removing the deps now breaks `npm run build` for the entire middle of the project and fails CI on every milestone branch. `framer-motion` is safe to remove because nothing imports it yet (it was an unused dependency). MUI is uninstalled in **Task 22** (after all components are de-MUI'd); `nanoid` is uninstalled in **Task 20** (after the share-id logic is replaced). This task must leave `npm run build` green with MUI still installed.

- [ ] **Step 2: Create `vitest.config.ts`:**

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

- [ ] **Step 3: Create `src/test/setup.ts`:**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Install and verify.**

Run: `npm install && npm test && npm run build`
Expected: install succeeds; Vitest runs and reports "No test files found" (exit 0) or passes; **`npm run build` stays green with MUI still installed** (confirms the add-only swap didn't break anything). If `npm run build` fails because something imported `framer-motion`, restore it — but per the plan it is unused, so this should not happen.

- [ ] **Step 5: Commit.**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts
git commit -m "chore: swap MUI/nanoid for lucide-react, add Vitest

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task 2: Adopt Next 16 (Turbopack) + Vercel-ready config

A spike (`docs/superpowers/spike-next16-ts7.md`) proved Next 16 is viable: the custom `webpack()` Tone alias is legacy cruft (Tone is loaded via dynamic `import('tone')` in `src/audio/tone.ts`, and Turbopack bundles Tone 15's ESM natively), so dropping it unblocks Next 16. TypeScript stays at 5.9.3 (TS 7's native compiler ships no programmatic API, breaking Next's type step and `@typescript-eslint` — evidence in the spike report). Next 16 also **removed the `next lint` command**, so the lint script must migrate to flat-config ESLint.

**Files:**
- Modify: `next.config.js`, `tsconfig.json`, `package.json` (next dep + lint script)
- Create: `eslint.config.mjs`
- Delete: `.eslintrc.json`
- Modify: `src/data/sounds.ts` (remove base-path prefix in `getSoundUrl`)

**Interfaces:**
- Produces: app builds on Next 16 + Turbopack at root (no basePath); `getSoundUrl(sound)` returns the unmodified path; `npm run lint` works via flat config.

- [ ] **Step 1: Upgrade to Next 16.** Run: `npm install next@latest`. Confirm `npx next --version` reports 16.x. (No `.npmrc legacy-peer-deps` needed — that was only for the rejected TS 7 path.)

- [ ] **Step 2: Replace `next.config.js`** — drop the webpack alias, `output: 'export'`, `basePath`, `assetPrefix`, `images.unoptimized`, and the `NEXT_PUBLIC_BASE_PATH` env plumbing (Turbopack needs none of it):

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
```

- [ ] **Step 3: In `src/data/sounds.ts`, delete the `basePath` const and the house-remap/basePath logic in `getSoundUrl`.** (Full rewrite of `sounds.ts` happens in Task 9; here just remove the base-path prefix so nothing depends on `NEXT_PUBLIC_BASE_PATH`.) Temporary body: `return sound.file_ogg;`

- [ ] **Step 4: Update `tsconfig.json` `compilerOptions`** — set `"lib": ["dom","dom.iterable","es2025"]` (was `esnext`), keep `"module": "esnext"`, `"moduleResolution": "bundler"`, `paths`, `plugins`, `jsx`, `strict`, `noEmit`. Leave `include`/`exclude` as Next set them.

- [ ] **Step 5: Migrate lint to flat config** (Next 16 removed `next lint`). Create `eslint.config.mjs`:

```js
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  { ignores: ['.next/**', 'node_modules/**', 'out/**', 'coverage/**'] },
];
```

Install the flat-config bridge if not present: `npm install -D @eslint/eslintrc`. Delete `.eslintrc.json` (`git rm .eslintrc.json`). Change the `package.json` `lint` script from `next lint` to `eslint .`. If `next/typescript` isn't resolvable, fall back to `compat.extends('next/core-web-vitals')` only and note it.

- [ ] **Step 6: Verify everything green.**

Run: `npm run build && npm run typecheck && npm run lint && npm test`
Expected: `next build` succeeds on Next 16 + Turbopack (watch for any Tone resolution error — there should be none; if one appears, report it, do NOT re-add the webpack alias without asking); typecheck clean; lint clean; tests pass (empty ok). Also `grep -rn "NEXT_PUBLIC_BASE_PATH" src next.config.js` → empty.

- [ ] **Step 7: Commit.**

```bash
git add next.config.js tsconfig.json package.json package-lock.json eslint.config.mjs src/data/sounds.ts
git rm .eslintrc.json
git commit -m "build: adopt Next 16 + Turbopack, drop webpack Tone alias and basePath, migrate ESLint flat config

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task 3: Skin type + CSS-var system

**Files:**
- Create: `src/theme/skins.ts`
- Test: `src/theme/__tests__/skins.test.ts`

**Interfaces:**
- Produces:
  - `type GenreSkin` (see code).
  - `SKINS: Record<Genre, GenreSkin>`.
  - `skinToCssVars(skin: GenreSkin): Record<string, string>` returning `{'--genre-primary': '#..', ...}`.

- [ ] **Step 1: Write failing test `src/theme/__tests__/skins.test.ts`:**

```ts
import { describe, it, expect } from 'vitest';
import { SKINS, skinToCssVars } from '@/theme/skins';
import { GENRE_LIST } from '@/data/genres';

describe('skins', () => {
  it('defines a skin for every genre', () => {
    for (const g of GENRE_LIST) expect(SKINS[g]).toBeDefined();
  });
  it('emits genre CSS custom properties', () => {
    const vars = skinToCssVars(SKINS.trap);
    expect(vars['--genre-primary']).toMatch(/^#|rgb|hsl/);
    expect(vars['--genre-cell-on']).toBeTruthy();
    expect(vars['--genre-cell-off']).toBeTruthy();
    expect(vars['--genre-bg']).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run, verify fails.** Run: `npm test -- skins` → FAIL (module not found).

- [ ] **Step 3: Implement `src/theme/skins.ts`:**

```ts
import { Genre } from '@/types';

export interface GenreSkin {
  palette: {
    bg: string;            // page background (may be a gradient)
    surface: string;       // panels/cards
    primary: string;       // main accent
    accent: string;        // secondary highlight
    cellOn: string;
    cellOff: string;
    glow: string;          // rgba used for bloom/shadows
    text: string;
    textDim: string;
  };
  texture: 'grain' | 'scanlines' | 'paper' | 'chromatic' | 'none';
  geometry: { cellRadius: string; cellGap: string };
  glow: { intensity: number; blur: string };
  motion: { easing: string; hitPop: number };
}

export const SKINS: Record<Genre, GenreSkin> = {
  trap: {
    palette: { bg: 'radial-gradient(circle at 50% 0%, #1A0A0A, #0A0505)', surface: '#160C0C', primary: '#FF1F3D', accent: '#FF6A7A', cellOn: '#FF1F3D', cellOff: '#241315', glow: 'rgba(255,31,61,0.55)', text: '#FFFFFF', textDim: 'rgba(255,255,255,0.55)' },
    texture: 'grain', geometry: { cellRadius: '4px', cellGap: '4px' }, glow: { intensity: 1, blur: '14px' }, motion: { easing: 'cubic-bezier(.2,.9,.2,1)', hitPop: 1.18 },
  },
  lofi: {
    palette: { bg: 'linear-gradient(160deg, #241C10, #14100A)', surface: '#20180E', primary: '#F0B45A', accent: '#FFD98A', cellOn: '#F0B45A', cellOff: '#2A2213', glow: 'rgba(240,180,90,0.4)', text: '#F6ECD9', textDim: 'rgba(246,236,217,0.55)' },
    texture: 'paper', geometry: { cellRadius: '9px', cellGap: '5px' }, glow: { intensity: 0.5, blur: '10px' }, motion: { easing: 'cubic-bezier(.4,0,.2,1)', hitPop: 1.08 },
  },
  house: {
    palette: { bg: 'radial-gradient(circle at 50% 10%, #14103A, #06060F)', surface: '#120F26', primary: '#8A5BFF', accent: '#C4A6FF', cellOn: '#8A5BFF', cellOff: '#1A1633', glow: 'rgba(138,91,255,0.55)', text: '#FFFFFF', textDim: 'rgba(255,255,255,0.6)' },
    texture: 'none', geometry: { cellRadius: '6px', cellGap: '4px' }, glow: { intensity: 0.9, blur: '16px' }, motion: { easing: 'cubic-bezier(.3,.8,.3,1)', hitPop: 1.12 },
  },
  drill: {
    palette: { bg: 'linear-gradient(180deg, #0A140C, #050A06)', surface: '#0D160F', primary: '#1DE37A', accent: '#7DF7B6', cellOn: '#1DE37A', cellOff: '#12241A', glow: 'rgba(29,227,122,0.45)', text: '#EAFBF0', textDim: 'rgba(234,251,240,0.5)' },
    texture: 'scanlines', geometry: { cellRadius: '2px', cellGap: '3px' }, glow: { intensity: 0.7, blur: '10px' }, motion: { easing: 'cubic-bezier(.5,0,.9,.3)', hitPop: 1.1 },
  },
  hyperpop: {
    palette: { bg: 'linear-gradient(140deg, #2A0E24, #0E0714)', surface: '#22102A', primary: '#FF5FBE', accent: '#67E8F9', cellOn: '#FF5FBE', cellOff: '#2C1730', glow: 'rgba(255,95,190,0.6)', text: '#FFFFFF', textDim: 'rgba(255,255,255,0.6)' },
    texture: 'chromatic', geometry: { cellRadius: '12px', cellGap: '5px' }, glow: { intensity: 1.2, blur: '18px' }, motion: { easing: 'cubic-bezier(.2,1.3,.4,1)', hitPop: 1.28 },
  },
};

export function skinToCssVars(skin: GenreSkin): Record<string, string> {
  const p = skin.palette;
  return {
    '--genre-bg': p.bg,
    '--genre-surface': p.surface,
    '--genre-primary': p.primary,
    '--genre-accent': p.accent,
    '--genre-cell-on': p.cellOn,
    '--genre-cell-off': p.cellOff,
    '--genre-glow': p.glow,
    '--genre-text': p.text,
    '--genre-text-dim': p.textDim,
    '--genre-cell-radius': skin.geometry.cellRadius,
    '--genre-cell-gap': skin.geometry.cellGap,
    '--genre-glow-blur': skin.glow.blur,
  };
}
```

- [ ] **Step 4: Run, verify passes.** Run: `npm test -- skins` → PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/theme/skins.ts src/theme/__tests__/skins.test.ts
git commit -m "feat: add per-genre skin tokens and CSS-var mapping

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task 4: Fonts + GenreSkinProvider + de-MUI layout

**Files:**
- Create: `src/theme/fonts.ts`, `src/theme/GenreSkinProvider.tsx`, `src/theme/EmotionRegistry.tsx`
- Modify: `src/app/layout.tsx`, `src/components/Layout/AppShell.tsx`
- Delete: `src/components/Layout/ThemeRegistry.tsx` (MUI), `src/theme/theme.ts` (MUI `createTheme`)

**Interfaces:**
- Consumes: `SKINS`, `skinToCssVars` (Task 3); `useGridStore` genre.
- Produces: `<EmotionRegistry>` (Emotion SSR cache for the App Router); `<GenreSkinProvider>` wraps app, sets CSS vars on a `<div data-genre>` from the active genre; `DISPLAY_FONT_CLASS: Record<Genre, string>` and `bodyFontClass`.

**CRITICAL — Emotion + App Router SSR:** we're dropping MUI but keeping Emotion `styled()`. Emotion needs an App-Router-compatible registry or SSR won't flush styles (FOUC + hydration warnings). Create `src/theme/EmotionRegistry.tsx` (`'use client'`) using the standard pattern: a `createCache({ key: 'ni' })`, a `useServerInsertedHTML` that flushes `cache.inserted` as a `<style data-emotion>` tag, wrapping children in `<CacheProvider value={cache}>`. Wrap the app in `<EmotionRegistry>` inside `layout.tsx`. Verify no "style insertion" hydration warning and no unstyled flash.

- [ ] **Step 1: Create `src/theme/fonts.ts`** using `next/font/google` — Inter for body, and one display face per genre (e.g. Trap → `Archivo` condensed heavy; Lo-Fi → `Fraunces`; House → `Space_Grotesk`; Drill → `Oswald`; Hyperpop → `Baloo_2`). Export `bodyFontClass` and `DISPLAY_FONT_CLASS: Record<Genre,string>`. (Exact faces may be refined with the design skills; keep the export shape.)

- [ ] **Step 2: Create `src/theme/GenreSkinProvider.tsx`** (`'use client'`): reads `useGridStore(s=>s.genre)`, computes `skinToCssVars(SKINS[genre])`, renders `<div data-genre={genre} style={vars} className={DISPLAY_FONT_CLASS[genre]}>{children}</div>` with `transition` on color vars. Also apply `--genre-bg` to the wrapper background and min-height 100dvh.

- [ ] **Step 3: Create `src/theme/EmotionRegistry.tsx`** (`'use client'`) — the App Router Emotion SSR registry (see the CRITICAL note above): `createCache({ key: 'ni' })`, `useServerInsertedHTML` flushing inserted styles into a `<style data-emotion>` tag, children wrapped in `<CacheProvider>`.

- [ ] **Step 4: Rewrite `src/app/layout.tsx`** — remove the MUI `ThemeRegistry` import/usage, apply `bodyFontClass` to `<body>`, set `metadata` (title/description with curly copy), and wrap children in `<EmotionRegistry><GenreSkinProvider>…`. Delete `src/components/Layout/ThemeRegistry.tsx` and `src/theme/theme.ts` (both MUI). `AppShell` becomes a thin Emotion wrapper (no MUI).

- [ ] **Step 5: Verify build + SSR styling.**

Run: `npm run build && npm run typecheck && npm run lint && npm test` (all green). Then `npm run dev`, load `/`: (a) page renders, (b) **no React hydration warning** in the console about style insertion, (c) no unstyled flash (view-source / initial HTML contains a `<style data-emotion>` tag). Note: `grep -rn "@mui" src/` will STILL show hits in un-reskinned components (removed across Milestone 5) — that is expected; only `layout.tsx`, `AppShell.tsx`, and the deleted files must be MUI-free now.

- [ ] **Step 6: Commit.**

```bash
git add src/theme/fonts.ts src/theme/GenreSkinProvider.tsx src/theme/EmotionRegistry.tsx src/app/layout.tsx src/components/Layout src/theme/theme.ts
git rm src/components/Layout/ThemeRegistry.tsx src/theme/theme.ts
git commit -m "feat: Emotion SSR registry, genre skin provider + display fonts; drop MUI theme registry

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Milestone 2 — Audio engine (Voice abstraction)

### Task 5: Types for kits, voices, note rows

**Files:**
- Modify: `src/types/index.ts`

**Interfaces:**
- Produces: `VoiceSpec`, `SampleVoiceSpec`, `SynthVoiceSpec`, `GenreKit`, `NoteRow`, updated `GenreDefinition` (adds `kit`, `noteRows`, `skin` ref), `SoundVariant`.

- [ ] **Step 1: Add to `src/types/index.ts`:**

```ts
export type NoteRow = (string | null)[]; // length 16; note name (e.g. 'C2') or null

export interface SampleVoiceSpec {
  kind: 'sample';
  url: string;          // resolved via getSoundUrl
}
export interface SynthVoiceSpec {
  kind: 'synth';
  synth: 'mono808' | 'fm' | 'poly';
  options: Record<string, unknown>; // Tone synth options
  portamento?: number;
}
export type VoiceSpec = SampleVoiceSpec | SynthVoiceSpec;

export type GenreKit = Record<TrackCategory, VoiceSpec>;

export interface SoundVariant {
  id: string;
  name: string;
  category: TrackCategory;
  genre: Genre;
  spec: VoiceSpec;
}
```

Extend `GenreDefinition` with these fields as **OPTIONAL** (so the existing `genres.ts` keeps compiling until Task 10 populates them): `kit?: GenreKit;` `noteRows?: { melody: NoteRow; bass: NoteRow };` `tagline?: string;` `hook?: string;`. (Keep existing fields. Keep the existing `SoundDefinition` interface untouched — `sounds.ts` still uses it until Task 9; `SoundVariant` is additive.)

**Why optional:** making them required would break `genres.ts`'s typecheck across Milestones 2–4 (and fail CI on every branch) until Task 10 fills them in. Optional keeps every milestone green. Task 10 populates all five genres; consumers optional-guard the reads until then.

- [ ] **Step 2: Typecheck must stay GREEN.** Run: `npm run typecheck && npm run lint && npm test && npm run build` → ALL green (additive optional types break nothing). If genres.ts errors, a field was left required — fix it.

- [ ] **Step 3: Commit.**

```bash
git add src/types/index.ts
git commit -m "feat: add voice/kit/note-row types

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task 6: Voice interface + implementations

**Files:**
- Create: `src/audio/voice.ts`
- Test: `src/audio/__tests__/voice.test.ts`

**Interfaces:**
- Consumes: `VoiceSpec` (Task 5); Tone via `getTone()`.
- Produces:
  - `interface Voice { trigger(time: number, note?: string | null, velocity?: number): void; output: unknown; dispose(): void; readonly ready: boolean; }`
  - `createVoice(spec: VoiceSpec): Voice`
  - `SampleVoice`, `SynthVoice` classes.

- [ ] **Step 1: Failing test `src/audio/__tests__/voice.test.ts`** (tests spec routing without a real AudioContext by mocking `getTone`):

```ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/audio/tone', () => {
  const fake = () => ({ toDestination() { return this; }, connect() { return this; }, dispose() {}, start() {}, triggerAttackRelease() {}, loaded: true, volume: { value: 0 } });
  return { getTone: () => ({
    Player: function(){ return fake(); },
    MonoSynth: function(){ return fake(); },
    FMSynth: function(){ return fake(); },
    PolySynth: function(){ return fake(); },
    gainToDb: (x:number)=>x,
  }) };
});

import { createVoice } from '@/audio/voice';

describe('createVoice', () => {
  it('builds a sample voice', () => {
    const v = createVoice({ kind: 'sample', url: '/x.wav' });
    expect(typeof v.trigger).toBe('function');
    expect(() => v.trigger(0)).not.toThrow();
  });
  it('builds a synth voice and forwards a note', () => {
    const v = createVoice({ kind: 'synth', synth: 'mono808', options: {} });
    expect(() => v.trigger(0, 'C2')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run, verify fails.** Run: `npm test -- voice` → FAIL.

- [ ] **Step 3: Implement `src/audio/voice.ts`.** `SampleVoice` wraps `new Tone.Player(url)`, `trigger(time)` → `player.start(time)`; ignores note. `SynthVoice` builds the Tone synth by `spec.synth`, `trigger(time, note)` → `synth.triggerAttackRelease(note ?? defaultNote, '16n', time)`. Both expose `.output` (the Tone node, pre-connected) and `.dispose()`. `createVoice` switches on `spec.kind`.

- [ ] **Step 4: Run, verify passes.** Run: `npm test -- voice` → PASS.

- [ ] **Step 5: Commit.**

```bash
git add src/audio/voice.ts src/audio/__tests__/voice.test.ts
git commit -m "feat: Voice abstraction (SampleVoice + SynthVoice)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task 7: synthKit builder + per-track gain routing

**Files:**
- Create: `src/audio/synthKit.ts`
- Modify: `src/audio/soundLoader.ts`

**Scope note:** M2 builds the audio *engine* only. It must NOT depend on the `SoundVariant` catalog (that reframe is Task 9, M3) — so do not call `getSound().spec` here. `buildKit` takes a `GenreKit` argument; `loadAllSounds` reads the **optional** `GENRES[genre].kit` (undefined until Task 10, so a no-op guard for now). The catalog-derived `loadAllSounds`/`swapSound` wiring is added in Task 9 once `getSound` returns `SoundVariant`. Everything here must keep `npm run build && typecheck && lint && test` GREEN.

**Interfaces:**
- Consumes: `createVoice` (Task 6), `GenreKit`, `NoteRow` (Task 5); `getTone`.
- Produces:
  - `buildKit(kit: GenreKit): Promise<void>` — creates a `Voice` + `Tone.Gain` per track, wires voice→gain→destination, stores in module state, awaits `Tone.loaded()` for samples. Disposes any prior kit first.
  - `getVoice(track): Voice | undefined`, `getGain(track): Tone.Gain | undefined`, `setGain(track, value)`, `disposeKit()`.
  - `loadAllSounds(): Promise<void>` — reads `GENRES[useGridStore.getState().genre].kit`; if defined, `await buildKit(kit)`; if undefined (pre-Task-10), no-op. (Catalog-derived variant resolution + `swapSound` are added in Task 9.)

- [ ] **Step 1: Implement `src/audio/synthKit.ts`** per Interfaces. Per-track chain: `voice.output → gain → Tone.getDestination()`. `setGain(track, v)` sets `gain.gain.value = Tone.gainToDb`-style linear gain from the store volume.

- [ ] **Step 2: Rewrite `src/audio/soundLoader.ts`** so `loadAllSounds()` reads the optional `GENRES[genre].kit` and calls `buildKit` when present (no-op otherwise). Remove the old file-`Tone.Player` loading path. Do NOT reference the `SoundVariant` catalog or `getSound().spec` yet (Task 9). Leave a `// TODO(Task 9): swapSound + catalog-derived kit` marker.

- [ ] **Step 3: Verify green.** Run: `npm run typecheck && npm run lint && npm test && npm run build` → all green (the engine compiles with no catalog/genre-kit data yet; it simply builds nothing until Task 10 populates kits).

- [ ] **Step 4: Commit.**

```bash
git add src/audio/synthKit.ts src/audio/soundLoader.ts
git commit -m "feat: build genre kit of voices with per-track gain routing

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task 8: Sequencer triggers voices (note-aware)

**Files:**
- Modify: `src/audio/sequencer.ts`

**Interfaces:**
- Consumes: `getVoice`, `getGain` (Task 7); `useGridStore` (grid, volumes, mutes, solos, genre `noteRows`).
- Produces: `createSequence()`, `startPlayback()`, `stopPlayback()`, `updateBpm()`, `disposeSequence()` (same names as today).

- [ ] **Step 1: Rewrite the `Tone.Sequence` callback** so that for each active step it computes the note for melody/bass from the **optional** note row — `GENRES[genre].noteRows?.[track as 'melody'|'bass']?.[step % 16] ?? undefined` (null/undefined → no explicit note), calls `setGain(track, volumes[track])` (or reads gain directly), and calls `getVoice(track)?.trigger(time, note)`. Drums pass `note = undefined`. Keep mute/solo logic. Remove the old `players[track].start` path and `loadSound` import. Because `getVoice` returns `undefined` until a kit is built (Task 10), the callback safely no-ops on audio until then.

- [ ] **Step 2: Verify green.** Run: `npm run typecheck && npm run lint && npm test && npm run build` → all green.

- [ ] **Step 3: Manual smoke deferred** to Task 11 (needs genre kits + a browser). Note in commit.

- [ ] **Step 4: Commit.**

```bash
git add src/audio/sequencer.ts
git commit -m "feat: sequencer triggers note-aware voices

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Milestone 3 — Offline sample render

### Task 9: `renderSounds.mjs` DSP render + sounds catalog

**Files:**
- Create: `scripts/renderSounds.mjs`
- Test: `scripts/__tests__/renderSounds.test.mjs`
- Rewrite: `src/data/sounds.ts`
- Delete: `scripts/generateSounds.mjs`; regenerate `public/sounds/**`
- Modify: `package.json` script `generate-sounds` → `node scripts/renderSounds.mjs`

**Interfaces:**
- Produces: WAV one-shots at `public/sounds/<genre>/<genre>_<cat>_<nn>.wav` for cat ∈ {kick,snare,hihat,fx}; `SOUND_CATALOG: SoundVariant[]` (samples for drums/fx, synth presets for melody/bass); `getSounds`, `getSound`, `getSoundUrl(variant)` unchanged signatures.

- [ ] **Step 1: Failing test `scripts/__tests__/renderSounds.test.mjs`** — imports the pure DSP helpers (export `synthKick`, `synthSnare`, `synthHat`, `encodeWAV` from the script) and asserts: `encodeWAV` produces a buffer starting with `RIFF`/`WAVE`; a rendered kick Float32Array is non-silent (max abs > 0.1) and has a decaying tail (later RMS < earlier RMS).

```js
import { describe, it, expect } from 'vitest';
import { encodeWAV, synthKick } from '../renderSounds.mjs';

describe('renderSounds DSP', () => {
  it('encodes a WAV header', () => {
    const buf = encodeWAV(new Float32Array(1000));
    expect(buf.slice(0,4).toString('ascii')).toBe('RIFF');
    expect(buf.slice(8,12).toString('ascii')).toBe('WAVE');
  });
  it('kick is non-silent and decays', () => {
    const s = synthKick({ genre: 'trap' });
    const max = Math.max(...Array.from(s, Math.abs));
    expect(max).toBeGreaterThan(0.1);
    const head = s.slice(0, s.length/4), tail = s.slice(-s.length/4);
    const rms = a => Math.sqrt(a.reduce((n,x)=>n+x*x,0)/a.length);
    expect(rms(tail)).toBeLessThan(rms(head));
  });
});
```

- [ ] **Step 2: Run, verify fails.** Run: `npm test -- renderSounds` → FAIL.

- [ ] **Step 3: Implement `scripts/renderSounds.mjs`** as a real DSP renderer (ES module, exports helpers + runs on `node`). Include: ADSR envelope, pitch-envelope, one-pole/biquad lowpass & highpass, white noise, soft-clip `tanh` saturation. Build per-category synths with per-genre params:
  - `synthKick`: sine with pitch env (e.g. trap 130→48 Hz over 60ms) + short click transient + slight saturation.
  - `synthSnare`: bandpassed noise + a tuned body tone; genre varies brightness/decay.
  - `synthHat`: highpassed noise, very short; genre varies decay/tone.
  - `synthFx`: filtered noise sweep / riser.
  - `encodeWAV(float32)` → 16-bit PCM mono WAV Buffer (reuse current encoder).
  Loop genres × {kick,snare,hihat,fx} × 3 variants (vary a seedable param per variant — no `Math.random` seeding needed but keep deterministic-ish), write files. Print count.

- [ ] **Step 4: Run test + generate.** Run: `npm test -- renderSounds` → PASS. Then `npm run generate-sounds` → writes ~60 files. Verify: `ls public/sounds/trap` shows kick/snare/hihat/fx WAVs.

- [ ] **Step 5: Rewrite `src/data/sounds.ts`** — `SOUND_CATALOG` lists, per genre: 3 variants each for kick/snare/hihat/fx as `{ kind:'sample', url:'/sounds/<genre>/<file>.wav' }`, and 2–3 melody + bass variants as `{ kind:'synth', synth:'poly'|'fm'|'mono808', options:{...} }`. `getSoundUrl(variant)` returns `variant.spec.kind==='sample' ? variant.spec.url : ''`. Keep `getSounds(genre,category)` / `getSound(id)`.

- [ ] **Step 6: Delete old script.** `git rm scripts/generateSounds.mjs`. Remove stale house-only WAVs not referenced by the new catalog: regenerate cleans dirs (script should `rm -rf` each genre dir before writing, or write over).

- [ ] **Step 7: Wire the catalog into `soundLoader.ts`** (the piece deferred from Task 7, now that `getSound` returns `SoundVariant`): implement `swapSound(track, soundId)` — `const spec = getSound(soundId)?.spec; if (!spec) return; createVoice(spec)` → replace that track's voice in the synthKit module + `useGridStore.getState().setSound(track, soundId)`. Optionally have `loadAllSounds()` derive the kit from `useGridStore.getState().sounds` + `getSound(id).spec` (falling back to `GENRES[genre].kit`). Export `swapSound`.

- [ ] **Step 8: Keep the whole tree GREEN.** The `getSound`/`getSounds`/`getSoundUrl` return type changed (`SoundDefinition` → `SoundVariant`), so any current consumer that reads `.file_ogg`/`.file_aac` (e.g. `SoundBrowser.tsx`, still un-reskinned) will not compile. Update those call sites to the new shape (use `getSoundUrl(variant)` / `variant.spec`) — minimal edits to keep them compiling; full reskin is Milestone 5. Run `npm run typecheck && npm run lint && npm test && npm run build` → ALL green. (`genres.ts` still compiles because its new fields are optional from Task 5.)

- [ ] **Step 9: Commit.**

```bash
git add scripts/renderSounds.mjs scripts/__tests__/renderSounds.test.mjs src/data/sounds.ts src/audio/soundLoader.ts src/components package.json public/sounds
git rm scripts/generateSounds.mjs
git commit -m "feat: offline DSP sample renderer + variant catalog; wire soundLoader

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Milestone 4 — Genre data

### Task 10: Genre identities, kits, note rows, templates

**Files:**
- Rewrite: `src/data/genres.ts`
- Test: `src/data/__tests__/genres.test.ts`

**Interfaces:**
- Consumes: types (Task 5), `SKINS` reference by genre id.
- Produces: `GENRES: Record<Genre, GenreDefinition>` with `tagline`, `hook`, `kit`, `noteRows`, `template`, colors; `GENRE_LIST`.

- [ ] **Step 1: Failing test `src/data/__tests__/genres.test.ts`:**

```ts
import { describe, it, expect } from 'vitest';
import { GENRES, GENRE_LIST } from '@/data/genres';
import { TRACK_ORDER } from '@/types';
import { getSound } from '@/data/sounds';

describe('genres', () => {
  it('every template row is exactly 16 steps', () => {
    for (const g of GENRE_LIST) for (const t of TRACK_ORDER)
      expect(GENRES[g].template.grid[t]).toHaveLength(16);
  });
  it('note rows are length 16 for melody and bass', () => {
    for (const g of GENRE_LIST) {
      expect(GENRES[g].noteRows.melody).toHaveLength(16);
      expect(GENRES[g].noteRows.bass).toHaveLength(16);
    }
  });
  it('every default sound id resolves in the catalog', () => {
    for (const g of GENRE_LIST) for (const t of TRACK_ORDER)
      expect(getSound(GENRES[g].template.sounds[t])).toBeDefined();
  });
  it('has curly-punctuation taglines', () => {
    for (const g of GENRE_LIST) expect(GENRES[g].tagline).not.toMatch(/["']/);
  });
});
```

- [ ] **Step 2: Run, verify fails.** Run: `npm test -- genres` → FAIL.

- [ ] **Step 3: Rewrite `src/data/genres.ts`** using the copy table and kit direction from the spec. For each genre set: `tagline`/`hook` (curly punctuation), `bpmRange`/`defaultBpm`, colors (may mirror skin primary), `template.grid` (16-step patterns that show the genre off), `template.sounds` (default variant ids that exist in the catalog), `template.volumes`, `kit` (map each track to its default variant's `spec`), and `noteRows` (genre-appropriate melody + bass notes, length 16, `null` where silent). Keep the `p()` helper.

- [ ] **Step 4: Tighten types now that every genre defines them.** In `src/types/index.ts`, change `GenreDefinition`'s `kit`, `noteRows`, `tagline`, `hook` from optional (`?`) back to **required** (all 5 genres now provide them). The M2 consumers that used optional-chaining (`noteRows?.`, `GENRES[genre].kit` guards) still compile — leave them; the guards are harmless. This makes the `genres.test` access `GENRES[g].noteRows.melody` valid without `!`.

- [ ] **Step 5: Run, verify passes.** Run: `npm test -- genres` → PASS. Then `npm run typecheck && npm run lint && npm test && npm run build` → all green across the project. Coverage: `genres.ts` and `sounds.ts` are in the include set — confirm both ≥ 80% via `npm run test:coverage` (the genres test + a sounds test exercise them; add a small `sounds.test.ts` if `sounds.ts` is under 80%).

- [ ] **Step 6: Commit.**

```bash
git add src/data/genres.ts src/data/__tests__/genres.test.ts src/types/index.ts src/data/__tests__/sounds.test.ts
git commit -m "feat: rebuild genres with identities, kits, note rows; require kit/noteRows

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

### Task 11: End-to-end audio smoke (browser)

**Files:** none (verification task)

- [ ] **Step 1: Wire `loadAllSounds()` on genre load.** Confirm `GenreSelect`/studio calls `initAudio()` then `loadAllSounds()` after `setGenre`. If not wired, add the call in the studio page mount (`useEffect`).

- [ ] **Step 2: Run dev + verify with the `run` skill.** Invoke `superpowers:verification-before-completion` and the `run` skill. For each genre: load `/studio`, press play, confirm (a) audio plays, (b) it sounds genre-distinct, (c) toggling cells changes the beat, (d) swapping a sound works, (e) mute/solo/volume/BPM/swing work, (f) no console errors. Record observations.

- [ ] **Step 3: Fix any issues found, then commit** any fixes with message `fix: audio smoke corrections`.

---

## Milestone 5 — Studio UI (reskin + tactile grid)

> UI tasks: invoke `ui-ux-pro-max` and `impeccable` to drive visual implementation. Deliverables below define structure + behavior; the skills define the finish. Verify each in a browser at 375px with a screenshot.

### Task 12: Emotion primitives (BottomSheet, IconButton, Fader)

**Files:** Create `src/components/common/BottomSheet.tsx`, `IconButton.tsx`, `Fader.tsx`.

- [ ] **Step 1:** Build accessible, skin-aware replacements for the MUI primitives currently used (Dialog/Drawer/IconButton/Slider). `BottomSheet`: fixed-bottom sheet with backdrop, drag/swipe-to-dismiss (Motion, `motion/react`), focus trap, `role="dialog"`. `IconButton`: 44px hit area, `lucide-react` icon. `Fader`: accessible range input styled per skin.
- [ ] **Step 2:** Verify render in a scratch story or the studio. Screenshot.
- [ ] **Step 3:** Commit `feat: Emotion UI primitives to replace MUI`.

### Task 13: Reskin StepGrid + GridCell + sweeping playhead

**Files:** Modify `src/components/Grid/StepGrid.tsx`, `GridCell.tsx`; create `src/components/Grid/Playhead.tsx`.

- [ ] **Step 1:** Rewrite in Emotion. Cells read `var(--genre-cell-on/off)`, `--genre-cell-radius/gap`, `--genre-glow`. Active cells bloom; a cell **pops** (`scale` to `skin.motion.hitPop`) when `currentStep === step` and it's active (Motion, `motion/react`). Instrument rows get a `lucide-react` icon + label. Beat markers every 4 steps.
- [ ] **Step 2:** Add `Playhead` overlay: an absolutely-positioned light beam that animates across columns bound to `currentStep`, blurred per `--genre-glow-blur`.
- [ ] **Step 3:** Keep `React.memo` on `GridCell`; ensure only the passing cell re-renders (pass `isPlayhead` minimally).
- [ ] **Step 4:** Verify at 375px + desktop for all 5 skins. Screenshot each. Confirm 44px targets.
- [ ] **Step 5:** Commit `feat: tactile skinned step grid with beam playhead`.

### Task 14: Reskin TransportBar + TrackControls + StudioHeader

**Files:** Modify `src/components/Transport/TransportBar.tsx`, `src/components/TrackRow/TrackControls.tsx`; create `src/components/Studio/StudioHeader.tsx`; modify `src/app/studio/page.tsx`.

- [ ] **Step 1:** Transport: hardware-feeling bottom bar — prominent play/stop, BPM readout+control, 1/2/4-bar chips, swing. Emotion + skin vars.
- [ ] **Step 2:** TrackControls: mute/solo/volume (Fader) + tappable instrument name → opens Sound Browser.
- [ ] **Step 3:** StudioHeader: back, skinned genre wordmark (display font), Share + Export actions. Remove Save button and its stub.
- [ ] **Step 4:** Update `studio/page.tsx` to use the new components; remove MUI imports; ensure `loadAllSounds()` on mount.
- [ ] **Step 5:** Verify + screenshot all skins at 375px. Commit `feat: reskin transport, track controls, studio header`.

### Task 15: Reskin SoundBrowser

**Files:** Modify `src/components/SoundBrowser/SoundBrowser.tsx`.

- [ ] **Step 1:** Use `BottomSheet`. List variants for the tapped track (samples + synth presets) via `getSounds`. Tap previews in context (trigger the voice once); confirm swaps via `swapSound`; dismiss reverts.
- [ ] **Step 2:** Verify preview + swap + revert in browser. Commit `feat: reskin sound browser`.

---

## Milestone 6 — Landing (explainer → picker)

### Task 16: Hero + HowItWorks

**Files:** Create `src/components/Landing/Hero.tsx`, `HowItWorks.tsx`; modify `src/app/page.tsx`.

- [ ] **Step 1:** Hero: wordmark, curly-punctuation pitch, a looping animated mini-grid preview (Motion, `motion/react`, no audio until gesture), primary CTA "Pick your sound" that scrolls to the picker. HowItWorks: three icon beats — pick a genre → tap the squares → share it.
- [ ] **Step 2:** `page.tsx` composes Hero → HowItWorks → GenrePicker in one scroll. `localStorage` flag `ni_seen_hero` collapses Hero to a compact header on repeat visits.
- [ ] **Step 3:** Invoke `ui-ux-pro-max` + `impeccable` for finish. Verify at 375px; screenshot. Commit `feat: landing hero + how-it-works explainer`.

### Task 17: GenrePicker with live skinned cards + morph

**Files:** Create `src/components/Landing/GenrePicker.tsx`; delete `src/components/GenreSelect/GenreSelect.tsx`.

- [ ] **Step 1:** Five cards, each rendered in its own skin (own color, display font, tagline, and a shimmering signature-pattern mini-equalizer). Tap → `initAudio()` (must be inside the click handler for iOS) → `setGenre()` → navigate to `/studio` with a Motion (`motion/react`) morph.
- [ ] **Step 2:** Verify each card visually distinct; tap flows into studio in-genre; audio unlocks on iOS (test in mobile Safari or responsive + note limitation). Screenshot. Commit `feat: skinned genre picker with morph into studio`.

---

## Milestone 7 — Share, Export, /beat, OG

### Task 18: Beat URL codec

**Files:** Create `src/lib/beatCodec.ts`; test `src/lib/__tests__/beatCodec.test.ts`.

**Interfaces:**
- Produces: `encodeBeat(state): string` (URL-safe), `decodeBeat(s: string): DecodedBeat | null`. Encodes genre, bpm, patternLength, swing, grid (bit-packed), sounds. Compact — not raw JSON.

- [ ] **Step 1: Failing round-trip test:**

```ts
import { describe, it, expect } from 'vitest';
import { encodeBeat, decodeBeat } from '@/lib/beatCodec';
import { GENRES } from '@/data/genres';

const sample = {
  genre: 'trap' as const, bpm: 140, patternLength: 1 as const, swing: 20,
  grid: GENRES.trap.template.grid, sounds: GENRES.trap.template.sounds,
};

describe('beatCodec', () => {
  it('round-trips', () => {
    const s = encodeBeat(sample);
    expect(typeof s).toBe('string');
    const d = decodeBeat(s);
    expect(d?.genre).toBe('trap');
    expect(d?.bpm).toBe(140);
    expect(d?.swing).toBe(20);
    expect(d?.grid.kick).toEqual(sample.grid.kick);
  });
  it('returns null on garbage', () => {
    expect(decodeBeat('%%%not-valid%%%')).toBeNull();
  });
});
```

- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement with base64url of a compact byte layout (version, genre index, bpm, patternLength, swing, packed grid bits, sound-variant indices). **Step 4:** Run → PASS. **Step 5:** Commit `feat: compact beat URL codec`.

### Task 19: WAV exporter

**Files:** Create `src/audio/exporter.ts`; test `src/audio/__tests__/exporter.test.ts` (WAV-header test on a stub buffer).

**Interfaces:**
- Produces: `renderToWav(opts): Promise<Blob>` using `OfflineAudioContext`, and `audioBufferToWav(buffer): ArrayBuffer`.

- [ ] **Step 1:** Failing test for `audioBufferToWav` (RIFF/WAVE header, correct length) using a small fake AudioBuffer-shaped object. **Step 2:** FAIL. **Step 3:** Implement `audioBufferToWav`; implement `renderToWav` rendering the loop with the same kit into an `OfflineAudioContext` (reuse voice specs; render `patternLength` bars at current bpm/swing). **Step 4:** unit PASS; browser-verify actual download in Task 20. **Step 5:** Commit `feat: WAV exporter via OfflineAudioContext`.

### Task 20: Reskin Share + Export modals; wire codec/exporter

**Files:** Modify `src/components/Share/ShareModal.tsx`, `src/components/Export/ExportModal.tsx`.

- [ ] **Step 1:** ShareModal: build URL `${origin}/beat?d=${encodeBeat(state)}`; Copy Link + `navigator.share`. Remove nanoid/Supabase share-id logic. **Step 2:** ExportModal: WAV only; progress; auto-download `{genre}-{bpm}bpm.wav`. **Step 3:** Reskin both via `BottomSheet`/Emotion. **Step 4:** Browser-verify: share link opens a working `/beat`; export downloads a playable WAV. **Step 5:** Commit `feat: wire share URL + WAV export, reskin modals`.

### Task 21: `/beat` playback page + OG image

**Files:** Modify `src/app/beat/page.tsx`; create `src/app/beat/opengraph-image.tsx`.

- [ ] **Step 1:** `/beat` reads `?d=`, `decodeBeat`, `loadProject`-equivalent hydrate into the grid store, applies the genre skin, autoplays-on-tap, shows a bold "Make your own" CTA to `/`. Handle `null` decode with a friendly fallback. **Step 2:** `opengraph-image.tsx` via `next/og`: render genre color + wordmark + a mini pattern from decoded data. **Step 3:** Browser-verify playback matches the shared beat; check OG renders (`/beat/opengraph-image?d=...`). **Step 4:** Commit `feat: shareable beat page + dynamic OG image`.

---

## Milestone 8 — Polish, cleanup, deploy

### Task 22: Remove dead code + final MUI sweep

**Files:** Delete `src/app/dashboard/page.tsx`, any `useProjectStore`/auth remnants tied to Supabase, `useAuthStore` if present.

- [ ] **Step 1:** `grep -rn "@mui\|nanoid\|supabase" src/` → must be empty. Remove any hits. **Step 2:** Delete dashboard + dead stores; fix imports. **Step 3:** Now that no source imports remain, uninstall the deferred deps: `npm uninstall @mui/material @mui/icons-material nanoid` (these were intentionally kept installed since Task 1 so the build stayed green mid-project; nanoid's usage was removed in Task 20, MUI's across Milestone 5). **Step 4:** `npm run typecheck && npm test && npm run build` all green; re-run `grep -rn "@mui\|nanoid" package.json` → empty. **Step 5:** Commit `chore: remove dead backend/MUI code and deps`.

### Task 23: Motion character, textures, first-run hint, a11y

**Files:** `src/components/common/TextureOverlay.tsx`; touch grid/landing.

- [ ] **Step 1:** `TextureOverlay` renders per-skin `texture` (grain/scanlines/paper/chromatic) as a fixed overlay gated by `skin.texture`. **Step 2:** Per-genre motion easing/hitPop applied from skin. **Step 3:** First-run studio hint ("Tap the squares") with localStorage flag. **Step 4:** `prefers-reduced-motion`: disable non-essential animation. Contrast + focus-visible pass. **Step 5:** Verify all 5 skins at 375px; screenshot. Commit `feat: textures, motion character, first-run hint, a11y`.

### Task 24: Docs + Vercel deploy

**Files:** Rewrite `README.md`; mark `prd.md` superseded; add deploy notes.

- [ ] **Step 1:** README: new stack (no Supabase/MUI), Node 24, synth+sample audio, `npm run generate-sounds`, Vercel-via-Git-integration deploy, CI. Add a superseded banner atop `prd.md` pointing to the spec. **Step 2:** Push the branch — Vercel is already connected via Git integration, so this triggers a **preview deploy** automatically; open the preview URL and confirm it loads and audio works across genres. Production deploys on merge to the default branch. (No `vercel login`/CLI needed.) **Step 3:** Commit `docs: rewrite README, mark PRD superseded`.

---

## Self-Review

**Spec coverage:** toolchain/Node 24/latest deps + CI (T0.1–T0.2), stack swap (T1–4), Vercel (T2, T24), skins (T3–4, T13–17, T23), hybrid audio (T5–11), offline render (T9), genre identities+copy (T10), grid hero (T13), landing explainer+picker (T16–17), share/export/beat/OG (T18–21), honest trim of dead code (T22). All spec sections map to tasks.

**Placeholder scan:** UI tasks intentionally defer *visual finish* to the ui-ux-pro-max/impeccable skills (a spec decision, §Testing note), but every task states concrete files, behavior, and browser verification — no "add error handling"/"write tests for the above" hand-waves. Logic tasks carry full test + impl code.

**Type consistency:** `Voice.trigger(time, note?, velocity?)` used consistently (T6, T8); `VoiceSpec`/`SoundVariant`/`GenreKit`/`NoteRow` defined in T5 and consumed as-is; `getSound`/`getSounds`/`getSoundUrl` signatures stable across T2/T9/T15; `encodeBeat`/`decodeBeat` names consistent T18/T20/T21; `buildKit`/`getVoice`/`getGain` consistent T7/T8.
