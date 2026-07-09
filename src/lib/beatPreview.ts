import { GridState, STEPS_PER_BAR, TRACK_ORDER } from '@/types';

/**
 * Trims a decoded beat's grid down to its first bar ({@link STEPS_PER_BAR}
 * steps) per track, for a consistent-sized preview regardless of the
 * original pattern length. Shared by the on-page shared-beat preview
 * (`BeatContent`) and the dynamic OG image (`beat/og/route.tsx`) so the two
 * previews can't drift apart.
 * @param grid - The full decoded beat grid.
 * @returns A new grid with each track's steps truncated to the first bar.
 */
export function firstBar(grid: GridState): GridState {
  const trimmed = {} as GridState;
  for (const track of TRACK_ORDER) {
    trimmed[track] = grid[track].slice(0, STEPS_PER_BAR);
  }
  return trimmed;
}
