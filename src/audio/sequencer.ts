import type * as ToneTypes from 'tone';
import { getTone } from './tone';
import { getVoice, setGain } from './synthKit';
import { GENRES } from '@/data/genres';
import { useGridStore } from '@/stores/useGridStore';
import { useTransportStore } from '@/stores/useTransportStore';
import { TRACK_ORDER } from '@/types';

let sequence: ToneTypes.Sequence | null = null;

/**
 * Creates (or recreates) a Tone.js Sequence that drives step playback.
 * Reads the current grid state to determine pattern length and triggers
 * samples on each active step while respecting mute/solo settings.
 * @returns The newly created Tone.js Sequence instance.
 */
export function createSequence(): ToneTypes.Sequence {
  const Tone = getTone();

  if (sequence) {
    sequence.dispose();
  }

  const totalSteps = useGridStore.getState().patternLength * 16;
  const stepIndices = Array.from({ length: totalSteps }, (_, i) => i);

  sequence = new Tone.Sequence(
    (time, step) => {
      const { genre, grid, volumes, mutes, solos } = useGridStore.getState();
      useTransportStore.getState().setCurrentStep(step);

      const hasSolo = TRACK_ORDER.some(t => solos[t]);

      for (const track of TRACK_ORDER) {
        if (mutes[track]) continue;
        if (hasSolo && !solos[track]) continue;

        if (grid[track][step] === 1) {
          const note =
            track === 'melody' || track === 'bass'
              ? (GENRES[genre].noteRows?.[track]?.[step % 16] ?? undefined)
              : undefined;

          setGain(track, volumes[track]);
          getVoice(track)?.trigger(time, note);
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
 * Starts sequencer playback by syncing BPM and swing from the grid store,
 * creating a sequence if needed, and starting the Tone.js transport.
 */
export function startPlayback(): void {
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
export function stopPlayback(): void {
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
export function updateBpm(bpm: number): void {
  const Tone = getTone();
  Tone.getTransport().bpm.value = bpm;
}

/**
 * Disposes the current Tone.js Sequence and frees its resources.
 */
export function disposeSequence(): void {
  if (sequence) {
    sequence.dispose();
    sequence = null;
  }
}
