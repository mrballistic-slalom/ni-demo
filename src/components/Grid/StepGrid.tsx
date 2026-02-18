'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GridCell from './GridCell';
import { useGridStore } from '@/stores/useGridStore';
import { useTransportStore } from '@/stores/useTransportStore';
import { TRACK_ORDER, TrackCategory, STEPS_PER_BAR } from '@/types';
import { useCallback } from 'react';

const TRACK_LABELS: Record<TrackCategory, string> = {
  kick: 'KICK',
  snare: 'SNARE',
  hihat: 'HI-HAT',
  melody: 'MELODY',
  bass: 'BASS',
  fx: 'FX',
};

/**
 * Renders the full step-sequencer grid with one row per track.
 * Each row displays a label and a series of {@link GridCell} components.
 * Supports horizontal scrolling for multi-bar patterns.
 */
export default function StepGrid() {
  const grid = useGridStore((s) => s.grid);
  const patternLength = useGridStore((s) => s.patternLength);
  const toggleCell = useGridStore((s) => s.toggleCell);
  const currentStep = useTransportStore((s) => s.currentStep);

  const totalSteps = patternLength * STEPS_PER_BAR;

  const handleToggle = useCallback((track: TrackCategory, step: number) => {
    toggleCell(track, step);
  }, [toggleCell]);

  return (
    <Box sx={{
      overflowX: 'auto',
      pb: 1,
      WebkitOverflowScrolling: 'touch',
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: totalSteps > 16 ? totalSteps * 48 : 'auto',
      }}>
        {TRACK_ORDER.map((track) => (
          <Box key={track} sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Typography
              variant="caption"
              sx={{
                minWidth: 56,
                color: 'var(--genre-accent)',
                fontWeight: 600,
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                textAlign: 'right',
                pr: 1,
                flexShrink: 0,
              }}
            >
              {TRACK_LABELS[track]}
            </Typography>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${totalSteps}, 1fr)`,
              gap: '3px',
              flex: 1,
            }}>
              {Array.from({ length: totalSteps }, (_, step) => (
                <GridCell
                  key={`${track}-${step}`}
                  track={track}
                  step={step}
                  active={grid[track]?.[step] === 1}
                  isPlayhead={currentStep === step}
                  onToggle={handleToggle}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
