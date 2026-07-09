'use client';

import { memo } from 'react';
import styled from '@emotion/styled';
import { motion, useReducedMotion } from 'motion/react';
import { TrackCategory } from '@/types';

/** Props for {@link GridCell}. */
interface GridCellProps {
  /** Track category this cell belongs to. */
  track: TrackCategory;
  /** Zero-based step index within the pattern. */
  step: number;
  /** Whether this step is toggled on. */
  active: boolean;
  /** Whether the playhead is currently on this step. */
  isPlayhead: boolean;
  /** The active genre skin's `hitPop` scale factor, used for the on-beat pop animation. */
  hitPop: number;
  /** Callback invoked when the cell is clicked. */
  onToggle: (track: TrackCategory, step: number) => void;
}

const isBeatMarker = (step: number) => step % 4 === 0;

const Cell = styled(motion.button)<{ $active: boolean; $beat: boolean }>`
  appearance: none;
  width: 100%;
  height: 100%;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  border: none;
  border-radius: var(--genre-cell-radius, 4px);
  cursor: pointer;
  background-color: ${(p) => (p.$active ? 'var(--genre-cell-on)' : 'var(--genre-cell-off)')};
  box-shadow: ${(p) =>
    p.$active
      ? '0 0 var(--genre-glow-blur, 12px) var(--genre-glow), inset 0 0 4px rgba(255, 255, 255, 0.2)'
      : 'none'};
  outline: ${(p) => (p.$beat && !p.$active ? '1px solid rgba(255, 255, 255, 0.14)' : 'none')};
  outline-offset: -1px;
  filter: ${(p) => (p.$beat && !p.$active ? 'brightness(1.18)' : 'none')};
  transition: background-color 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;

  &:hover {
    filter: brightness(1.2);
  }

  &:focus-visible {
    outline: 2px solid var(--genre-accent);
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.92);
  }
`;

/**
 * A single toggleable step in the sequencer grid.
 *
 * Off/on fills and bloom read the active genre skin's `--genre-cell-off`,
 * `--genre-cell-on`, `--genre-glow`, and `--genre-cell-radius` custom
 * properties -- never a hardcoded genre color. Every 4th step (a beat
 * marker) gets a subtle brighten/border when inactive so bar structure
 * reads at a glance. When the transport's playhead lands on an active
 * step, the cell "pops" via a brief Motion scale keyframe (using the
 * genre's `hitPop` factor), skipped entirely under `prefers-reduced-motion`.
 *
 * Memoized so toggling or playhead movement only re-renders the cells
 * whose props actually changed.
 */
const GridCell = memo(function GridCell({
  track,
  step,
  active,
  isPlayhead,
  hitPop,
  onToggle,
}: GridCellProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldPop = isPlayhead && active && !prefersReducedMotion;

  return (
    <Cell
      type="button"
      aria-label={`${track} step ${step + 1}, ${active ? 'on' : 'off'}`}
      aria-pressed={active}
      onClick={() => onToggle(track, step)}
      $active={active}
      $beat={isBeatMarker(step)}
      animate={shouldPop ? { scale: [1, hitPop, 1] } : { scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    />
  );
});

export default GridCell;
