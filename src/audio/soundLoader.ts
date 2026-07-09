import { TrackCategory } from '@/types';
import { useGridStore } from '@/stores/useGridStore';
import { GENRES } from '@/data/genres';
import { getSound } from '@/data/sounds';
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
// SoundVariant.spec from the catalog and rebuild the affected track's Voice
// via synthKit, once `getSound` returns SoundVariant instead of the legacy
// file-based SoundDefinition. For now this only updates the grid store's
// sound assignment; the sequencer plays the genre kit built by `buildKit`.

/**
 * Replaces the sound assignment for a single track.
 * @param track - The track category whose sound should be swapped.
 * @param soundId - The identifier of the new sound to assign.
 */
export async function swapSound(track: TrackCategory, soundId: string): Promise<void> {
  const soundDef = getSound(soundId);
  if (soundDef) {
    useGridStore.getState().setSound(track, soundId);
  }
}
