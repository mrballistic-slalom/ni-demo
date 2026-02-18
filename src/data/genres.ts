import { Genre, GenreDefinition } from '@/types';

/**
 * Converts a pattern string to a numeric step array.
 * 'x' maps to 1 (active), any other character maps to 0 (inactive).
 * @param pattern - A string like `'x...x...'` representing a rhythmic pattern.
 * @returns Array of 0/1 values for each step.
 */
const p = (pattern: string): number[] => pattern.split('').map(c => c === 'x' ? 1 : 0);

/** Registry of all genre definitions keyed by genre ID, including display metadata, colors, and default beat templates. */
export const GENRES: Record<Genre, GenreDefinition> = {
  trap: {
    id: 'trap',
    label: 'Trap',
    description: 'Dark, hard-hitting',
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
      sounds: {
        kick: 'trap_kick_01',
        snare: 'trap_snare_01',
        hihat: 'trap_hihat_01',
        melody: 'trap_melody_01',
        bass: 'trap_bass_01',
        fx: 'trap_fx_01',
      },
      volumes: { kick: 0.85, snare: 0.75, hihat: 0.5, melody: 0.6, bass: 0.9, fx: 0.4 },
    },
  },

  lofi: {
    id: 'lofi',
    label: 'Lo-fi',
    description: 'Warm, dusty, chill',
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
      sounds: {
        kick: 'lofi_kick_01',
        snare: 'lofi_snare_01',
        hihat: 'lofi_hihat_01',
        melody: 'lofi_melody_01',
        bass: 'lofi_bass_01',
        fx: 'lofi_fx_01',
      },
      volumes: { kick: 0.7, snare: 0.6, hihat: 0.4, melody: 0.7, bass: 0.75, fx: 0.3 },
    },
  },

  house: {
    id: 'house',
    label: 'House',
    description: 'Driving, groovy',
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
        melody: p('x.......x.......'),
        bass:   p('x..x..x..x......'),
        fx:     p('........x.......'),
      },
      sounds: {
        kick: 'house_kick_01',
        snare: 'house_snare_01',
        hihat: 'house_hihat_01',
        melody: 'house_melody_01',
        bass: 'house_bass_01',
        fx: 'house_fx_01',
      },
      volumes: { kick: 0.85, snare: 0.7, hihat: 0.55, melody: 0.65, bass: 0.8, fx: 0.35 },
    },
  },

  drill: {
    id: 'drill',
    label: 'Drill',
    description: 'Aggressive, sliding bass',
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
      sounds: {
        kick: 'drill_kick_01',
        snare: 'drill_snare_01',
        hihat: 'drill_hihat_01',
        melody: 'drill_melody_01',
        bass: 'drill_bass_01',
        fx: 'drill_fx_01',
      },
      volumes: { kick: 0.8, snare: 0.75, hihat: 0.55, melody: 0.5, bass: 0.9, fx: 0.3 },
    },
  },

  hyperpop: {
    id: 'hyperpop',
    label: 'Hyperpop',
    description: 'Chaotic, detuned, glitchy',
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
      sounds: {
        kick: 'hyperpop_kick_01',
        snare: 'hyperpop_snare_01',
        hihat: 'hyperpop_hihat_01',
        melody: 'hyperpop_melody_01',
        bass: 'hyperpop_bass_01',
        fx: 'hyperpop_fx_01',
      },
      volumes: { kick: 0.8, snare: 0.7, hihat: 0.6, melody: 0.65, bass: 0.85, fx: 0.5 },
    },
  },
};

/** Ordered list of available genres for UI iteration. */
export const GENRE_LIST: Genre[] = ['trap', 'lofi', 'house', 'drill', 'hyperpop'];
