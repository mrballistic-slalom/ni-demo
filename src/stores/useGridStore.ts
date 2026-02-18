import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Genre, GridState, SoundSelections, TrackVolumes, TrackMutes, TrackSolos, TrackCategory, TRACK_ORDER, STEPS_PER_BAR } from '@/types';
import { GENRES } from '@/data/genres';

/** Serializable snapshot of grid state used for saving/loading projects. */
interface ProjectPayload {
  genre: Genre;
  bpm: number;
  pattern_length: 1 | 2 | 4;
  swing: number;
  grid: GridState;
  sounds: SoundSelections;
  volumes: TrackVolumes;
  mutes?: TrackMutes;
  modifications_count?: number;
}

/** Core beat-grid state and actions for sequencer tracks, sounds, and mix controls. */
interface GridStore {
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
  /** Reset the grid to the default template for the given genre. */
  setGenre: (genre: Genre) => void;
  /** Toggle a single cell on/off in the sequencer grid. */
  toggleCell: (track: TrackCategory, step: number) => void;
  /** Assign a sound sample to a track by its sound ID. */
  setSound: (track: TrackCategory, soundId: string) => void;
  /** Set the volume level for a track. */
  setVolume: (track: TrackCategory, volume: number) => void;
  /** Toggle the mute state of a track. */
  toggleMute: (track: TrackCategory) => void;
  /** Toggle the solo state of a track. */
  toggleSolo: (track: TrackCategory) => void;
  /** Set the tempo in BPM, clamped to 60-200. */
  setBpm: (bpm: number) => void;
  /** Set the pattern length in bars (1, 2, or 4), resizing the grid accordingly. */
  setPatternLength: (length: 1 | 2 | 4) => void;
  /** Set the swing amount (0-100). */
  setSwing: (swing: number) => void;
  /** Hydrate the store from a serialized project payload. */
  loadProject: (project: ProjectPayload) => void;
  /** Return a serializable snapshot of the current grid state. */
  getProjectPayload: () => ProjectPayload;
  /** Reset the grid to the default state for the current genre. */
  reset: () => void;
}

const initMutes = (): TrackMutes => ({ kick: false, snare: false, hihat: false, melody: false, bass: false, fx: false });
const initSolos = (): TrackSolos => ({ kick: false, snare: false, hihat: false, melody: false, bass: false, fx: false });

/** Zustand store hook for the beat-grid sequencer state. Persisted to localStorage. */
export const useGridStore = create<GridStore>()(
  persist(
    (set, get) => ({
      genre: 'trap',
      bpm: 140,
      patternLength: 1,
      swing: 0,
      grid: structuredClone(GENRES.trap.template.grid),
      sounds: { ...GENRES.trap.template.sounds },
      volumes: { ...GENRES.trap.template.volumes },
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
        set((state) => {
          const currentSteps = state.patternLength * STEPS_PER_BAR;
          const newSteps = patternLength * STEPS_PER_BAR;
          if (newSteps === currentSteps) return {};
          const newGrid = structuredClone(state.grid);
          for (const track of TRACK_ORDER) {
            const row = newGrid[track];
            if (newSteps > row.length) {
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
    }),
    {
      name: 'ni-play-grid',
      partialize: (state) => ({
        genre: state.genre,
        bpm: state.bpm,
        swing: state.swing,
        patternLength: state.patternLength,
        grid: state.grid,
        sounds: state.sounds,
        volumes: state.volumes,
        mutes: state.mutes,
        solos: state.solos,
      }),
    }
  )
);
