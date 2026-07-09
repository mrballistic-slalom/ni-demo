import { getTone, loadTone } from './tone';
import { createVoice, Voice } from './voice';
import { GENRES } from '@/data/genres';
import { getSound } from '@/data/sounds';
import { useGridStore } from '@/stores/useGridStore';
import { audioBufferToWav, AudioBufferLike } from '@/lib/wav';
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
 *
 * Set 3 dB below live (-9 vs -6): the offline `Tone.Limiter` has no lookahead,
 * so it lets sub-millisecond attack transients through — sustained, dense kits
 * (notably Lo-Fi's Rhodes pad + 808) briefly pegged the ceiling at -6. The
 * extra headroom keeps even those safely below 0 dBFS with zero clipped samples.
 */
const MASTER_HEADROOM_DB = -9;

/**
 * Safety-net ceiling (in decibels) for the offline master bus. Catches any
 * peak that still exceeds 0 dBFS after `MASTER_HEADROOM_DB` (e.g. an
 * unusually dense/loud pattern) with a fast limiter rather than letting the
 * summed signal hard-clip.
 */
const MASTER_LIMITER_THRESHOLD_DB = -1;

/**
 * Absolute peak-amplitude ceiling (linear, 0–1) enforced on the rendered
 * buffer as a final, content-independent guarantee. `Tone.Limiter` is a
 * fast compressor rather than a true brickwall limiter, so on extreme
 * (e.g. every-step-of-every-track) patterns transients can still poke above
 * 0 dBFS and hard-clip at the 16-bit PCM stage. This pass scans the rendered
 * peak and, only if it exceeds the ceiling, applies a single linear gain so
 * the exported peak is guaranteed ≤ this value with zero hard-clipping,
 * while preserving all relative dynamics (pure gain, no distortion).
 */
const PEAK_CEILING = 0.9;

/**
 * Computes the maximum absolute sample value across every channel of an
 * audio buffer.
 */
function bufferPeak(buffer: AudioBufferLike): number {
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
  }
  return peak;
}

/**
 * Returns an {@link AudioBufferLike} view of `buffer` with every sample
 * multiplied by `scale`, without mutating the source. When `scale` is 1 the
 * original channel data is returned as-is (no copy).
 */
function scaleBuffer(buffer: AudioBufferLike, scale: number): AudioBufferLike {
  return {
    numberOfChannels: buffer.numberOfChannels,
    sampleRate: buffer.sampleRate,
    length: buffer.length,
    getChannelData(channel: number): Float32Array {
      const src = buffer.getChannelData(channel);
      if (scale === 1) return src;
      const out = new Float32Array(src.length);
      for (let i = 0; i < src.length; i++) out[i] = src[i] * scale;
      return out;
    },
  };
}

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

  // Final peak-safety pass: guarantee the exported peak is ≤ PEAK_CEILING so
  // the 16-bit PCM encoder never hard-clips, regardless of pattern density.
  const peak = bufferPeak(rendered);
  const scale = peak > PEAK_CEILING ? PEAK_CEILING / peak : 1;
  const wavBuffer = audioBufferToWav(scaleBuffer(rendered, scale));
  return new Blob([wavBuffer], { type: 'audio/wav' });
}
