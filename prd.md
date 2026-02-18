# NI Play — Claude Code Build Prompt

## MISSION

Build "NI Play" — a browser-based, mobile-first step sequencer beat maker. Users land, pick a genre, make a beat on a grid, and save/share it. The entire goal is email capture and habit formation (3 beats). This is a creative toy, NOT a DAW.

**Stack:** Next.js 14 (App Router), MUI v5 (Joy UI preferred for the playful aesthetic, fallback to Material UI), Tone.js, Zustand, Supabase (Auth + Postgres + Storage), deployed to Vercel.

---

## PROJECT STRUCTURE

```
ni-play/
├── public/
│   └── sounds/                    # Local dev sounds (placeholder .ogg files)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout — dark theme, MUI provider, Supabase provider
│   │   ├── page.tsx               # Landing → Genre selection
│   │   ├── studio/
│   │   │   └── page.tsx           # Main beat-making grid studio
│   │   ├── dashboard/
│   │   │   └── page.tsx           # "Your Beats" list (auth-gated)
│   │   ├── beat/
│   │   │   └── [shareId]/
│   │   │       └── page.tsx       # Public shared beat playback page
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── route.ts       # Supabase OAuth callback
│   │   └── api/
│   │       ├── projects/
│   │       │   └── route.ts       # GET (list) + POST (create)
│   │       ├── projects/
│   │       │   └── [id]/
│   │       │       └── route.ts   # GET + PUT + DELETE single project
│   │       └── share/
│   │           └── [shareId]/
│   │               └── route.ts   # GET shared beat data (public)
│   ├── components/
│   │   ├── Grid/
│   │   │   ├── StepGrid.tsx       # The main 6-row × 16-col step sequencer grid
│   │   │   ├── GridCell.tsx        # Single toggleable cell
│   │   │   └── PlayheadOverlay.tsx # Animated playhead sweeping across columns
│   │   ├── Transport/
│   │   │   ├── TransportBar.tsx    # Play/Stop, tempo slider, pattern length toggle
│   │   │   └── TempoSlider.tsx     # Custom MUI slider for BPM
│   │   ├── TrackRow/
│   │   │   ├── TrackRow.tsx        # Single row: label + mute/solo + volume + cells
│   │   │   └── TrackControls.tsx   # Mute, solo, volume knob per track
│   │   ├── SoundBrowser/
│   │   │   ├── SoundBrowser.tsx    # Slide-up drawer for browsing/swapping sounds
│   │   │   └── SoundCard.tsx       # Individual sound preview card
│   │   ├── GenreSelect/
│   │   │   └── GenreSelect.tsx     # Visual genre tile picker (landing page)
│   │   ├── Auth/
│   │   │   ├── AuthModal.tsx       # Sign up/in modal (triggered by save/share/export gates)
│   │   │   └── AuthProvider.tsx    # Supabase session context
│   │   ├── Dashboard/
│   │   │   ├── BeatList.tsx        # List of saved beats with cards
│   │   │   └── MilestoneTracker.tsx # "1 of 3 beats" progress
│   │   ├── Share/
│   │   │   ├── ShareModal.tsx      # Share options (copy link, social targets)
│   │   │   └── BeatPlayer.tsx      # Playback-only view for shared beats
│   │   ├── Export/
│   │   │   └── ExportModal.tsx     # Format selection + client-side render + download
│   │   ├── Onboarding/
│   │   │   └── TooltipOverlay.tsx  # 3-step first-run tooltip flow
│   │   └── Layout/
│   │       ├── AppShell.tsx        # Main app chrome (header, nav)
│   │       └── MobileNav.tsx       # Bottom nav for mobile
│   ├── stores/
│   │   ├── useGridStore.ts         # Zustand: grid state, sounds, volumes, tempo, swing
│   │   ├── useTransportStore.ts    # Zustand: playback state (playing, currentStep)
│   │   ├── useProjectStore.ts      # Zustand: current project metadata, save/load
│   │   └── useAuthStore.ts         # Zustand: user session, auth state
│   ├── audio/
│   │   ├── engine.ts               # Tone.js initialization, AudioContext management
│   │   ├── sequencer.ts            # Tone.Sequence setup, grid-to-audio bridge
│   │   ├── soundLoader.ts          # Load/cache AudioBuffers, progressive loading
│   │   └── exporter.ts             # OfflineAudioContext render → WAV/MP3 export
│   ├── data/
│   │   ├── genres.ts               # Genre definitions, templates, color themes
│   │   ├── sounds.ts               # Sound catalog metadata (name, category, file path)
│   │   └── templates.ts            # Pre-built grid patterns per genre
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   ├── server.ts           # Server Supabase client (for API routes)
│   │   │   └── middleware.ts        # Supabase auth middleware
│   │   └── utils.ts                # Helpers (generateShareId, formatBPM, etc.)
│   ├── theme/
│   │   ├── theme.ts                # MUI theme: dark mode, genre color overrides
│   │   └── genreThemes.ts          # Per-genre color palettes
│   └── types/
│       └── index.ts                # All TypeScript types/interfaces
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
├── next.config.js
├── package.json
├── tsconfig.json
└── .env.local.example
```

---

## DATA SCHEMAS

### TypeScript Types — `src/types/index.ts`

```typescript
// ============================================================
// CORE DOMAIN TYPES
// ============================================================

export type Genre = 'trap' | 'lofi' | 'house' | 'drill' | 'hyperpop';

export type TrackCategory = 'kick' | 'snare' | 'hihat' | 'melody' | 'bass' | 'fx';

export const TRACK_ORDER: TrackCategory[] = ['kick', 'snare', 'hihat', 'melody', 'bass', 'fx'];

export const STEPS_PER_BAR = 16;

// Grid cell: 0 = off, 1 = on. Future: 0-1 float for velocity.
export type GridRow = number[];

export type GridState = Record<TrackCategory, GridRow>;

export type SoundSelections = Record<TrackCategory, string>; // sound ID per track

export type TrackVolumes = Record<TrackCategory, number>; // 0.0 - 1.0

export type TrackMutes = Record<TrackCategory, boolean>;

export type TrackSolos = Record<TrackCategory, boolean>;

// ============================================================
// PROJECT / BEAT
// ============================================================

export interface Project {
  id: string;                    // UUID
  user_id: string;               // UUID, FK to auth.users
  title: string;                 // "Untitled Beat 1"
  genre: Genre;
  bpm: number;                   // 60-200
  pattern_length: 1 | 2 | 4;    // in bars (1 bar = 16 steps)
  swing: number;                 // 0-100
  grid: GridState;               // the full step pattern
  sounds: SoundSelections;       // which sound is on each track
  volumes: TrackVolumes;
  mutes: TrackMutes;
  share_id: string | null;       // short alphanumeric for share URLs
  modifications_count: number;   // track how much user has changed from template
  created_at: string;            // ISO timestamp
  updated_at: string;            // ISO timestamp
}

// What we send to the API to create/update
export type ProjectCreatePayload = Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export type ProjectUpdatePayload = Partial<ProjectCreatePayload>;

// ============================================================
// SOUND CATALOG
// ============================================================

export interface SoundDefinition {
  id: string;                    // e.g. "trap_kick_deep_01"
  name: string;                  // e.g. "Deep Kick"
  category: TrackCategory;
  genre: Genre;
  file_ogg: string;              // relative path or CDN URL
  file_aac: string;              // fallback for iOS Safari
}

// ============================================================
// GENRE DEFINITION
// ============================================================

export interface GenreDefinition {
  id: Genre;
  label: string;                 // "Trap", "Lo-fi", etc.
  description: string;           // "Dark, hard-hitting"
  bpmRange: [number, number];    // [130, 160]
  defaultBpm: number;
  colorPrimary: string;          // hex — used for active cells, accents
  colorSecondary: string;        // hex — used for backgrounds, gradients
  colorAccent: string;           // hex — highlights
  template: GenreTemplate;
}

export interface GenreTemplate {
  grid: GridState;               // pre-built pattern
  sounds: SoundSelections;       // default sound for each track
  volumes: TrackVolumes;         // default volume levels
}

// ============================================================
// USER / AUTH
// ============================================================

export interface UserProfile {
  id: string;                    // UUID from Supabase auth
  email: string;
  display_name: string | null;
  beats_count: number;           // for milestone tracking
  created_at: string;
}

// ============================================================
// TRANSPORT / PLAYBACK STATE (client-only, not persisted)
// ============================================================

export interface TransportState {
  isPlaying: boolean;
  currentStep: number;           // 0 to (patternLength * 16 - 1)
  isAudioContextStarted: boolean;
}
```

### Supabase Database Schema — `supabase/migrations/001_initial_schema.sql`

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  beats_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- PROJECTS (beats)
-- ============================================================
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text default 'Untitled Beat' not null,
  genre text not null check (genre in ('trap', 'lofi', 'house', 'drill', 'hyperpop')),
  bpm integer default 120 not null check (bpm between 60 and 200),
  pattern_length integer default 1 not null check (pattern_length in (1, 2, 4)),
  swing integer default 0 not null check (swing between 0 and 100),
  grid jsonb not null,           -- GridState: {"kick": [1,0,0,...], ...}
  sounds jsonb not null,         -- SoundSelections: {"kick": "trap_kick_01", ...}
  volumes jsonb not null,        -- TrackVolumes: {"kick": 0.8, ...}
  mutes jsonb default '{"kick":false,"snare":false,"hihat":false,"melody":false,"bass":false,"fx":false}'::jsonb not null,
  share_id text unique,          -- short alphanumeric for public share links
  modifications_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for fast user project listing
create index idx_projects_user_id on public.projects(user_id);
create index idx_projects_share_id on public.projects(share_id) where share_id is not null;

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on public.projects
  for each row execute procedure public.update_updated_at();

-- Auto-increment beats_count on profile when new project saved
create or replace function public.increment_beats_count()
returns trigger as $$
begin
  update public.profiles
  set beats_count = beats_count + 1, updated_at = now()
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_project_created
  after insert on public.projects
  for each row execute procedure public.increment_beats_count();

-- Decrement on delete
create or replace function public.decrement_beats_count()
returns trigger as $$
begin
  update public.profiles
  set beats_count = greatest(0, beats_count - 1), updated_at = now()
  where id = old.user_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_project_deleted
  after delete on public.projects
  for each row execute procedure public.decrement_beats_count();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;

-- Profiles: users can read/update own profile
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Projects: users CRUD own projects
create policy "Users can view own projects"
  on public.projects for select using (auth.uid() = user_id);

create policy "Users can create own projects"
  on public.projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete using (auth.uid() = user_id);

-- Shared beats: anyone can read a project by share_id (via API route, not direct RLS)
-- We handle this in the API route by querying without auth context
create policy "Anyone can view shared projects"
  on public.projects for select using (share_id is not null);
```

---

## GENRE DATA — `src/data/genres.ts`

Provide this COMPLETE so the build agent doesn't have to guess:

```typescript
import { Genre, GenreDefinition, TrackCategory } from '@/types';

// Helper to create an empty row of N steps
const emptyRow = (steps: number): number[] => new Array(steps).fill(0);

// Helper to create a row from a pattern string: "x...x...x...x..." where x=1, .=0
const p = (pattern: string): number[] => pattern.split('').map(c => c === 'x' ? 1 : 0);

export const GENRES: Record<Genre, GenreDefinition> = {
  trap: {
    id: 'trap',
    label: 'Trap',
    description: 'Dark, hard-hitting',
    bpmRange: [130, 160],
    defaultBpm: 140,
    colorPrimary: '#FF1744',    // aggressive red
    colorSecondary: '#1A0A0A',  // near-black red tint
    colorAccent: '#FF5252',
    template: {
      grid: {
        kick:   p('x.......x.......'),
        snare:  p('....x.......x...'),
        hihat:  p('x.x.x.x.x.x.x.x.'),  // will be trimmed to 16
        melody: p('x.....x...x.....'),
        bass:   p('x.........x.....'),
        fx:     p('...............x'),
      },
      sounds: {
        kick: 'trap_kick_deep_01',
        snare: 'trap_snare_crack_01',
        hihat: 'trap_hihat_closed_01',
        melody: 'trap_melody_dark_pad_01',
        bass: 'trap_bass_808_01',
        fx: 'trap_fx_riser_01',
      },
      volumes: { kick: 0.85, snare: 0.75, hihat: 0.5, melody: 0.6, bass: 0.9, fx: 0.4 },
    },
  },

  lofi: {
    id: 'lofi',
    label: 'Lo-fi',
    description: 'Warm, dusty, chill',
    bpmRange: [70, 90],
    defaultBpm: 80,
    colorPrimary: '#FFB74D',    // warm amber
    colorSecondary: '#1A150A',
    colorAccent: '#FFD54F',
    template: {
      grid: {
        kick:   p('x.....x.x.......'),  // trimmed to 16
        snare:  p('....x.......x...'),
        hihat:  p('..x...x...x...x.'),
        melody: p('x..x..x..x..x..x'),  // trimmed
        bass:   p('x.......x.......'),
        fx:     p('x...............'),
      },
      sounds: {
        kick: 'lofi_kick_dusty_01',
        snare: 'lofi_snare_vinyl_01',
        hihat: 'lofi_hihat_soft_01',
        melody: 'lofi_melody_mellow_keys_01',
        bass: 'lofi_bass_warm_01',
        fx: 'lofi_fx_vinyl_crackle_01',
      },
      volumes: { kick: 0.7, snare: 0.6, hihat: 0.4, melody: 0.7, bass: 0.75, fx: 0.3 },
    },
  },

  house: {
    id: 'house',
    label: 'House',
    description: 'Driving, groovy',
    bpmRange: [120, 128],
    defaultBpm: 124,
    colorPrimary: '#7C4DFF',    // vibrant purple
    colorSecondary: '#0A0A1A',
    colorAccent: '#B388FF',
    template: {
      grid: {
        kick:   p('x...x...x...x...'),
        snare:  p('....x.......x...'),
        hihat:  p('.x.x.x.x.x.x.x.'),
        melody: p('x.......x.......'),
        bass:   p('x..x..x..x......'),  // trimmed
        fx:     p('........x.......'),
      },
      sounds: {
        kick: 'house_kick_four_floor_01',
        snare: 'house_snare_clap_01',
        hihat: 'house_hihat_open_01',
        melody: 'house_melody_chord_stab_01',
        bass: 'house_bass_deep_01',
        fx: 'house_fx_shaker_01',
      },
      volumes: { kick: 0.85, snare: 0.7, hihat: 0.55, melody: 0.65, bass: 0.8, fx: 0.35 },
    },
  },

  drill: {
    id: 'drill',
    label: 'Drill',
    description: 'Aggressive, sliding bass',
    bpmRange: [140, 145],
    defaultBpm: 142,
    colorPrimary: '#00E676',    // toxic green
    colorSecondary: '#0A1A0A',
    colorAccent: '#69F0AE',
    template: {
      grid: {
        kick:   p('x.....x.....x...'),
        snare:  p('....x.......x...'),
        hihat:  p('x.xxx.xxx.xxx.xx'),
        melody: p('x...........x...'),
        bass:   p('x.....x.........'),
        fx:     p('................'),
      },
      sounds: {
        kick: 'drill_kick_punchy_01',
        snare: 'drill_snare_rim_01',
        hihat: 'drill_hihat_roll_01',
        melody: 'drill_melody_dark_01',
        bass: 'drill_bass_slide_01',
        fx: 'drill_fx_ambient_01',
      },
      volumes: { kick: 0.8, snare: 0.75, hihat: 0.55, melody: 0.5, bass: 0.9, fx: 0.3 },
    },
  },

  hyperpop: {
    id: 'hyperpop',
    label: 'Hyperpop',
    description: 'Chaotic, detuned, glitchy',
    bpmRange: [140, 170],
    defaultBpm: 155,
    colorPrimary: '#FF4081',    // hot pink
    colorSecondary: '#1A0A14',
    colorAccent: '#FF80AB',
    template: {
      grid: {
        kick:   p('x..x..x..x..x..x'),  // trimmed
        snare:  p('....x..x....x..x'),
        hihat:  p('xxx.xxx.xxx.xxx.'),
        melody: p('x.x...x.x...x...'),
        bass:   p('x...x...x...x...'),
        fx:     p('..x...x...x...x.'),
      },
      sounds: {
        kick: 'hyperpop_kick_distorted_01',
        snare: 'hyperpop_snare_pitch_01',
        hihat: 'hyperpop_hihat_glitch_01',
        melody: 'hyperpop_melody_detuned_01',
        bass: 'hyperpop_bass_saturated_01',
        fx: 'hyperpop_fx_stutter_01',
      },
      volumes: { kick: 0.8, snare: 0.7, hihat: 0.6, melody: 0.65, bass: 0.85, fx: 0.5 },
    },
  },
};

export const GENRE_LIST: Genre[] = ['trap', 'lofi', 'house', 'drill', 'hyperpop'];
```

> **IMPORTANT NOTE ON PATTERNS:** The `p()` helper produces arrays from the pattern string. Make sure all patterns are EXACTLY 16 characters long (16 steps = 1 bar). If any above are 17 chars, trim the last character. Validate at build time.

---

## GENRE COLOR THEMES — `src/theme/genreThemes.ts`

```typescript
import { Genre } from '@/types';

export interface GenreTheme {
  primary: string;
  secondary: string;
  accent: string;
  cellActive: string;
  cellInactive: string;
  playhead: string;
  background: string;
}

export const GENRE_THEMES: Record<Genre, GenreTheme> = {
  trap: {
    primary: '#FF1744',
    secondary: '#1A0A0A',
    accent: '#FF5252',
    cellActive: '#FF1744',
    cellInactive: '#2A1515',
    playhead: 'rgba(255, 23, 68, 0.3)',
    background: '#0D0505',
  },
  lofi: {
    primary: '#FFB74D',
    secondary: '#1A150A',
    accent: '#FFD54F',
    cellActive: '#FFB74D',
    cellInactive: '#2A2415',
    playhead: 'rgba(255, 183, 77, 0.3)',
    background: '#0D0A05',
  },
  house: {
    primary: '#7C4DFF',
    secondary: '#0A0A1A',
    accent: '#B388FF',
    cellActive: '#7C4DFF',
    cellInactive: '#15152A',
    playhead: 'rgba(124, 77, 255, 0.3)',
    background: '#05050D',
  },
  drill: {
    primary: '#00E676',
    secondary: '#0A1A0A',
    accent: '#69F0AE',
    cellActive: '#00E676',
    cellInactive: '#152A15',
    playhead: 'rgba(0, 230, 118, 0.3)',
    background: '#050D05',
  },
  hyperpop: {
    primary: '#FF4081',
    secondary: '#1A0A14',
    accent: '#FF80AB',
    cellActive: '#FF4081',
    cellInactive: '#2A1520',
    playhead: 'rgba(255, 64, 129, 0.3)',
    background: '#0D0508',
  },
};
```

---

## MUI THEME — `src/theme/theme.ts`

```typescript
import { createTheme } from '@mui/material/styles';

// Base dark theme. Genre-specific colors are applied dynamically via CSS custom properties.
export const baseTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0A0A0A',
      paper: '#141414',
    },
    primary: { main: '#FF1744' },    // overridden per genre
    secondary: { main: '#1E1E1E' },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.6)',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif',
    h1: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '10px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
```

---

## ZUSTAND STORES

### Grid Store — `src/stores/useGridStore.ts`

```typescript
import { create } from 'zustand';
import { Genre, GridState, SoundSelections, TrackVolumes, TrackMutes, TrackSolos, TrackCategory, TRACK_ORDER, STEPS_PER_BAR } from '@/types';
import { GENRES } from '@/data/genres';

interface GridStore {
  // State
  genre: Genre;
  bpm: number;
  patternLength: 1 | 2 | 4;
  swing: number;
  grid: GridState;
  sounds: SoundSelections;
  volumes: TrackVolumes;
  mutes: TrackMutes;
  solos: TrackSolos;
  modificationsCount: number;

  // Actions
  setGenre: (genre: Genre) => void;        // loads template
  toggleCell: (track: TrackCategory, step: number) => void;
  setSound: (track: TrackCategory, soundId: string) => void;
  setVolume: (track: TrackCategory, volume: number) => void;
  toggleMute: (track: TrackCategory) => void;
  toggleSolo: (track: TrackCategory) => void;
  setBpm: (bpm: number) => void;
  setPatternLength: (length: 1 | 2 | 4) => void;
  setSwing: (swing: number) => void;
  loadProject: (project: any) => void;      // hydrate from saved project
  getProjectPayload: () => any;             // serialize for saving
  reset: () => void;
}

const initMutes = (): TrackMutes => ({ kick: false, snare: false, hihat: false, melody: false, bass: false, fx: false });
const initSolos = (): TrackSolos => ({ kick: false, snare: false, hihat: false, melody: false, bass: false, fx: false });

export const useGridStore = create<GridStore>((set, get) => ({
  genre: 'trap',
  bpm: 140,
  patternLength: 1,
  swing: 0,
  grid: GENRES.trap.template.grid,
  sounds: GENRES.trap.template.sounds,
  volumes: GENRES.trap.template.volumes,
  mutes: initMutes(),
  solos: initSolos(),
  modificationsCount: 0,

  setGenre: (genre) => {
    const def = GENRES[genre];
    set({
      genre,
      bpm: def.defaultBpm,
      grid: structuredClone(def.template.grid),
      sounds: { ...def.template.sounds },
      volumes: { ...def.template.volumes },
      mutes: initMutes(),
      solos: initSolos(),
      modificationsCount: 0,
      patternLength: 1,
      swing: 0,
    });
  },

  toggleCell: (track, step) => {
    set((state) => {
      const newGrid = structuredClone(state.grid);
      newGrid[track][step] = newGrid[track][step] === 1 ? 0 : 1;
      return { grid: newGrid, modificationsCount: state.modificationsCount + 1 };
    });
  },

  setSound: (track, soundId) => {
    set((state) => ({
      sounds: { ...state.sounds, [track]: soundId },
      modificationsCount: state.modificationsCount + 1,
    }));
  },

  setVolume: (track, volume) => {
    set((state) => ({ volumes: { ...state.volumes, [track]: volume } }));
  },

  toggleMute: (track) => {
    set((state) => ({ mutes: { ...state.mutes, [track]: !state.mutes[track] } }));
  },

  toggleSolo: (track) => {
    set((state) => ({ solos: { ...state.solos, [track]: !state.solos[track] } }));
  },

  setBpm: (bpm) => set({ bpm: Math.round(Math.max(60, Math.min(200, bpm))) }),

  setPatternLength: (patternLength) => {
    // When expanding, duplicate the grid pattern to fill
    set((state) => {
      const currentSteps = state.patternLength * STEPS_PER_BAR;
      const newSteps = patternLength * STEPS_PER_BAR;
      if (newSteps === currentSteps) return {};
      const newGrid = structuredClone(state.grid);
      for (const track of TRACK_ORDER) {
        const row = newGrid[track];
        if (newSteps > row.length) {
          // Tile the existing pattern to fill new length
          while (newGrid[track].length < newSteps) {
            newGrid[track] = [...newGrid[track], ...row.slice(0, Math.min(STEPS_PER_BAR, newSteps - newGrid[track].length))];
          }
        } else {
          newGrid[track] = row.slice(0, newSteps);
        }
      }
      return { patternLength, grid: newGrid };
    });
  },

  setSwing: (swing) => set({ swing: Math.max(0, Math.min(100, swing)) }),

  loadProject: (project) => {
    set({
      genre: project.genre,
      bpm: project.bpm,
      patternLength: project.pattern_length,
      swing: project.swing,
      grid: project.grid,
      sounds: project.sounds,
      volumes: project.volumes,
      mutes: project.mutes || initMutes(),
      solos: initSolos(),
      modificationsCount: project.modifications_count || 0,
    });
  },

  getProjectPayload: () => {
    const s = get();
    return {
      genre: s.genre,
      bpm: s.bpm,
      pattern_length: s.patternLength,
      swing: s.swing,
      grid: s.grid,
      sounds: s.sounds,
      volumes: s.volumes,
      mutes: s.mutes,
      modifications_count: s.modificationsCount,
    };
  },

  reset: () => get().setGenre(get().genre),
}));
```

### Transport Store — `src/stores/useTransportStore.ts`

```typescript
import { create } from 'zustand';

interface TransportStore {
  isPlaying: boolean;
  currentStep: number;
  isAudioContextStarted: boolean;
  setPlaying: (playing: boolean) => void;
  setCurrentStep: (step: number) => void;
  setAudioContextStarted: (started: boolean) => void;
}

export const useTransportStore = create<TransportStore>((set) => ({
  isPlaying: false,
  currentStep: -1,
  isAudioContextStarted: false,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setAudioContextStarted: (isAudioContextStarted) => set({ isAudioContextStarted }),
}));
```

---

## AUDIO ENGINE — `src/audio/engine.ts`

Key implementation notes for Tone.js:

```typescript
import * as Tone from 'tone';

// CRITICAL: Must call Tone.start() on first user gesture (genre tap).
// iOS Safari WILL NOT play audio without this.

let isInitialized = false;

export async function initAudio(): Promise<void> {
  if (isInitialized) return;
  await Tone.start();
  Tone.getDestination().volume.value = -6; // headroom
  isInitialized = true;
}

// Use Tone.Players for each track — preload all 6 active sounds
// When user swaps a sound, dispose the old Player and create a new one
// Use Tone.Sequence for the step sequencer loop

// IMPORTANT: On visibility change (tab switch on iOS), resume AudioContext:
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Tone.getContext().state !== 'running') {
      Tone.getContext().resume();
    }
  });
}
```

### Sequencer — `src/audio/sequencer.ts`

```typescript
import * as Tone from 'tone';
import { useGridStore } from '@/stores/useGridStore';
import { useTransportStore } from '@/stores/useTransportStore';
import { TrackCategory, TRACK_ORDER } from '@/types';

// Each track gets a Tone.Player loaded with its current sound
const players: Record<string, Tone.Player> = {};
let sequence: Tone.Sequence | null = null;

export function createSequence() {
  if (sequence) {
    sequence.dispose();
  }

  const totalSteps = useGridStore.getState().patternLength * 16;
  const stepIndices = Array.from({ length: totalSteps }, (_, i) => i);

  sequence = new Tone.Sequence(
    (time, step) => {
      const { grid, sounds, volumes, mutes, solos } = useGridStore.getState();

      // Update playhead position (on main thread via Transport callback)
      useTransportStore.getState().setCurrentStep(step);

      const hasSolo = TRACK_ORDER.some(t => solos[t]);

      for (const track of TRACK_ORDER) {
        // Skip if muted, or if another track is solo'd and this one isn't
        if (mutes[track]) continue;
        if (hasSolo && !solos[track]) continue;

        if (grid[track][step] === 1) {
          const player = players[track];
          if (player?.loaded) {
            player.volume.value = Tone.gainToDb(volumes[track]);
            player.start(time);
          }
        }
      }
    },
    stepIndices,
    '16n'
  );

  sequence.loop = true;
  return sequence;
}

export async function loadSound(track: TrackCategory, url: string) {
  if (players[track]) {
    players[track].dispose();
  }
  players[track] = new Tone.Player(url).toDestination();
  await Tone.loaded();
}

export function startPlayback() {
  Tone.getTransport().bpm.value = useGridStore.getState().bpm;
  Tone.getTransport().swing = useGridStore.getState().swing / 200; // normalize 0-100 to 0-0.5
  if (!sequence) createSequence();
  sequence!.start(0);
  Tone.getTransport().start();
}

export function stopPlayback() {
  Tone.getTransport().stop();
  Tone.getTransport().position = 0;
  useTransportStore.getState().setCurrentStep(-1);
}

export function updateBpm(bpm: number) {
  Tone.getTransport().bpm.value = bpm;
}
```

---

## CRITICAL COMPONENT SPECS

### StepGrid.tsx

- Render a `TRACK_ORDER.length` × `patternLength * 16` grid.
- Each cell is a `<Box>` (MUI) or `<button>` with `min-width: 44px`, `min-height: 44px` (WCAG touch targets).
- Active cells get the genre `cellActive` color + a subtle inner glow/dot.
- The playhead column gets a `playhead` color overlay that animates via `currentStep` from transport store.
- Use CSS Grid layout: `grid-template-columns: repeat(N, 1fr)`.
- On mobile (< 480px), cells should be tappable and the grid should scroll horizontally if pattern > 1 bar.
- **Performance:** Use `React.memo` on `GridCell` — cells should only re-render when their own state changes or the playhead passes through.

### GenreSelect.tsx

- 5 large visual tiles, each styled with the genre's color palette.
- Genre label + short description.
- Tapping a tile: calls `initAudio()` (Tone.start), then `setGenre()`, then navigates to `/studio`.
- The first genre (trap) is always available. Other 4 show a small lock icon if user is not authenticated (soft gate — they can still tap, but get the auth modal after interacting with the grid).
- Responsive: 2-column grid on mobile, 3-column on tablet+.

### AuthModal.tsx

- MUI `<Dialog>` that appears when user hits a gate (save, share, export, or 2nd genre).
- Tabs or toggle: "Sign Up" / "Log In".
- Email + password form.
- "Continue with Google" button (Supabase OAuth).
- "Continue with Apple" button (Supabase OAuth).
- On success: close modal, continue the gated action.

### SoundBrowser.tsx

- MUI `<SwipeableDrawer>` anchored to bottom.
- Opens when user taps the sound name label on a track row.
- Shows sounds filtered by: current genre + the category of the tapped track.
- Each sound shows: name, tap to preview (plays the sound in context replacing current temporarily).
- Tap "Use This" to confirm swap. Tap outside or swipe down to cancel (reverts to original sound).
- Display sounds as a scrollable list of `<ListItem>` with the sound name and a small play icon.

### TransportBar.tsx

- Sticky at bottom of screen (above any mobile nav).
- Contains: Play/Stop button (large, prominent, center), BPM slider (left side), pattern length toggle (right side: "1 / 2 / 4" bar chips).
- Play button: filled circle, genre accent color. Toggles between play ▶ and stop ■ icons.
- BPM slider: MUI `<Slider>` with genre color, range from the genre's `bpmRange[0]` to `bpmRange[1]`. Shows BPM number on tap/drag.

### ShareModal.tsx

- Generates a `share_id` (nanoid, 8 chars) if the project doesn't have one.
- Shows the share URL.
- Buttons: Copy Link, WhatsApp, Twitter/X, native Share API (if available via `navigator.share`).
- The share URL `/beat/[shareId]` is a public page.

### ExportModal.tsx

- Two options: MP3 (default) and WAV.
- On tap: uses `OfflineAudioContext` to render the beat loop.
- Shows a progress indicator during render.
- Auto-downloads the file with name: `{title}-{genre}-{bpm}bpm.{ext}`.
- Use `lamejs` for MP3 encoding client-side.

---

## SOUND FILES STRATEGY FOR MVP BUILD

Since we don't have actual NI sound libraries, create placeholder sounds for development:

1. Create a script `scripts/generate-placeholder-sounds.ts` that uses Tone.js (Node.js compatible via `tone` package or `web-audio-api` shim) OR simply provide instructions to generate short `.ogg` files.
2. For the build, use **free CC0 drum samples** from a source like `freesound.org` or generate them with Web Audio API oscillators.
3. Put placeholder sounds in `public/sounds/{genre}/` following the naming convention: `{genre}_{category}_{descriptor}_{variant}.ogg`.
4. Minimum for dev: 1 sound per category per genre = 30 files. Create these as short (< 1 second) audio files.

**Alternatively:** The SoundBrowser and audio engine should work against a `SOUND_CATALOG` array defined in `src/data/sounds.ts`. For MVP dev, hardcode the catalog with paths to `/sounds/...` files. In production, these paths would point to a CDN (Cloudflare R2).

```typescript
// src/data/sounds.ts
import { SoundDefinition, Genre, TrackCategory } from '@/types';

export const SOUND_CATALOG: SoundDefinition[] = [
  // TRAP
  { id: 'trap_kick_deep_01', name: 'Deep Kick', category: 'kick', genre: 'trap', file_ogg: '/sounds/trap/trap_kick_deep_01.ogg', file_aac: '/sounds/trap/trap_kick_deep_01.m4a' },
  { id: 'trap_kick_punchy_02', name: 'Punchy Kick', category: 'kick', genre: 'trap', file_ogg: '/sounds/trap/trap_kick_punchy_02.ogg', file_aac: '/sounds/trap/trap_kick_punchy_02.m4a' },
  // ... etc — minimum 6 per category per genre for MVP browse experience
  // Build agent: generate the full catalog for all 5 genres × 6 categories × minimum 3 variants = 90 entries
];

// Helper to get sounds for a genre + category
export function getSounds(genre: Genre, category: TrackCategory): SoundDefinition[] {
  return SOUND_CATALOG.filter(s => s.genre === genre && s.category === category);
}

// Helper to get a sound definition by ID
export function getSound(id: string): SoundDefinition | undefined {
  return SOUND_CATALOG.find(s => s.id === id);
}

// Helper to get the audio URL (with AAC fallback for Safari)
export function getSoundUrl(sound: SoundDefinition): string {
  // Detect iOS Safari
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isIOS ? sound.file_aac : sound.file_ogg;
}
```

---

## ENVIRONMENT VARIABLES — `.env.local.example`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## PACKAGE.JSON DEPENDENCIES

```json
{
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.1.0",
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tone": "^14.7.77",
    "zustand": "^4.5.0",
    "nanoid": "^5.0.0",
    "lamejs": "^1.2.1",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/node": "^20.11.0",
    "typescript": "^5.3.0",
    "@types/lamejs": "^1.2.0"
  }
}
```

---

## IMPLEMENTATION ORDER (build in this sequence)

1. **Project scaffold:** `npx create-next-app@latest ni-play --typescript --app --tailwind=no` (we're using MUI, not Tailwind). Install all deps.
2. **Theme + Layout:** Set up MUI ThemeProvider in root layout. Dark mode. Import Inter font.
3. **Types + Data:** Create `types/index.ts`, `data/genres.ts`, `data/sounds.ts`, `theme/` files.
4. **Zustand Stores:** Create `useGridStore`, `useTransportStore`.
5. **Audio Engine:** `audio/engine.ts`, `audio/sequencer.ts`, `audio/soundLoader.ts`. Get Tone.js playing a basic loop.
6. **Genre Select Page:** Landing page with 5 genre tiles. Tapping initializes audio + loads template.
7. **Step Grid + Transport:** The core beat-making UI. Grid cells toggle. Playhead animates. Transport play/stop/tempo works.
8. **Track Controls:** Mute/solo/volume per track. Sound name label (tappable).
9. **Sound Browser:** Drawer with sound list. Preview + swap sounds.
10. **Supabase Setup:** Create Supabase project. Run migration SQL. Set up auth.
11. **Auth:** AuthModal component. Supabase email/password + Google OAuth. Session persistence.
12. **API Routes:** CRUD for projects. Share endpoint.
13. **Save/Load:** Save button triggers auth gate if needed, then saves to Supabase. Load from dashboard.
14. **Dashboard:** "Your Beats" page. List saved projects. Milestone tracker. Tap to reopen.
15. **Export:** Client-side render via OfflineAudioContext. MP3 via lamejs. WAV via audiobuffer-to-wav.
16. **Share:** Generate share link. Public `/beat/[shareId]` page with playback. OG meta tags.
17. **Onboarding:** 3-step tooltip overlay on first visit (use localStorage flag).
18. **Polish:** Genre color themes applied dynamically. Animations (Framer Motion for cell toggles, playhead). Responsive tweaks.

---

## KEY DECISIONS (DO NOT DEVIATE)

1. **MUI only — no Tailwind.** Use MUI's `sx` prop and `styled()` for all styling. The `sx` prop handles responsive breakpoints natively.
2. **App Router only.** No `pages/` directory. Use `src/app/` with server components by default, `'use client'` only where needed (anything with audio, state, or interaction).
3. **Supabase for everything backend.** Auth, DB, and optionally storage. No custom backend.
4. **Tone.js for all audio.** No raw Web Audio API unless Tone.js can't handle a specific case.
5. **Zustand for all client state.** No React Context for app state. Zustand stores are the single source of truth.
6. **Mobile-first responsive.** Design for 375px width FIRST. Scale up.
7. **Dark mode only.** No light mode toggle.
8. **Genre colors are CSS custom properties** set on `<body>` or a wrapping `<div>` when genre changes. Components read `var(--genre-primary)` etc. This avoids prop drilling colors.
9. **All grid patterns are exactly `patternLength * 16` steps.** 1 bar = 16 steps. Always.
10. **Sound files in `/public/sounds/` for dev, CDN URLs for prod.** The `getSoundUrl()` helper abstracts this.

---

## PLACEHOLDER SOUND GENERATION

Since we need actual audio files for the app to work, generate synthetic placeholder sounds using Tone.js in a Node script, OR create a component that generates them on-the-fly:

```typescript
// scripts/generateSounds.mjs — run with: node scripts/generateSounds.mjs
// This creates minimal placeholder .wav files using Node.js
// You'll need: npm install wav-encoder

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_RATE = 44100;

function generateTone(freq, duration, type = 'sine') {
  const samples = Math.floor(SAMPLE_RATE * duration);
  const buffer = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = Math.exp(-t * 8); // quick decay
    let wave;
    switch (type) {
      case 'noise': wave = Math.random() * 2 - 1; break;
      case 'square': wave = Math.sign(Math.sin(2 * Math.PI * freq * t)); break;
      default: wave = Math.sin(2 * Math.PI * freq * t);
    }
    buffer[i] = wave * envelope * 0.8;
  }
  return buffer;
}

// Generate a minimal WAV file from a Float32Array
function encodeWAV(samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * numChannels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);        // chunk size
  buffer.writeUInt16LE(1, 20);         // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s * 32767), 44 + i * 2);
  }
  return buffer;
}

const soundDefs = {
  kick:   { freq: 60,  duration: 0.5, type: 'sine' },
  snare:  { freq: 200, duration: 0.2, type: 'noise' },
  hihat:  { freq: 800, duration: 0.1, type: 'noise' },
  melody: { freq: 440, duration: 0.8, type: 'sine' },
  bass:   { freq: 80,  duration: 0.6, type: 'square' },
  fx:     { freq: 1200, duration: 0.3, type: 'sine' },
};

const genres = ['trap', 'lofi', 'house', 'drill', 'hyperpop'];
const categories = ['kick', 'snare', 'hihat', 'melody', 'bass', 'fx'];

for (const genre of genres) {
  const dir = path.join(__dirname, '..', 'public', 'sounds', genre);
  fs.mkdirSync(dir, { recursive: true });

  for (const cat of categories) {
    for (let v = 1; v <= 3; v++) {
      const def = soundDefs[cat];
      // Vary frequency slightly per variant
      const freq = def.freq * (1 + (v - 1) * 0.15);
      const samples = generateTone(freq, def.duration, def.type);
      const wav = encodeWAV(samples);
      const filename = `${genre}_${cat}_${String(v).padStart(2, '0')}.wav`;
      fs.writeFileSync(path.join(dir, filename), wav);
    }
  }
}

console.log('Generated placeholder sounds in public/sounds/');
```

> **Build agent:** Run this script first to create placeholder audio files before testing the app.

---

## RESPONSIVE DESIGN NOTES

```
Mobile portrait (375px):  Grid cells ~40px. Transport bar sticky bottom. Full width.
Mobile landscape (667px):  Grid cells slightly wider. Transport beside grid optionally.
Tablet (768px):            Sound browser as side panel instead of bottom drawer.
Desktop (1024px+):         Full layout. Sound browser persistent sidebar.
```

Use MUI's `useMediaQuery` and the `sx` responsive array syntax:
```tsx
<Box sx={{ width: { xs: '100%', md: '70%' } }}>
```

---

## WHAT "DONE" LOOKS LIKE

The MVP is complete when:
1. User lands on the app, sees 5 genre tiles, taps one.
2. A pre-built beat plays on a 6×16 grid. Cells toggle on/off with audio.
3. User can swap sounds via the browser drawer, adjust BPM, change pattern length.
4. Tapping Save/Share/Export triggers auth modal.
5. After auth, beat saves to Supabase. Dashboard shows saved beats with milestone tracker.
6. Export renders client-side and downloads MP3/WAV.
7. Share generates a public link at `/beat/[shareId]` with playback + "Make your own" CTA.
8. Everything works on mobile Safari and Chrome. Dark theme. Genre colors.
