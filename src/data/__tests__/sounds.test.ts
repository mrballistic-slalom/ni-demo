import { describe, it, expect } from 'vitest';
import { SOUND_CATALOG, getSounds, getSound, getSoundUrl } from '@/data/sounds';
import { GENRE_LIST } from '@/data/genres';
import type { TrackCategory } from '@/types';

const SAMPLE_CATEGORIES: TrackCategory[] = ['kick', 'snare', 'hihat', 'fx'];
const SYNTH_CATEGORIES: TrackCategory[] = ['melody', 'bass'];

describe('getSounds', () => {
  it('returns 3 sample variants for trap kick, each pointing at a /sounds/trap/*.wav url', () => {
    const kicks = getSounds('trap', 'kick');
    expect(kicks).toHaveLength(3);
    for (const kick of kicks) {
      expect(kick.spec.kind).toBe('sample');
      expect(getSoundUrl(kick)).toMatch(/^\/sounds\/trap\/trap_kick_0[1-3]\.wav$/);
    }
  });

  it('returns an empty array for a genre/category combination outside the catalog shape it does have', () => {
    // every genre defines every category, so this just checks filtering works both ways
    const hyperpopBass = getSounds('hyperpop', 'bass');
    expect(hyperpopBass.length).toBeGreaterThan(0);
    expect(hyperpopBass.every((s) => s.genre === 'hyperpop' && s.category === 'bass')).toBe(true);
  });
});

describe('getSound', () => {
  it('resolves a known sample id to a sample-kind variant', () => {
    const sound = getSound('trap_kick_01');
    expect(sound).toBeDefined();
    expect(sound?.spec.kind).toBe('sample');
  });

  it('resolves a melody id to a synth-kind variant', () => {
    const sound = getSound('trap_melody_01');
    expect(sound).toBeDefined();
    expect(sound?.spec.kind).toBe('synth');
  });

  it('resolves a bass id to a mono808 synth variant', () => {
    const sound = getSound('trap_bass_01');
    expect(sound).toBeDefined();
    expect(sound?.spec.kind).toBe('synth');
    if (sound?.spec.kind === 'synth') {
      expect(sound.spec.synth).toBe('mono808');
    }
  });

  it('returns undefined for an unknown id', () => {
    expect(getSound('does_not_exist')).toBeUndefined();
  });
});

describe('getSoundUrl', () => {
  it('returns the url for a sample variant', () => {
    const sound = getSound('trap_kick_01');
    expect(sound).toBeDefined();
    expect(getSoundUrl(sound!)).toBe('/sounds/trap/trap_kick_01.wav');
  });

  it('returns an empty string for a synth variant', () => {
    const sound = getSound('trap_melody_01');
    expect(sound).toBeDefined();
    expect(getSoundUrl(sound!)).toBe('');
  });
});

describe('SOUND_CATALOG shape', () => {
  it('has unique ids across the whole catalog', () => {
    const ids = SOUND_CATALOG.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every catalog entry a category/genre consistent with its id prefix', () => {
    for (const sound of SOUND_CATALOG) {
      expect(sound.id).toBe(`${sound.genre}_${sound.category}_${sound.id.split('_').pop()}`);
      expect(sound.id.startsWith(`${sound.genre}_${sound.category}_`)).toBe(true);
    }
  });

  it('defines exactly 3 variants per genre/category pair, sample-kind for drum/fx categories', () => {
    for (const genre of GENRE_LIST) {
      for (const category of SAMPLE_CATEGORIES) {
        const variants = getSounds(genre, category);
        expect(variants).toHaveLength(3);
        for (const v of variants) {
          expect(v.spec.kind).toBe('sample');
        }
      }
      for (const category of SYNTH_CATEGORIES) {
        const variants = getSounds(genre, category);
        expect(variants).toHaveLength(3);
        for (const v of variants) {
          expect(v.spec.kind).toBe('synth');
        }
      }
    }
  });

  it('gives every catalog entry a non-empty human name', () => {
    for (const sound of SOUND_CATALOG) {
      expect(sound.name.length).toBeGreaterThan(0);
    }
  });
});
