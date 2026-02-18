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
