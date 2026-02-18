# NI Play — Beat Maker

## Project Overview
Browser-based, mobile-first step sequencer beat maker. Users pick a genre, make beats on a 6×16 grid, and save/share them. Goal is email capture and habit formation (3 beats).

## Stack
- **Framework:** Next.js 14 (App Router)
- **UI:** MUI v5 (Material UI) — NO Tailwind. Use `sx` prop and `styled()` for all styling
- **Audio:** Tone.js — all audio via Tone.js, no raw Web Audio API
- **State:** Zustand — all client state, no React Context for app state
- **Backend:** Supabase (Auth + Postgres + Storage)
- **Deploy:** Vercel

## Key Conventions
- **Dark mode only** — no light mode toggle
- **Mobile-first** — design for 375px first, scale up
- **App Router only** — `src/app/` directory, no `pages/`
- **Genre colors via CSS custom properties** — set on `<html>` via `var(--genre-primary)` etc.
- **Grid patterns** — always exactly `patternLength * 16` steps (1 bar = 16 steps)
- **Sound files** — `/public/sounds/` for dev, CDN for prod. `getSoundUrl()` abstracts this
- **`'use client'`** only where needed (audio, state, interaction)

## Project Structure
```
src/
├── app/           # Next.js App Router pages
├── components/    # React components organized by feature
├── stores/        # Zustand stores (useGridStore, useTransportStore, useProjectStore, useAuthStore)
├── audio/         # Tone.js engine, sequencer, sound loader
├── data/          # Genre definitions, sound catalog, templates
├── lib/           # Supabase clients, utilities
├── theme/         # MUI theme, genre color themes
└── types/         # TypeScript types and interfaces
```

## Scripts
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run generate-sounds` — Generate placeholder WAV files in `public/sounds/`

## Audio Notes
- Must call `Tone.start()` on first user gesture (genre tap) — iOS Safari requirement
- Use `Tone.Players` for each track, `Tone.Sequence` for the step loop
- Resume AudioContext on visibility change for iOS tab switching
