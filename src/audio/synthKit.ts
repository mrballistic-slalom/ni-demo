import type * as ToneTypes from 'tone';
import { getTone } from './tone';
import { createVoice, Voice } from './voice';
import { GenreKit, TrackCategory, TRACK_ORDER } from '@/types';

/** Minimal shape needed to connect a Voice's output into a downstream node. */
interface Connectable {
  connect(destination: unknown): unknown;
}

const voices: Partial<Record<TrackCategory, Voice>> = {};
const gains: Partial<Record<TrackCategory, ToneTypes.Gain>> = {};

/**
 * Builds the current genre's kit of audio voices, one per track, each routed
 * through its own `Tone.Gain` node into the master destination. Disposes any
 * previously built kit first so repeated genre switches don't leak nodes.
 * @param kit - Map of track category to voice specification for the genre.
 */
export async function buildKit(kit: GenreKit): Promise<void> {
  disposeKit();

  const Tone = getTone();

  for (const track of TRACK_ORDER) {
    const spec = kit[track];
    const voice = createVoice(spec);
    const gain = new Tone.Gain(1).connect(Tone.getDestination());
    (voice.output as Connectable).connect(gain);

    voices[track] = voice;
    gains[track] = gain;
  }

  await Tone.loaded();
}

/**
 * Returns the built {@link Voice} for a track, if a kit has been built.
 * @param track - The track category to look up.
 */
export function getVoice(track: TrackCategory): Voice | undefined {
  return voices[track];
}

/**
 * Returns the `Tone.Gain` node for a track, if a kit has been built.
 * @param track - The track category to look up.
 */
export function getGain(track: TrackCategory): ToneTypes.Gain | undefined {
  return gains[track];
}

/**
 * Sets a track's linear gain (0–1) on its `Tone.Gain` node.
 * @param track - The track category to adjust.
 * @param value - Linear gain value, typically 0–1.
 */
export function setGain(track: TrackCategory, value: number): void {
  const gain = gains[track];
  if (gain) {
    gain.gain.value = value;
  }
}

/**
 * Disposes every voice and gain node in the current kit and clears module
 * state. Safe to call when no kit has been built yet.
 */
export function disposeKit(): void {
  for (const track of TRACK_ORDER) {
    voices[track]?.dispose();
    gains[track]?.dispose();
    delete voices[track];
    delete gains[track];
  }
}
