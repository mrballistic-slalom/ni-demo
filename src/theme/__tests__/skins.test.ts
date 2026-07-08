import { describe, it, expect } from 'vitest';
import { SKINS, skinToCssVars } from '@/theme/skins';
import { GENRE_LIST } from '@/data/genres';

describe('skins', () => {
  it('defines a skin for every genre', () => {
    for (const g of GENRE_LIST) expect(SKINS[g]).toBeDefined();
  });
  it('emits genre CSS custom properties', () => {
    const vars = skinToCssVars(SKINS.trap);
    expect(vars['--genre-primary']).toMatch(/^#|rgb|hsl/);
    expect(vars['--genre-cell-on']).toBeTruthy();
    expect(vars['--genre-cell-off']).toBeTruthy();
    expect(vars['--genre-bg']).toBeTruthy();
  });
});
