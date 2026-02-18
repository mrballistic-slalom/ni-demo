import { TrackCategory, TRACK_ORDER } from '@/types';
import { useGridStore } from '@/stores/useGridStore';
import { getSound, getSoundUrl } from '@/data/sounds';
import { loadSound } from './sequencer';

/**
 * Loads audio samples for all tracks based on the current sound assignments
 * in the grid store. Loads are performed in parallel.
 */
export async function loadAllSounds(): Promise<void> {
  const { sounds } = useGridStore.getState();
  const loadPromises: Promise<void>[] = [];

  for (const track of TRACK_ORDER) {
    const soundId = sounds[track];
    const soundDef = getSound(soundId);
    if (soundDef) {
      const url = getSoundUrl(soundDef);
      loadPromises.push(loadSound(track, url));
    }
  }

  await Promise.all(loadPromises);
}

/**
 * Replaces the sound for a single track by loading the new sample and
 * updating the grid store assignment.
 * @param track - The track category whose sound should be swapped.
 * @param soundId - The identifier of the new sound to load.
 */
export async function swapSound(track: TrackCategory, soundId: string): Promise<void> {
  const soundDef = getSound(soundId);
  if (soundDef) {
    const url = getSoundUrl(soundDef);
    await loadSound(track, url);
    useGridStore.getState().setSound(track, soundId);
  }
}
