import { describe, it, expect } from 'vitest';
import { GENRES, GENRE_LIST } from '@/data/genres';
import { TRACK_ORDER } from '@/types';
import { getSound } from '@/data/sounds';

describe('genres', () => {
  it('every template row is exactly 16 steps', () => {
    for (const g of GENRE_LIST) for (const t of TRACK_ORDER)
      expect(GENRES[g].template.grid[t]).toHaveLength(16);
  });
  it('note rows are length 16 for melody and bass', () => {
    for (const g of GENRE_LIST) {
      expect(GENRES[g].noteRows.melody).toHaveLength(16);
      expect(GENRES[g].noteRows.bass).toHaveLength(16);
    }
  });
  it('every default sound id resolves in the catalog', () => {
    for (const g of GENRE_LIST) for (const t of TRACK_ORDER)
      expect(getSound(GENRES[g].template.sounds[t])).toBeDefined();
  });
  it('has curly-punctuation taglines', () => {
    for (const g of GENRE_LIST) expect(GENRES[g].tagline).not.toMatch(/["']/);
  });
  it('has curly-punctuation hooks', () => {
    for (const g of GENRE_LIST) expect(GENRES[g].hook).not.toMatch(/["']/);
  });
  it('kit voice specs match the default sound selections in the catalog', () => {
    for (const g of GENRE_LIST) for (const t of TRACK_ORDER) {
      const expected = getSound(GENRES[g].template.sounds[t]);
      expect(GENRES[g].kit[t]).toEqual(expected?.spec);
    }
  });
  it('every genre has a non-empty tagline and hook', () => {
    for (const g of GENRE_LIST) {
      expect(GENRES[g].tagline.length).toBeGreaterThan(0);
      expect(GENRES[g].hook.length).toBeGreaterThan(0);
    }
  });
});
