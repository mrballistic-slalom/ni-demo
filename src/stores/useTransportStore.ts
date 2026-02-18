import { create } from 'zustand';

/** Playback transport state: play/pause, current step, and audio context readiness. */
interface TransportStore {
  isPlaying: boolean;
  currentStep: number;
  isAudioContextStarted: boolean;
  /** Start or stop sequencer playback. */
  setPlaying: (playing: boolean) => void;
  /** Update the currently active step index in the sequence. */
  setCurrentStep: (step: number) => void;
  /** Mark whether the Web Audio AudioContext has been resumed after user gesture. */
  setAudioContextStarted: (started: boolean) => void;
}

/** Zustand store hook for sequencer transport controls (play/pause, step position). */
export const useTransportStore = create<TransportStore>((set) => ({
  isPlaying: false,
  currentStep: -1,
  isAudioContextStarted: false,
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setAudioContextStarted: (isAudioContextStarted) => set({ isAudioContextStarted }),
}));
