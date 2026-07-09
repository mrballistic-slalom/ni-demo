import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** State and actions for the current beat's display title. */
interface ProjectStore {
  currentTitle: string;
  /** Update the display title for the current project. */
  setCurrentTitle: (title: string) => void;
}

/** Zustand store hook for the current beat's title. Persisted to localStorage. */
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      currentTitle: 'Untitled Beat',

      setCurrentTitle: (currentTitle) => set({ currentTitle }),
    }),
    {
      name: 'ni-play-projects',
      partialize: (state) => ({
        currentTitle: state.currentTitle,
      }),
    }
  )
);
