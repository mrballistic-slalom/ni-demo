import { SoundVariant, Genre, TrackCategory, VoiceSpec } from '@/types';

/**
 * Builds the three sample-backed variants for a percussive/fx category
 * (kick, snare, hihat, fx), pointing at the genre-distinct one-shot WAVs
 * rendered by `scripts/renderSounds.mjs` (Task 9a) at
 * `/sounds/<genre>/<genre>_<category>_<nn>.wav`.
 */
function sampleVariants(
  genre: Genre,
  category: TrackCategory,
  names: [string, string, string]
): SoundVariant[] {
  return names.map((name, i) => {
    const nn = String(i + 1).padStart(2, '0');
    const id = `${genre}_${category}_${nn}`;
    return {
      id,
      name,
      category,
      genre,
      spec: { kind: 'sample', url: `/sounds/${genre}/${genre}_${category}_${nn}.wav` },
    };
  });
}

/** Builds a single synth-backed melody or bass variant. */
function synthVariant(
  genre: Genre,
  category: 'melody' | 'bass',
  nn: string,
  name: string,
  spec: VoiceSpec
): SoundVariant {
  return { id: `${genre}_${category}_${nn}`, name, category, genre, spec };
}

/** Complete catalog of all selectable sounds across every genre and track category. */
export const SOUND_CATALOG: SoundVariant[] = [
  // ── Trap ──────────────────────────────────────────────────
  ...sampleVariants('trap', 'kick', ['Trap Deep Kick', 'Trap Punchy Kick', 'Trap Tight Kick']),
  ...sampleVariants('trap', 'snare', ['Trap Crack Snare', 'Trap Rim Snare', 'Trap Soft Snare']),
  ...sampleVariants('trap', 'hihat', ['Trap Closed Hat', 'Trap Open Hat', 'Trap Pedal Hat']),
  ...sampleVariants('trap', 'fx', ['Trap Riser', 'Trap Impact', 'Trap Sweep']),
  synthVariant('trap', 'melody', '01', 'Trap Dark Pad', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'triangle' }, envelope: { attack: 0.4, decay: 0.3, sustain: 0.6, release: 1.5 } },
  }),
  synthVariant('trap', 'melody', '02', 'Trap Bright Keys', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.6 } },
  }),
  synthVariant('trap', 'melody', '03', 'Trap Soft Pluck', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.005, decay: 0.15, sustain: 0.05, release: 0.3 } },
  }),
  synthVariant('trap', 'bass', '01', 'Trap Deep 808', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.8, release: 1.2 } },
    portamento: 0.08,
  }),
  synthVariant('trap', 'bass', '02', 'Trap Sub 808', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.2, sustain: 0.9, release: 1.5 } },
    portamento: 0.12,
  }),
  synthVariant('trap', 'bass', '03', 'Trap Round Bass', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.25, sustain: 0.6, release: 0.9 } },
    portamento: 0.05,
  }),

  // ── Lo-fi ─────────────────────────────────────────────────
  ...sampleVariants('lofi', 'kick', ['Lo-fi Deep Kick', 'Lo-fi Punchy Kick', 'Lo-fi Tight Kick']),
  ...sampleVariants('lofi', 'snare', ['Lo-fi Crack Snare', 'Lo-fi Rim Snare', 'Lo-fi Soft Snare']),
  ...sampleVariants('lofi', 'hihat', ['Lo-fi Closed Hat', 'Lo-fi Open Hat', 'Lo-fi Pedal Hat']),
  ...sampleVariants('lofi', 'fx', ['Lo-fi Riser', 'Lo-fi Impact', 'Lo-fi Sweep']),
  synthVariant('lofi', 'melody', '01', 'Lo-fi Warm Rhodes', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'sine' }, envelope: { attack: 0.05, decay: 0.4, sustain: 0.5, release: 2.0 } },
  }),
  synthVariant('lofi', 'melody', '02', 'Lo-fi Dusty Keys', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.4 } },
  }),
  synthVariant('lofi', 'melody', '03', 'Lo-fi Mellow Pluck', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.25, sustain: 0.1, release: 0.8 } },
  }),
  synthVariant('lofi', 'bass', '01', 'Lo-fi Deep Bass', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'sine' }, envelope: { attack: 0.03, decay: 0.3, sustain: 0.7, release: 1.2 } },
    portamento: 0.02,
  }),
  synthVariant('lofi', 'bass', '02', 'Lo-fi Sub Bass', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'sine' }, envelope: { attack: 0.02, decay: 0.25, sustain: 0.85, release: 1.6 } },
  }),
  synthVariant('lofi', 'bass', '03', 'Lo-fi Round Bass', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'triangle' }, envelope: { attack: 0.04, decay: 0.3, sustain: 0.6, release: 1.0 } },
  }),

  // ── House ─────────────────────────────────────────────────
  ...sampleVariants('house', 'kick', ['House Deep Kick', 'House Punchy Kick', 'House Tight Kick']),
  ...sampleVariants('house', 'snare', ['House Crack Snare', 'House Rim Snare', 'House Soft Snare']),
  ...sampleVariants('house', 'hihat', ['House Closed Hat', 'House Open Hat', 'House Pedal Hat']),
  ...sampleVariants('house', 'fx', ['House Riser', 'House Impact', 'House Sweep']),
  synthVariant('house', 'melody', '01', 'House Bright Stab', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.3 } },
  }),
  synthVariant('house', 'melody', '02', 'House Piano Keys', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 0.7 } },
  }),
  synthVariant('house', 'melody', '03', 'House Pluck Lead', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'square' }, envelope: { attack: 0.002, decay: 0.1, sustain: 0.05, release: 0.2 } },
  }),
  synthVariant('house', 'bass', '01', 'House Deep Bass', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.5 } },
  }),
  synthVariant('house', 'bass', '02', 'House Punchy Bass', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'square' }, envelope: { attack: 0.005, decay: 0.15, sustain: 0.5, release: 0.3 } },
  }),
  synthVariant('house', 'bass', '03', 'House Round Bass', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.65, release: 0.6 } },
  }),

  // ── Drill ─────────────────────────────────────────────────
  ...sampleVariants('drill', 'kick', ['Drill Deep Kick', 'Drill Punchy Kick', 'Drill Tight Kick']),
  ...sampleVariants('drill', 'snare', ['Drill Crack Snare', 'Drill Rim Snare', 'Drill Soft Snare']),
  ...sampleVariants('drill', 'hihat', ['Drill Closed Hat', 'Drill Open Hat', 'Drill Pedal Hat']),
  ...sampleVariants('drill', 'fx', ['Drill Riser', 'Drill Impact', 'Drill Sweep']),
  synthVariant('drill', 'melody', '01', 'Drill Dark Pad', {
    kind: 'synth',
    synth: 'fm',
    options: { harmonicity: 1.5, modulationIndex: 3, envelope: { attack: 0.3, decay: 0.4, sustain: 0.5, release: 1.5 } },
  }),
  synthVariant('drill', 'melody', '02', 'Drill Cold Keys', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.6 } },
  }),
  synthVariant('drill', 'melody', '03', 'Drill Sparse Pluck', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.003, decay: 0.12, sustain: 0.05, release: 0.25 } },
  }),
  synthVariant('drill', 'bass', '01', 'Drill Slide 808', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.85, release: 1.4 } },
    portamento: 0.18,
  }),
  synthVariant('drill', 'bass', '02', 'Drill Sub Slide', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.25, sustain: 0.9, release: 1.6 } },
    portamento: 0.22,
  }),
  synthVariant('drill', 'bass', '03', 'Drill Round Bass', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'triangle' }, envelope: { attack: 0.015, decay: 0.28, sustain: 0.7, release: 1.0 } },
    portamento: 0.1,
  }),

  // ── Hyperpop ──────────────────────────────────────────────
  ...sampleVariants('hyperpop', 'kick', ['Hyperpop Deep Kick', 'Hyperpop Punchy Kick', 'Hyperpop Tight Kick']),
  ...sampleVariants('hyperpop', 'snare', ['Hyperpop Crack Snare', 'Hyperpop Rim Snare', 'Hyperpop Soft Snare']),
  ...sampleVariants('hyperpop', 'hihat', ['Hyperpop Closed Hat', 'Hyperpop Open Hat', 'Hyperpop Pedal Hat']),
  ...sampleVariants('hyperpop', 'fx', ['Hyperpop Riser', 'Hyperpop Impact', 'Hyperpop Sweep']),
  synthVariant('hyperpop', 'melody', '01', 'Hyperpop Glitch Bell', {
    kind: 'synth',
    synth: 'fm',
    options: { harmonicity: 3.5, modulationIndex: 8, envelope: { attack: 0.002, decay: 0.3, sustain: 0.1, release: 0.5 } },
  }),
  synthVariant('hyperpop', 'melody', '02', 'Hyperpop Bright Keys', {
    kind: 'synth',
    synth: 'poly',
    options: { oscillator: { type: 'square' }, envelope: { attack: 0.005, decay: 0.15, sustain: 0.3, release: 0.4 } },
  }),
  synthVariant('hyperpop', 'melody', '03', 'Hyperpop Sparkle Pluck', {
    kind: 'synth',
    synth: 'fm',
    options: { harmonicity: 5, modulationIndex: 12, envelope: { attack: 0.001, decay: 0.1, sustain: 0.02, release: 0.2 } },
  }),
  synthVariant('hyperpop', 'bass', '01', 'Hyperpop Distorted 808', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.6 } },
    portamento: 0.05,
  }),
  synthVariant('hyperpop', 'bass', '02', 'Hyperpop Squeaky Sub', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'square' }, envelope: { attack: 0.005, decay: 0.15, sustain: 0.6, release: 0.4 } },
  }),
  synthVariant('hyperpop', 'bass', '03', 'Hyperpop Round Bass', {
    kind: 'synth',
    synth: 'mono808',
    options: { oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.65, release: 0.5 } },
  }),
];

/**
 * Retrieves all sound variants matching a given genre and track category.
 * @param genre - The genre to filter by.
 * @param category - The track category to filter by.
 * @returns Array of matching sound variants.
 */
export function getSounds(genre: Genre, category: TrackCategory): SoundVariant[] {
  return SOUND_CATALOG.filter((s) => s.genre === genre && s.category === category);
}

/**
 * Looks up a single sound variant by its unique ID.
 * @param id - The sound ID (e.g., `'trap_kick_01'`).
 * @returns The matching sound variant, or `undefined` if not found.
 */
export function getSound(id: string): SoundVariant | undefined {
  return SOUND_CATALOG.find((s) => s.id === id);
}

/**
 * Returns the resolved sample URL for a sound variant, or an empty string
 * for synth-backed variants (which have no audio file to load).
 * @param sound - The sound variant to resolve.
 * @returns Absolute URL path to the audio file, or `''` for synth variants.
 */
export function getSoundUrl(sound: SoundVariant): string {
  return sound.spec.kind === 'sample' ? sound.spec.url : '';
}
