/** Supported music genre identifiers. */
export type Genre = 'trap' | 'lofi' | 'house' | 'drill' | 'hyperpop';

/** Track instrument categories available in the beat grid. */
export type TrackCategory = 'kick' | 'snare' | 'hihat' | 'melody' | 'bass' | 'fx';

/** Canonical display order of tracks in the beat grid, top to bottom. */
export const TRACK_ORDER: TrackCategory[] = ['kick', 'snare', 'hihat', 'melody', 'bass', 'fx'];

/** Number of sequencer steps in a single bar (16th notes). */
export const STEPS_PER_BAR = 16;

/** A single track's step pattern -- array of 0 (off) or 1 (on) values. */
export type GridRow = number[];

/** Full sequencer grid state mapping each track category to its step pattern. */
export type GridState = Record<TrackCategory, GridRow>;

/** Maps each track category to its currently selected sound ID. */
export type SoundSelections = Record<TrackCategory, string>;

/** Maps each track category to its volume level (0..1). */
export type TrackVolumes = Record<TrackCategory, number>;

/** Maps each track category to its mute state. */
export type TrackMutes = Record<TrackCategory, boolean>;

/** Maps each track category to its solo state. */
export type TrackSolos = Record<TrackCategory, boolean>;

/** A saved beat project with all sequencer state and metadata. */
export interface Project {
  id: string;
  user_id: string;
  title: string;
  genre: Genre;
  bpm: number;
  pattern_length: 1 | 2 | 4;
  swing: number;
  grid: GridState;
  sounds: SoundSelections;
  volumes: TrackVolumes;
  mutes: TrackMutes;
  share_id: string | null;
  modifications_count: number;
  created_at: string;
  updated_at: string;
}

/** Payload for creating a new project (server-generated fields omitted). */
export type ProjectCreatePayload = Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

/** Payload for partially updating an existing project. */
export type ProjectUpdatePayload = Partial<ProjectCreatePayload>;

/** Metadata for a single audio sample in the sound catalog. */
export interface SoundDefinition {
  id: string;
  name: string;
  category: TrackCategory;
  genre: Genre;
  file_ogg: string;
  file_aac: string;
}

/** Complete definition of a genre including display info, BPM range, colors, and default template. */
export interface GenreDefinition {
  id: Genre;
  label: string;
  description: string;
  bpmRange: [number, number];
  defaultBpm: number;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  template: GenreTemplate;
}

/** Default grid pattern, sound selections, and volumes for a genre preset. */
export interface GenreTemplate {
  grid: GridState;
  sounds: SoundSelections;
  volumes: TrackVolumes;
}

/** Authenticated user profile data. */
export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  beats_count: number;
  created_at: string;
}

/** Playback transport state for the sequencer. */
export interface TransportState {
  isPlaying: boolean;
  currentStep: number;
  isAudioContextStarted: boolean;
}
