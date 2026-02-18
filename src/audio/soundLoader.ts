import { TrackCategory, TRACK_ORDER } from '@/types';
import { useGridStore } from '@/stores/useGridStore';
import { getSound, getSoundUrl } from '@/data/sounds';
import { loadSound } from './sequencer';

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

export async function swapSound(track: TrackCategory, soundId: string): Promise<void> {
  const soundDef = getSound(soundId);
  if (soundDef) {
    const url = getSoundUrl(soundDef);
    await loadSound(track, url);
    useGridStore.getState().setSound(track, soundId);
  }
}
