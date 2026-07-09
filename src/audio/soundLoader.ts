import { GenreKit, TrackCategory, TRACK_ORDER } from '@/types';
import { useGridStore } from '@/stores/useGridStore';
import { GENRES } from '@/data/genres';
import { getSound } from '@/data/sounds';
import { buildKit, setVoice } from './synthKit';

/**
 * Loads audio for the current genre's kit. Resolves each track's currently
 * assigned sound ID (from the grid store's `sounds` selections) to its
 * catalog `VoiceSpec` via {@link getSound}, assembles a full {@link GenreKit},
 * and builds it via {@link buildKit}. Falls back to the genre's static
 * `kit` definition for a track if its selected sound ID doesn't resolve
 * (e.g. stale/unknown ID), and skips the track entirely if neither resolves.
 */
export async function loadAllSounds(): Promise<void> {
  const { genre, sounds } = useGridStore.getState();
  const genreKit = GENRES[genre].kit;

  const kit = {} as GenreKit;
  for (const track of TRACK_ORDER) {
    const spec = getSound(sounds[track])?.spec ?? genreKit?.[track];
    if (spec) {
      kit[track] = spec;
    }
  }

  if (Object.keys(kit).length === 0) return;

  await buildKit(kit);
}

/**
 * Replaces the sound assignment for a single track: resolves `soundId` to
 * its catalog `VoiceSpec`, rebuilds the track's live voice in place via
 * {@link setVoice} (preserving its gain/mute), and only then updates the
 * grid store's sound assignment. No-ops if `soundId` doesn't resolve to a
 * catalog entry.
 * @param track - The track category whose sound should be swapped.
 * @param soundId - The identifier of the new sound to assign.
 */
export async function swapSound(track: TrackCategory, soundId: string): Promise<void> {
  const spec = getSound(soundId)?.spec;
  if (!spec) return;

  await setVoice(track, spec);
  useGridStore.getState().setSound(track, soundId);
}
