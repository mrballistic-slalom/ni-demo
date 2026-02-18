import { loadTone, getTone } from './tone';

let isInitialized = false;

/**
 * Initializes the Web Audio context by loading Tone.js, starting the audio
 * context, and setting a default master volume. No-ops if already initialized.
 */
export async function initAudio(): Promise<void> {
  if (isInitialized) return;
  const Tone = await loadTone();
  await Tone.start();
  Tone.getDestination().volume.value = -6;
  isInitialized = true;
}

/**
 * Checks whether the audio engine has been initialized.
 * @returns `true` if {@link initAudio} has completed successfully.
 */
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
