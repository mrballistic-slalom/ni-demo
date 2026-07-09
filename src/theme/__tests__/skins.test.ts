import { describe, it, expect } from 'vitest';
import { SKINS, skinToCssVars, skinEasingToBezier } from '@/theme/skins';
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

  describe('skinEasingToBezier', () => {
    it('parses every skin motion easing into a 4-number bezier tuple', () => {
      for (const g of GENRE_LIST) {
        const bezier = skinEasingToBezier(SKINS[g].motion.easing);
        expect(bezier).toHaveLength(4);
        for (const n of bezier) expect(typeof n).toBe('number');
      }
    });

    it('falls back to a default bezier for an unparseable easing string', () => {
      expect(skinEasingToBezier('ease-out')).toEqual([0.4, 0, 0.2, 1]);
      expect(skinEasingToBezier('cubic-bezier(nope)')).toEqual([0.4, 0, 0.2, 1]);
    });
  });
});
