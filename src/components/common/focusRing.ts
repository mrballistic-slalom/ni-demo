import { css } from '@emotion/react';

/**
 * Shared keyboard-focus indicator: a 2px solid outline in the active genre
 * skin's `--genre-accent`. Used inside a `&:focus-visible` block by every
 * interactive control in the studio (icon buttons, faders, grid cells,
 * chips, sound rows) so the ring stays visually consistent across skins.
 * Pass a larger `offsetPx` for controls whose own visual edge needs more
 * breathing room before the ring starts.
 */
export function focusRing(offsetPx = 2) {
  return css`
    outline: 2px solid var(--genre-accent);
    outline-offset: ${offsetPx}px;
  `;
}
