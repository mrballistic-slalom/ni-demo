'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, useReducedMotion } from 'motion/react';
import { GridState, TRACK_ORDER, STEPS_PER_BAR } from '@/types';

const Grid = styled.div<{ $cell: number; $gap: number }>`
  display: grid;
  grid-template-columns: repeat(${STEPS_PER_BAR}, ${(p) => p.$cell}px);
  grid-auto-rows: ${(p) => p.$cell}px;
  gap: ${(p) => p.$gap}px;
`;

const Cell = styled(motion.div)`
  border-radius: var(--genre-cell-radius, 3px);
`;

export interface MiniGridProps {
  /** Full 6-track step grid to render (e.g. a genre's `template.grid`). */
  grid: GridState;
  /** Pixel size of each square step cell. */
  cellSize?: number;
  /** Pixel gap between cells. */
  gap?: number;
  /** Milliseconds per step while looping; ignored under `prefers-reduced-motion`. */
  stepMs?: number;
  className?: string;
}

/**
 * Small, purely decorative, non-interactive step-grid visualization. Loops a
 * playhead across `STEPS_PER_BAR` columns, brightening whichever cells are
 * active in the current column. Reads its coloring entirely from the
 * `--genre-*` CSS custom properties in scope, so callers can drop it inside
 * a container styled with a specific genre's skin (via `skinToCssVars`) to
 * get that genre's palette, independent of whatever skin is active
 * elsewhere on the page.
 *
 * Under `prefers-reduced-motion`, the sweep is disabled entirely and all
 * active cells render at a constant, calmer brightness.
 */
export default function MiniGrid({ grid, cellSize = 8, gap = 3, stepMs = 130, className }: MiniGridProps) {
  const prefersReducedMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS_PER_BAR), stepMs);
    return () => clearInterval(id);
  }, [prefersReducedMotion, stepMs]);

  return (
    <Grid $cell={cellSize} $gap={gap} className={className} aria-hidden="true">
      {TRACK_ORDER.map((track) =>
        grid[track].map((on, i) => {
          const active = on === 1;
          const isCurrent = !prefersReducedMotion && i === step;
          return (
            <Cell
              key={`${track}-${i}`}
              style={{ background: active ? 'var(--genre-cell-on)' : 'var(--genre-cell-off)' }}
              animate={{
                opacity: active ? (isCurrent ? 1 : 0.75) : isCurrent ? 0.3 : 0.15,
                scale: active && isCurrent ? 1.3 : 1,
              }}
              transition={{ duration: 0.12 }}
            />
          );
        })
      )}
    </Grid>
  );
}
