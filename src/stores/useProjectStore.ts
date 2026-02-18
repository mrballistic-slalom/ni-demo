import { create } from 'zustand';
import { Project } from '@/types';

interface ProjectStore {
  currentProjectId: string | null;
  currentTitle: string;
  projects: Project[];
  isSaving: boolean;
  setCurrentProjectId: (id: string | null) => void;
  setCurrentTitle: (title: string) => void;
  setProjects: (projects: Project[]) => void;
  setSaving: (saving: boolean) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  currentProjectId: null,
  currentTitle: 'Untitled Beat',
  projects: [],
  isSaving: false,
  setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
  setCurrentTitle: (currentTitle) => set({ currentTitle }),
  setProjects: (projects) => set({ projects }),
  setSaving: (isSaving) => set({ isSaving }),
}));
