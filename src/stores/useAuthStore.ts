import { create } from 'zustand';
import { UserProfile } from '@/types';

interface AuthStore {
  user: UserProfile | null;
  isLoading: boolean;
  showAuthModal: boolean;
  pendingAction: (() => void) | null;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  openAuthModal: (pendingAction?: () => void) => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  showAuthModal: false,
  pendingAction: null,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  openAuthModal: (pendingAction) => set({ showAuthModal: true, pendingAction: pendingAction || null }),
  closeAuthModal: () => set({ showAuthModal: false, pendingAction: null }),
}));
