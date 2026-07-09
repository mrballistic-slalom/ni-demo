import { Genre, GenreDefinition, GenreKit, SoundSelections, NoteRow, TRACK_ORDER } from '@/types';
import { getSound } from './sounds';

/**
 * Converts a pattern string to a numeric step array.
 * 'x' maps to 1 (active), any other character maps to 0 (inactive).
 * @param pattern - A string like `'x...x...'` representing a rhythmic pattern.
 * @returns Array of 0/1 values for each step.
 */
const p = (pattern: string): number[] => pattern.split('').map(c => c === 'x' ? 1 : 0);

/**
 * Builds a genre's default sound selections: every genre uses each track's
 * "01" catalog variant (e.g. `trap_kick_01`), so the id can be derived
 * rather than spelled out per track.
 */
function defaultSounds(genre: Genre): SoundSelections {
  const sounds = {} as SoundSelections;
  for (const track of TRACK_ORDER) {
    sounds[track] = `${genre}_${track}_01`;
  }
  return sounds;
}

/**
 * Builds a genre's `kit` from its template's default sound selections, so
 * the kit and template can never drift out of sync: each track's voice spec
 * is looked up live from the sound catalog rather than duplicated by hand.
 */
function kitFromSounds(sounds: SoundSelections): GenreKit {
  const kit = {} as GenreKit;
  for (const track of TRACK_ORDER) {
    const sound = getSound(sounds[track]);
    if (!sound) {
      throw new Error(`genres.ts: unknown default sound id "${sounds[track]}" for track "${track}"`);
    }
    kit[track] = sound.spec;
  }
  return kit;
}

// ── Trap ────────────────────────────────────────────────────────────────
const trapSounds: SoundSelections = defaultSounds('trap');
// F minor: sparse dark melody on the b6/root/b3, 808 sliding between root and fifth.
const trapMelody: NoteRow = [
  'Ab3', null, null, null, null, null, 'C4', null, null, null, 'Eb4', null, null, null, null, null,
];
const trapBass: NoteRow = [
  'F1', null, null, null, null, null, null, null, null, null, 'C2', null, null, null, null, null,
];

// ── Lo-Fi ───────────────────────────────────────────────────────────────
const lofiSounds: SoundSelections = defaultSounds('lofi');
// Cmaj7 arpeggio for the mellow keys, soft root-fifth bass.
const lofiMelody: NoteRow = [
  'C4', null, null, 'E4', null, null, 'G4', null, null, 'B4', null, null, 'E4', null, null, null,
];
const lofiBass: NoteRow = [
  'C2', null, null, null, null, null, null, null, 'G2', null, null, null, null, null, null, null,
];

// ── House ───────────────────────────────────────────────────────────────
const houseSounds: SoundSelections = defaultSounds('house');
// Bright chord stabs land on the off-beat 8ths; walking root/fifth bass under the four-on-the-floor kick.
const houseMelody: NoteRow = [
  null, null, 'C5', null, null, null, 'E5', null, null, null, 'G5', null, null, null, 'E5', null,
];
const houseBass: NoteRow = [
  'C2', null, null, 'G2', null, null, 'C2', null, null, 'E2', null, null, null, null, null, null,
];

// ── Drill ───────────────────────────────────────────────────────────────
const drillSounds: SoundSelections = defaultSounds('drill');
// G minor: gliding 808 between root and fifth (below), dark sparse keys.
const drillMelody: NoteRow = [
  'Bb3', null, null, null, null, null, null, null, null, null, null, null, 'D4', null, null, null,
];
const drillBass: NoteRow = [
  'G1', null, null, null, null, null, 'D1', null, null, null, null, null, null, null, null, null,
];

// ── Hyperpop ────────────────────────────────────────────────────────────
const hyperpopSounds: SoundSelections = defaultSounds('hyperpop');
// High, bright, pitched-up melody; bouncy octave-jumping 808 for the sugar-rush distortion.
const hyperpopMelody: NoteRow = [
  'C6', null, 'E6', null, null, null, 'G6', null, 'C6', null, null, null, 'E6', null, null, null,
];
const hyperpopBass: NoteRow = [
  'C2', null, null, null, 'C3', null, null, null, 'C2', null, null, null, 'C3', null, null, null,
];

/** Registry of all genre definitions keyed by genre ID, including display metadata, colors, and default beat templates. */
export const GENRES: Record<Genre, GenreDefinition> = {
  trap: {
    id: 'trap',
    label: 'Trap',
    description: 'Dark, hard-hitting',
    tagline: 'Booming 808s and rattling hats.',
    hook: 'Sliding sub-bass, triplet hi-hat rolls, space to swagger.',
    bpmRange: [130, 160],
    defaultBpm: 140,
    colorPrimary: '#FF1744',
    colorSecondary: '#1A0A0A',
    colorAccent: '#FF5252',
    template: {
      grid: {
        kick:   p('x.......x.......'),
        snare:  p('....x.......x...'),
        hihat:  p('x.x.x.x.x.x.x.x.'),
        melody: p('x.....x...x.....'),
        bass:   p('x.........x.....'),
        fx:     p('...............x'),
      },
      sounds: trapSounds,
      volumes: { kick: 0.85, snare: 0.75, hihat: 0.5, melody: 0.6, bass: 0.9, fx: 0.4 },
    },
    kit: kitFromSounds(trapSounds),
    noteRows: { melody: trapMelody, bass: trapBass },
  },

  lofi: {
    id: 'lofi',
    label: 'Lo-fi',
    description: 'Warm, dusty, chill',
    tagline: 'Dusty keys, lazy swing, a rainy afternoon.',
    hook: 'Detuned Rhodes, vinyl hiss, soft off-grid drums.',
    bpmRange: [70, 90],
    defaultBpm: 80,
    colorPrimary: '#FFB74D',
    colorSecondary: '#1A150A',
    colorAccent: '#FFD54F',
    template: {
      grid: {
        kick:   p('x.....x.x.......'),
        snare:  p('....x.......x...'),
        hihat:  p('..x...x...x...x.'),
        melody: p('x..x..x..x..x...'),
        bass:   p('x.......x.......'),
        fx:     p('x...............'),
      },
      sounds: lofiSounds,
      volumes: { kick: 0.7, snare: 0.6, hihat: 0.4, melody: 0.7, bass: 0.75, fx: 0.3 },
    },
    kit: kitFromSounds(lofiSounds),
    noteRows: { melody: lofiMelody, bass: lofiBass },
  },

  house: {
    id: 'house',
    label: 'House',
    description: 'Driving, groovy',
    tagline: 'Four-on-the-floor, built for 2 a.m.',
    hook: 'Punchy kick every beat, off-beat open hats, bright chord stabs.',
    bpmRange: [120, 128],
    defaultBpm: 124,
    colorPrimary: '#7C4DFF',
    colorSecondary: '#0A0A1A',
    colorAccent: '#B388FF',
    template: {
      grid: {
        kick:   p('x...x...x...x...'),
        snare:  p('....x.......x...'),
        hihat:  p('.x.x.x.x.x.x.x.x'),
        melody: p('..x...x...x...x.'),
        bass:   p('x..x..x..x......'),
        fx:     p('........x.......'),
      },
      sounds: houseSounds,
      volumes: { kick: 0.85, snare: 0.7, hihat: 0.55, melody: 0.65, bass: 0.8, fx: 0.35 },
    },
    kit: kitFromSounds(houseSounds),
    noteRows: { melody: houseMelody, bass: houseBass },
  },

  drill: {
    id: 'drill',
    label: 'Drill',
    description: 'Aggressive, sliding bass',
    tagline: 'Sliding sub and skittering triplets. Menace.',
    hook: 'Gliding 808, dark keys, stuttering hats.',
    bpmRange: [140, 145],
    defaultBpm: 142,
    colorPrimary: '#00E676',
    colorSecondary: '#0A1A0A',
    colorAccent: '#69F0AE',
    template: {
      grid: {
        kick:   p('x.....x.....x...'),
        snare:  p('....x.......x...'),
        hihat:  p('x.xxx.xxx.xxx.xx'),
        melody: p('x...........x...'),
        bass:   p('x.....x.........'),
        fx:     p('................'),
      },
      sounds: drillSounds,
      volumes: { kick: 0.8, snare: 0.75, hihat: 0.55, melody: 0.5, bass: 0.9, fx: 0.3 },
    },
    kit: kitFromSounds(drillSounds),
    noteRows: { melody: drillMelody, bass: drillBass },
  },

  hyperpop: {
    id: 'hyperpop',
    label: 'Hyperpop',
    description: 'Chaotic, detuned, glitchy',
    tagline: 'Detuned, sugar-rushed, gloriously too much.',
    hook: 'Pitched-up, distorted, glitchy, maximal.',
    bpmRange: [140, 170],
    defaultBpm: 155,
    colorPrimary: '#FF4081',
    colorSecondary: '#1A0A14',
    colorAccent: '#FF80AB',
    template: {
      grid: {
        kick:   p('x..x..x..x..x...'),
        snare:  p('....x..x....x..x'),
        hihat:  p('xxx.xxx.xxx.xxx.'),
        melody: p('x.x...x.x...x...'),
        bass:   p('x...x...x...x...'),
        fx:     p('..x...x...x...x.'),
      },
      sounds: hyperpopSounds,
      volumes: { kick: 0.8, snare: 0.7, hihat: 0.6, melody: 0.65, bass: 0.85, fx: 0.5 },
    },
    kit: kitFromSounds(hyperpopSounds),
    noteRows: { melody: hyperpopMelody, bass: hyperpopBass },
  },
};

/** Ordered list of available genres for UI iteration. */
export const GENRE_LIST: Genre[] = ['trap', 'lofi', 'house', 'drill', 'hyperpop'];
