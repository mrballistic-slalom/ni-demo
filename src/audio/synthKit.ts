import type * as ToneTypes from 'tone';
import { getTone } from './tone';
import { createVoice, Voice } from './voice';
import { GenreKit, TrackCategory, TRACK_ORDER, VoiceSpec } from '@/types';

/** Minimal shape needed to connect a Voice's output into a downstream node. */
interface Connectable {
  connect(destination: unknown): unknown;
}

const voices: Partial<Record<TrackCategory, Voice>> = {};
const gains: Partial<Record<TrackCategory, ToneTypes.Gain>> = {};

/**
 * Returns the track's existing `Tone.Gain` node, or creates one (wired to
 * the master destination) if the track doesn't have one yet. Shared by
 * {@link buildKit} and {@link setVoice} so a track's gain/mute level
 * survives both a full kit rebuild and a single-sound swap.
 */
function ensureGain(track: TrackCategory, Tone: typeof ToneTypes): ToneTypes.Gain {
  let gain = gains[track];
  if (!gain) {
    gain = new Tone.Gain(1);
    gain.connect(Tone.getDestination());
    gains[track] = gain;
  }
  return gain;
}

/**
 * Builds the current genre's kit of audio voices, one per track, each routed
 * through its own `Tone.Gain` node into the master destination. Disposes any
 * previously built kit first so repeated genre switches don't leak nodes.
 * Tracks with no resolvable spec are simply skipped (left silent) rather
 * than throwing.
 * @param kit - Map of track category to voice specification for the genre.
 *   May be partial — a track missing from it is skipped.
 */
export async function buildKit(kit: Partial<GenreKit>): Promise<void> {
  disposeKit();

  const Tone = getTone();

  for (const track of TRACK_ORDER) {
    const spec = kit[track];
    if (!spec) continue;

    const voice = createVoice(spec);
    const gain = ensureGain(track, Tone);
    (voice.output as Connectable).connect(gain);

    voices[track] = voice;
  }

  await Tone.loaded();
}

/**
 * Replaces a single track's voice in place, without rebuilding the whole
 * kit. Disposes the track's existing voice (if any) and creates a new one
 * from `spec`, reconnecting it through the track's existing `Tone.Gain`
 * node (creating one if the kit hasn't been built yet). This preserves the
 * track's current gain/mute level across a sound swap.
 * @param track - The track category whose voice should be replaced.
 * @param spec - The new voice specification to build and connect.
 */
export async function setVoice(track: TrackCategory, spec: VoiceSpec): Promise<void> {
  const Tone = getTone();

  voices[track]?.dispose();

  const voice = createVoice(spec);
  const gain = ensureGain(track, Tone);
  (voice.output as Connectable).connect(gain);

  voices[track] = voice;

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
