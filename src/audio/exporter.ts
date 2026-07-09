import { getTone, loadTone } from './tone';
import { createVoice, Voice } from './voice';
import { GENRES } from '@/data/genres';
import { getSound } from '@/data/sounds';
import { useGridStore } from '@/stores/useGridStore';
import { audioBufferToWav } from '@/lib/wav';
import { TRACK_ORDER, STEPS_PER_BAR, TrackCategory, VoiceSpec } from '@/types';

/** Minimal shape needed to connect a Voice's output into a downstream node. */
interface Connectable {
  connect(destination: unknown): unknown;
}

/**
 * Extra tail time (seconds) appended after the last scheduled step so long
 * synth releases (e.g. pad/808 envelopes) aren't cut off mid-decay.
 */
const RELEASE_TAIL_SECONDS = 2;

/**
 * Master headroom applied to the offline render, in decibels. Matches the
 * live engine's `Tone.getDestination().volume.value = -6` (see
 * `./engine.ts`'s `initAudio`) so a dense pattern that sums close to 0 dBFS
 * live is rendered at the same relative level in the export, rather than
 * hard-clipping because the offline bus summed voices straight to 1.0.
 */
const MASTER_HEADROOM_DB = -6;

/**
 * Safety-net ceiling (in decibels) for the offline master bus. Catches any
 * peak that still exceeds 0 dBFS after `MASTER_HEADROOM_DB` (e.g. an
 * unusually dense/loud pattern) with a fast limiter rather than letting the
 * summed signal hard-clip.
 */
const MASTER_LIMITER_THRESHOLD_DB = -1;

/**
 * Resolves the voice spec for every track using the same priority as the
 * live engine's `loadAllSounds` (in `./soundLoader`): the grid store's
 * currently selected sound ID first, falling back to the genre's static kit
 * definition, so the export matches what's actually assigned to each track
 * in the UI.
 */
function resolveKit(
  genre: ReturnType<typeof useGridStore.getState>['genre'],
  sounds: ReturnType<typeof useGridStore.getState>['sounds']
): Partial<Record<TrackCategory, VoiceSpec>> {
  const genreKit = GENRES[genre].kit;
  const kit: Partial<Record<TrackCategory, VoiceSpec>> = {};
  for (const track of TRACK_ORDER) {
    const spec = getSound(sounds[track])?.spec ?? genreKit?.[track];
    if (spec) kit[track] = spec;
  }
  return kit;
}

/**
 * Renders the current beat (as held in {@link useGridStore}) to a WAV file
 * using an `OfflineAudioContext` (via `Tone.Offline`), mirroring the live
 * sequencer's scheduling logic — steps, swing, mute/solo, and melody/bass
 * notes — so the export matches what's heard during playback. Reuses the
 * same voice specs and `createVoice` factory as the live engine.
 * @returns A `Blob` of type `audio/wav` containing the rendered beat.
 */
export async function renderToWav(): Promise<Blob> {
  await loadTone();
  const Tone = getTone();

  const { genre, bpm, patternLength, swing, grid, sounds, volumes, mutes, solos } =
    useGridStore.getState();

  const kit = resolveKit(genre, sounds);
  const totalSteps = patternLength * STEPS_PER_BAR;
  const secondsPerStep = 60 / bpm / 4; // duration of a 16th note
  const duration = totalSteps * secondsPerStep + RELEASE_TAIL_SECONDS;
  const hasSolo = TRACK_ORDER.some((t) => solos[t]);

  const rendered = await Tone.Offline(async ({ transport }) => {
    const offlineTone = getTone();
    transport.bpm.value = bpm;
    transport.swing = swing / 200;

    const voices: Partial<Record<TrackCategory, Voice>> = {};

    // Master bus: mirrors live playback's -6dB destination headroom (see
    // `MASTER_HEADROOM_DB` above), then a gentle limiter as a hard-clip
    // safety net for anything that still peaks over 0 dBFS after that.
    const master = new offlineTone.Volume(MASTER_HEADROOM_DB)
      .connect(new offlineTone.Limiter(MASTER_LIMITER_THRESHOLD_DB))
      .toDestination();

    for (const track of TRACK_ORDER) {
      const spec = kit[track];
      if (!spec) continue;

      const voice = createVoice(spec);
      const gain = new offlineTone.Gain(volumes[track]).connect(master);
      (voice.output as Connectable).connect(gain);
      voices[track] = voice;
    }

    // Wait for any sample buffers (Tone.Player) to finish decoding before the
    // offline context starts clocking forward — matches buildKit's pattern.
    await offlineTone.loaded();

    const stepIndices = Array.from({ length: totalSteps }, (_, i) => i);
    const sequence = new offlineTone.Sequence(
      (time, step) => {
        for (const track of TRACK_ORDER) {
          if (mutes[track]) continue;
          if (hasSolo && !solos[track]) continue;

          if (grid[track][step] === 1) {
            const note =
              track === 'melody' || track === 'bass'
                ? (GENRES[genre].noteRows?.[track]?.[step % STEPS_PER_BAR] ?? undefined)
                : undefined;

            voices[track]?.trigger(time, note);
          }
        }
      },
      stepIndices,
      '16n'
    );
    sequence.loop = false;
    sequence.start(0);
    transport.start(0);
  }, duration);

  const wavBuffer = audioBufferToWav(rendered);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}
