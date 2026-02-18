export type Genre = 'trap' | 'lofi' | 'house' | 'drill' | 'hyperpop';

export type TrackCategory = 'kick' | 'snare' | 'hihat' | 'melody' | 'bass' | 'fx';

export const TRACK_ORDER: TrackCategory[] = ['kick', 'snare', 'hihat', 'melody', 'bass', 'fx'];

export const STEPS_PER_BAR = 16;

export type GridRow = number[];

export type GridState = Record<TrackCategory, GridRow>;

export type SoundSelections = Record<TrackCategory, string>;

export type TrackVolumes = Record<TrackCategory, number>;

export type TrackMutes = Record<TrackCategory, boolean>;

export type TrackSolos = Record<TrackCategory, boolean>;

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

export type ProjectCreatePayload = Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export type ProjectUpdatePayload = Partial<ProjectCreatePayload>;

export interface SoundDefinition {
  id: string;
  name: string;
  category: TrackCategory;
  genre: Genre;
  file_ogg: string;
  file_aac: string;
}

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

export interface GenreTemplate {
  grid: GridState;
  sounds: SoundSelections;
  volumes: TrackVolumes;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  beats_count: number;
  created_at: string;
}

export interface TransportState {
  isPlaying: boolean;
  currentStep: number;
  isAudioContextStarted: boolean;
}
