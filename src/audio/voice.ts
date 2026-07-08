import { getTone } from './tone';
import type { VoiceSpec, SampleVoiceSpec, SynthVoiceSpec } from '@/types';

/** Default note used when a synth voice is triggered without an explicit note. */
const DEFAULT_NOTE = 'C2';

/**
 * A playable audio voice built from a {@link VoiceSpec}. Abstracts over
 * sample-based playback (Tone.Player) and synthesized playback (Tone
 * synths) behind a single trigger interface.
 */
export interface Voice {
  /**
   * Triggers playback of the voice at the given transport time.
   * @param time - The Tone.js transport time (seconds) to schedule playback at.
   * @param note - Optional note name (e.g. 'C2'). Ignored by sample voices.
   * @param velocity - Optional velocity/gain, reserved for future use.
   */
  trigger(time: number, note?: string | null, velocity?: number): void;
  /** The underlying Tone.js node, left unconnected — the owner (synthKit) routes it output → gain → destination. */
  output: unknown;
  /** Releases underlying Tone.js resources. */
  dispose(): void;
  /** Whether the voice is ready to play (e.g. sample has loaded). */
  readonly ready: boolean;
}

/**
 * A {@link Voice} that plays back a single audio sample via `Tone.Player`.
 * Notes are ignored since sample playback has a fixed pitch.
 */
class SampleVoice implements Voice {
  private player: import('tone').Player;

  constructor(spec: SampleVoiceSpec) {
    const Tone = getTone();
    // Left unconnected; synthKit routes output → per-track gain → destination.
    this.player = new Tone.Player(spec.url);
  }

  trigger(time: number): void {
    this.player.start(time);
  }

  get output(): unknown {
    return this.player;
  }

  dispose(): void {
    this.player.dispose();
  }

  get ready(): boolean {
    return Boolean(this.player.loaded);
  }
}

type ToneSynthInstance = {
  toDestination(): ToneSynthInstance;
  triggerAttackRelease(note: string, duration: string, time: number, velocity?: number): void;
  dispose(): void;
  portamento?: number;
};

/**
 * A {@link Voice} that plays back a synthesized instrument (mono808, fm, or
 * poly) via the corresponding Tone.js synth class.
 */
class SynthVoice implements Voice {
  private synth: ToneSynthInstance;

  constructor(spec: SynthVoiceSpec) {
    const Tone = getTone();
    let instance: ToneSynthInstance;
    switch (spec.synth) {
      case 'mono808':
        instance = new Tone.MonoSynth(spec.options) as unknown as ToneSynthInstance;
        if (spec.portamento !== undefined) {
          instance.portamento = spec.portamento;
        }
        break;
      case 'fm':
        instance = new Tone.FMSynth(spec.options) as unknown as ToneSynthInstance;
        break;
      case 'poly':
        instance = new Tone.PolySynth(Tone.Synth, spec.options) as unknown as ToneSynthInstance;
        break;
      default:
        throw new Error(`Unknown synth kind: ${spec.synth as string}`);
    }
    // Left unconnected; synthKit routes output → per-track gain → destination.
    this.synth = instance;
  }

  trigger(time: number, note?: string | null, velocity?: number): void {
    this.synth.triggerAttackRelease(note ?? DEFAULT_NOTE, '16n', time, velocity);
  }

  get output(): unknown {
    return this.synth;
  }

  dispose(): void {
    this.synth.dispose();
  }

  get ready(): boolean {
    return true;
  }
}

/**
 * Builds a {@link Voice} from a {@link VoiceSpec}, dispatching to
 * {@link SampleVoice} or {@link SynthVoice} based on `spec.kind`.
 * @param spec - The voice specification (sample or synth).
 * @returns A ready-to-trigger Voice instance.
 */
export function createVoice(spec: VoiceSpec): Voice {
  switch (spec.kind) {
    case 'sample':
      return new SampleVoice(spec);
    case 'synth':
      return new SynthVoice(spec);
    default:
      throw new Error(`Unknown voice kind: ${(spec as VoiceSpec).kind}`);
  }
}

export { SampleVoice, SynthVoice };
