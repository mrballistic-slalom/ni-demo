'use client';

import { useCallback } from 'react';
import styled from '@emotion/styled';
import { Drum, Disc, Disc3, Piano, Guitar, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import GridCell from './GridCell';
import Playhead from './Playhead';
import { useGridStore } from '@/stores/useGridStore';
import { useTransportStore } from '@/stores/useTransportStore';
import { SKINS } from '@/theme/skins';
import { TRACK_ORDER, TrackCategory, STEPS_PER_BAR } from '@/types';

const TRACK_LABELS: Record<TrackCategory, string> = {
  kick: 'KICK',
  snare: 'SNARE',
  hihat: 'HI-HAT',
  melody: 'MELODY',
  bass: 'BASS',
  fx: 'FX',
};

const TRACK_ICONS: Record<TrackCategory, LucideIcon> = {
  kick: Drum,
  snare: Disc,
  hihat: Disc3,
  melody: Piano,
  bass: Guitar,
  fx: Sparkles,
};

/** Fixed width (px) reserved for the icon + label column; kept in sync with the playhead's left offset. */
const LABEL_WIDTH = 64;

const ScrollArea = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
`;

const GridBody = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--genre-cell-gap);
  min-width: 100%;
  width: fit-content;
`;

const TrackRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--genre-cell-gap);
`;

const TrackLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: ${LABEL_WIDTH}px;
  flex-shrink: 0;
  padding: 2px 4px;
  border-radius: var(--genre-cell-radius, 4px);
  background: var(--genre-surface);
  color: var(--genre-text-dim);
  position: sticky;
  left: 0;
  z-index: 2;
`;

const LabelText = styled.span`
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  white-space: nowrap;
  color: var(--genre-text-dim);
`;

const CellRow = styled.div<{ $steps: number }>`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(${(p) => p.$steps}, minmax(44px, 1fr));
  gap: var(--genre-cell-gap);
  height: 48px;
`;

const PlayheadLayer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(${LABEL_WIDTH}px + var(--genre-cell-gap));
  right: 0;
  z-index: 1;
`;

/**
 * Renders the full step-sequencer grid: one row per track, each with an
 * instrument icon + short label followed by `patternLength * STEPS_PER_BAR`
 * {@link GridCell} steps laid out in a CSS grid. Scrolls horizontally
 * (track labels stay pinned via `position: sticky`) when the pattern is
 * wider than the viewport. A single {@link Playhead} beam is layered over
 * the cell columns (excluding the label rail) and sweeps in sync with the
 * transport's `currentStep`.
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
              <TrackLabel>
                <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
                <LabelText>{TRACK_LABELS[track]}</LabelText>
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
