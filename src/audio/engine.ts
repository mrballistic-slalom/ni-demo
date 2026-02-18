import * as Tone from 'tone';

let isInitialized = false;

export async function initAudio(): Promise<void> {
  if (isInitialized) return;
  await Tone.start();
  Tone.getDestination().volume.value = -6;
  isInitialized = true;
}

export function isAudioInitialized(): boolean {
  return isInitialized;
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Tone.getContext().state !== 'running') {
      Tone.getContext().resume();
    }
  });
}
