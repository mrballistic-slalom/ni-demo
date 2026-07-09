'use client';

import { useCallback } from 'react';
import styled from '@emotion/styled';
import GridCell from './GridCell';
import Playhead from './Playhead';
import { useGridStore } from '@/stores/useGridStore';
import { useTransportStore } from '@/stores/useTransportStore';
import { SKINS } from '@/theme/skins';
import { TRACK_ICONS, TRACK_LABELS } from '@/data/trackMeta';
import { TRACK_ORDER, TrackCategory, STEPS_PER_BAR } from '@/types';

/** Fixed width (px) reserved for the icon label column; kept in sync with the playhead's left offset. */
const LABEL_WIDTH = 22;

/**
 * The genre skin's `--genre-cell-gap` can be up to 5px, which is fine for a
 * 44px-min cell but doesn't leave enough room for 16 columns at an
 * 18px-min cell width on a 375px viewport. Clamping it keeps each skin's
 * gap distinct (2-3px of variation survives) while guaranteeing a 1-bar
 * pattern always fits without horizontal scroll.
 */
const STEP_GAP = 'clamp(2px, var(--genre-cell-gap), 3px)';

const ScrollArea = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
`;

const GridBody = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${STEP_GAP};
  width: 100%;
`;

const TrackRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${STEP_GAP};
  min-width: 0;
`;

const TrackLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${LABEL_WIDTH}px;
  height: 44px;
  flex-shrink: 0;
  border-radius: var(--genre-cell-radius, 4px);
  background: var(--genre-surface);
  color: var(--genre-text-dim);
  position: sticky;
  left: 0;
  z-index: 2;
`;

const CellRow = styled.div<{ $steps: number }>`
  --step-gap: ${STEP_GAP};
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(${(p) => p.$steps}, minmax(18px, 1fr));
  gap: var(--step-gap);
  height: 44px;
`;

const PlayheadLayer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(${LABEL_WIDTH}px + ${STEP_GAP});
  right: 0;
  z-index: 1;
  /* The beam overlay spans the whole grid body above the cell buttons — it
     must never intercept taps, or cells become untappable. */
  pointer-events: none;
`;

/**
 * Renders the full step-sequencer grid: one row per track, each with a
 * small instrument icon (full names live in {@link TrackControls} below)
 * followed by `patternLength * STEPS_PER_BAR` {@link GridCell} steps laid
 * out in a CSS grid. A 1-bar (16-step) pattern is sized to fit a 375px
 * viewport without horizontal scroll -- cells flex down to an 18px floor
 * and the inter-cell gap is clamped (see {@link STEP_GAP}) so the grid
 * never needs more room than that. Longer patterns (2/4 bars) still
 * overflow and scroll horizontally once cells hit that floor (track
 * labels stay pinned via `position: sticky`). A single {@link Playhead}
 * beam is layered over the cell columns (excluding the label rail) and
 * sweeps in sync with the transport's `currentStep`.
 *
 * Reads `grid`/`patternLength`/`toggleCell` from {@link useGridStore} and
 * `currentStep` from {@link useTransportStore}; the active genre's
 * `hitPop` motion factor is looked up from {@link SKINS} and passed down
 * to each cell so none of this component hardcodes a genre color.
 */
export default function StepGrid() {
  const grid = useGridStore((s) => s.grid);
  const patternLength = useGridStore((s) => s.patternLength);
  const toggleCell = useGridStore((s) => s.toggleCell);
  const genre = useGridStore((s) => s.genre);
  const currentStep = useTransportStore((s) => s.currentStep);

  const totalSteps = patternLength * STEPS_PER_BAR;
  const hitPop = SKINS[genre].motion.hitPop;

  const handleToggle = useCallback(
    (track: TrackCategory, step: number) => {
      toggleCell(track, step);
    },
    [toggleCell]
  );

  return (
    <ScrollArea>
      <GridBody>
        {TRACK_ORDER.map((track) => {
          const Icon = TRACK_ICONS[track];
          return (
            <TrackRow key={track}>
              <TrackLabel aria-label={TRACK_LABELS[track]} title={TRACK_LABELS[track]}>
                <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
              </TrackLabel>
              <CellRow $steps={totalSteps}>
                {Array.from({ length: totalSteps }, (_, step) => (
                  <GridCell
                    key={step}
                    track={track}
                    step={step}
                    active={grid[track]?.[step] === 1}
                    isPlayhead={currentStep === step}
                    hitPop={hitPop}
                    groupEnd={(step + 1) % 4 === 0 && step !== totalSteps - 1}
                    onToggle={handleToggle}
                  />
                ))}
              </CellRow>
            </TrackRow>
          );
        })}
        <PlayheadLayer>
          <Playhead totalSteps={totalSteps} currentStep={currentStep} />
        </PlayheadLayer>
      </GridBody>
    </ScrollArea>
  );
}
