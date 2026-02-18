import type * as ToneTypes from 'tone';
import { getTone } from './tone';
import { useGridStore } from '@/stores/useGridStore';
import { useTransportStore } from '@/stores/useTransportStore';
import { TrackCategory, TRACK_ORDER } from '@/types';

const players: Record<string, ToneTypes.Player> = {};
let sequence: ToneTypes.Sequence | null = null;

/**
 * Creates (or recreates) a Tone.js Sequence that drives step playback.
 * Reads the current grid state to determine pattern length and triggers
 * samples on each active step while respecting mute/solo settings.
 * @returns The newly created Tone.js Sequence instance.
 */
export function createSequence() {
  const Tone = getTone();

  if (sequence) {
    sequence.dispose();
  }

  const totalSteps = useGridStore.getState().patternLength * 16;
  const stepIndices = Array.from({ length: totalSteps }, (_, i) => i);

  sequence = new Tone.Sequence(
    (time, step) => {
      const { grid, volumes, mutes, solos } = useGridStore.getState();
      useTransportStore.getState().setCurrentStep(step);

      const hasSolo = TRACK_ORDER.some(t => solos[t]);

      for (const track of TRACK_ORDER) {
        if (mutes[track]) continue;
        if (hasSolo && !solos[track]) continue;

        if (grid[track][step] === 1) {
          const player = players[track];
          if (player?.loaded) {
            player.volume.value = Tone.gainToDb(volumes[track]);
            player.start(time);
          }
        }
      }
    },
    stepIndices,
    '16n'
  );

  sequence.loop = true;
  return sequence;
}

/**
 * Loads an audio sample into a Tone.js Player for the given track,
 * disposing of any previously loaded player for that track.
 * @param track - The track category to load the sound into.
 * @param url - URL of the audio file to load.
 */
export async function loadSound(track: TrackCategory, url: string) {
  const Tone = getTone();
  if (players[track]) {
    players[track].dispose();
  }
  players[track] = new Tone.Player(url).toDestination();
  await Tone.loaded();
}

/**
 * Starts sequencer playback by syncing BPM and swing from the grid store,
 * creating a sequence if needed, and starting the Tone.js transport.
 */
export function startPlayback() {
  const Tone = getTone();
  Tone.getTransport().bpm.value = useGridStore.getState().bpm;
  Tone.getTransport().swing = useGridStore.getState().swing / 200;
  if (!sequence) createSequence();
  sequence!.start(0);
  Tone.getTransport().start();
}

/**
 * Stops sequencer playback, resets the transport position to zero,
 * and clears the playhead step indicator.
 */
export function stopPlayback() {
  const Tone = getTone();
  Tone.getTransport().stop();
  Tone.getTransport().position = 0;
  sequence?.stop();
  useTransportStore.getState().setCurrentStep(-1);
}

/**
 * Updates the Tone.js transport BPM in real time.
 * @param bpm - The new beats-per-minute value.
 */
export function updateBpm(bpm: number) {
  const Tone = getTone();
  Tone.getTransport().bpm.value = bpm;
}

/**
 * Disposes the current Tone.js Sequence and frees its resources.
 */
export function disposeSequence() {
  if (sequence) {
    sequence.dispose();
    sequence = null;
  }
}

/**
 * Returns the Tone.js Player instance for a given track, if one is loaded.
 * @param track - The track category to look up.
 * @returns The Player instance, or `undefined` if no sound is loaded for the track.
 */
export function getPlayer(track: TrackCategory): ToneTypes.Player | undefined {
  return players[track];
}
