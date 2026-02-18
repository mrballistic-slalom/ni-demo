import { loadTone, getTone } from './tone';

let isInitialized = false;

export async function initAudio(): Promise<void> {
  if (isInitialized) return;
  const Tone = await loadTone();
  await Tone.start();
  Tone.getDestination().volume.value = -6;
  isInitialized = true;
}

export function isAudioInitialized(): boolean {
  return isInitialized;
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isInitialized) {
      const Tone = getTone();
      if (Tone.getContext().state !== 'running') {
        Tone.getContext().resume();
      }
    }
  });
}
