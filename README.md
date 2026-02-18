# NI Play

A browser-based, mobile-first step sequencer beat maker. Pick a genre, make a beat on a grid, and save or share it.

> Built with Next.js 14, MUI v5, Tone.js, Zustand, and Supabase.

---

## What It Is

NI Play is a creative toy, not a DAW. The goal is to make beat-making fun and immediate — no music theory knowledge required. The core loop is:

1. Land on the app and pick a genre (Trap, Lo-fi, House, Drill, or Hyperpop).
2. A pre-built beat starts playing on a 6-track × 16-step grid.
3. Toggle cells, swap sounds, adjust BPM, and extend the pattern.
4. Save your beat (requires a free account), share a public link, or export to MP3/WAV.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | MUI v5 (Material UI) |
| Audio | Tone.js |
| State | Zustand |
| Backend / Auth / DB | Supabase (Postgres + Auth + Storage) |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/             # Next.js App Router pages and API routes
├── audio/           # Tone.js engine, sequencer, sound loader, exporter
├── components/      # UI components (Grid, Transport, TrackRow, Auth, etc.)
├── data/            # Genre definitions, sound catalog, beat templates
├── lib/             # Supabase clients, middleware, utilities
├── stores/          # Zustand stores (grid, transport, project, auth)
├── theme/           # MUI theme and per-genre color palettes
└── types/           # Shared TypeScript types
supabase/
└── migrations/      # Database schema SQL
public/
└── sounds/          # Placeholder audio files (generated locally)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/your-org/ni-play.git
cd ni-play
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL, anon key, and service role key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set up the database

Run the migration against your Supabase project:

```bash
# Via Supabase dashboard SQL editor, or using the CLI:
supabase db push
```

The migration file is at `supabase/migrations/001_initial_schema.sql`.

### 4. Generate placeholder sounds

The app needs audio files in `public/sounds/` to function locally. Generate synthetic placeholder WAVs with:

```bash
node scripts/generateSounds.mjs
```

This creates one file per category per genre variant (90 files total) using simple oscillators.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Genres

| Genre | BPM Range | Vibe |
|---|---|---|
| Trap | 130–160 | Dark, hard-hitting |
| Lo-fi | 70–90 | Warm, dusty, chill |
| House | 120–128 | Driving, groovy |
| Drill | 140–145 | Aggressive, sliding bass |
| Hyperpop | 140–170 | Chaotic, detuned, glitchy |

---

## Features

- **6-track step sequencer** — kick, snare, hi-hat, melody, bass, FX
- **Per-genre color themes** applied dynamically via CSS custom properties
- **Sound browser** — swap sounds per track with live preview
- **Transport controls** — play/stop, BPM slider, 1/2/4-bar pattern length
- **Mute / solo / volume** per track
- **Swing** control (0–100)
- **Save & load** beats via Supabase (auth-gated)
- **Share** — public URL at `/beat/[shareId]` with playback and "Make your own" CTA
- **Export** — client-side MP3 (via lamejs) or WAV render using `OfflineAudioContext`
- **Milestone tracker** — progress toward your first 3 saved beats
- **Onboarding tooltips** — 3-step first-run guide stored in `localStorage`
- **Mobile-first** — designed for 375px, fully functional on iOS Safari and Chrome

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_APP_URL` | Base URL of the app (used for share links) |

---

## Audio Notes

- `Tone.start()` is called on the first user gesture (genre tap) to satisfy browser autoplay policies, including iOS Safari.
- The app listens for `visibilitychange` events to resume the `AudioContext` when the user returns to the tab.
- Sound files are served from `/public/sounds/` in dev and from a CDN (Cloudflare R2) in production.
- The `getSoundUrl()` helper selects `.m4a` on iOS Safari and `.ogg` everywhere else.

---

## License

MIT — see [LICENSE](LICENSE).
