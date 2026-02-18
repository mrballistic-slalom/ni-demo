import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Genre, GridState, SoundSelections, TrackVolumes } from '@/types';
import { useGridStore } from './useGridStore';

/** A persisted project snapshot including grid, sounds, and metadata. */
export interface SavedProject {
  id: string;
  title: string;
  genre: Genre;
  bpm: number;
  grid: GridState;
  sounds: SoundSelections;
  volumes: TrackVolumes;
  savedAt: string;
}

/** State and actions for managing saved beat projects. */
interface ProjectStore {
  currentProjectId: string | null;
  currentTitle: string;
  projects: SavedProject[];
  /** Update the display title for the current project. */
  setCurrentTitle: (title: string) => void;
  /** Save the current grid state as a project. Returns the project ID. */
  saveProject: () => string;
  /** Load a saved project by ID into the grid store. */
  loadProject: (id: string) => void;
  /** Delete a saved project by ID. Resets current project if it was active. */
  deleteProject: (id: string) => void;
  /** Return all saved projects. */
  listProjects: () => SavedProject[];
}

/** Zustand store hook for project save/load management. Persisted to localStorage. */
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      currentProjectId: null,
      currentTitle: 'Untitled Beat',
      projects: [],

      setCurrentTitle: (currentTitle) => set({ currentTitle }),

      saveProject: () => {
        const gridState = useGridStore.getState();
        const { currentProjectId, currentTitle, projects } = get();

        const projectData: Omit<SavedProject, 'id' | 'savedAt'> = {
          title: currentTitle,
          genre: gridState.genre,
          bpm: gridState.bpm,
          grid: gridState.grid,
          sounds: gridState.sounds,
          volumes: gridState.volumes,
        };

        // Update existing project or create new one
        if (currentProjectId) {
          const existingIndex = projects.findIndex((p) => p.id === currentProjectId);
          if (existingIndex !== -1) {
            const updated: SavedProject = {
              ...projectData,
              id: currentProjectId,
              savedAt: new Date().toISOString(),
            };
            const updatedProjects = [...projects];
            updatedProjects[existingIndex] = updated;
            set({ projects: updatedProjects });
            return currentProjectId;
          }
        }

        // Create new project
        const id = nanoid(10);
        const newProject: SavedProject = {
          ...projectData,
          id,
          savedAt: new Date().toISOString(),
        };
        set({
          currentProjectId: id,
          projects: [newProject, ...projects],
        });
        return id;
      },

      loadProject: (id) => {
        const { projects } = get();
        const project = projects.find((p) => p.id === id);
        if (!project) return;

        // Load into grid store
        useGridStore.getState().loadProject({
          genre: project.genre,
          bpm: project.bpm,
          pattern_length: 1,
          swing: 0,
          grid: project.grid,
          sounds: project.sounds,
          volumes: project.volumes,
        });

        set({
          currentProjectId: id,
          currentTitle: project.title,
        });
      },

      deleteProject: (id) => {
        const { projects, currentProjectId } = get();
        const filtered = projects.filter((p) => p.id !== id);
        set({
          projects: filtered,
          ...(currentProjectId === id
            ? { currentProjectId: null, currentTitle: 'Untitled Beat' }
            : {}),
        });
      },

      listProjects: () => {
        return get().projects;
      },
    }),
    {
      name: 'ni-play-projects',
      partialize: (state) => ({
        currentProjectId: state.currentProjectId,
        currentTitle: state.currentTitle,
        projects: state.projects,
      }),
    }
  )
);
