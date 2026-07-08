import { TrackCategory } from '@/types';
import { useGridStore } from '@/stores/useGridStore';
import { GENRES } from '@/data/genres';
import { getSound, getSoundUrl } from '@/data/sounds';
import { loadSound } from './sequencer';
import { buildKit } from './synthKit';

/**
 * Loads audio for the current genre's kit based on the grid store's current
 * genre selection. If the genre defines a `kit` (per-track `VoiceSpec`s),
 * builds it via {@link buildKit}. Genres without a kit yet (pre-Task-10) are
 * a no-op — the engine simply has nothing to play until kits are populated.
 */
export async function loadAllSounds(): Promise<void> {
  const { genre } = useGridStore.getState();
  const kit = GENRES[genre].kit;
  if (!kit) return;

  await buildKit(kit);
}

// TODO(Task 9): swapSound + catalog-derived kit — reframe below to resolve
// SoundVariant.spec from the catalog instead of the legacy file-based
// SoundDefinition, once `getSound` returns SoundVariant.

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
