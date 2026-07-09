import { describe, it, expect } from 'vitest';
import { firstBar } from '@/lib/beatPreview';
import { GridState, STEPS_PER_BAR, TRACK_ORDER } from '@/types';

/** Builds a grid where every track's row is `[0, 1, 2, ..., length - 1]`, so truncation is easy to assert on. */
function makeGrid(length: number): GridState {
  const grid = {} as GridState;
  for (const track of TRACK_ORDER) {
    grid[track] = Array.from({ length }, (_, i) => i);
  }
  return grid;
}

describe('firstBar', () => {
  it('truncates each track to the first STEPS_PER_BAR steps', () => {
    const grid = makeGrid(STEPS_PER_BAR * 2);
    const trimmed = firstBar(grid);

    for (const track of TRACK_ORDER) {
      expect(trimmed[track]).toHaveLength(STEPS_PER_BAR);
      expect(trimmed[track]).toEqual(grid[track].slice(0, STEPS_PER_BAR));
    }
  });

  it('leaves a grid already at exactly one bar unchanged', () => {
    const grid = makeGrid(STEPS_PER_BAR);
    expect(firstBar(grid)).toEqual(grid);
  });
});
