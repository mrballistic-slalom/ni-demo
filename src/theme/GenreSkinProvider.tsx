'use client';

import { useGridStore } from '@/stores/useGridStore';
import { SKINS, skinToCssVars } from '@/theme/skins';
import { DISPLAY_FONT_CLASS } from '@/theme/fonts';

/**
 * Applies the active genre's skin as CSS custom properties on a wrapping
 * `<div data-genre>`, and swaps in that genre's display font class. All
 * genre-aware styling downstream (Emotion `styled()` components) should
 * read the `--genre-*` custom properties rather than reaching into the
 * store directly, so genre switches repaint via CSS rather than re-render.
 */
export default function GenreSkinProvider({ children }: { children: React.ReactNode }) {
  const genre = useGridStore((s) => s.genre);
  const skin = SKINS[genre];
  const vars = skinToCssVars(skin);

  return (
    <div
      data-genre={genre}
      className={DISPLAY_FONT_CLASS[genre]}
      style={{
        ...vars,
        background: 'var(--genre-bg)',
        minHeight: '100dvh',
        transition: 'background 0.4s ease, color 0.4s ease',
      }}
    >
      {children}
    </div>
  );
}
