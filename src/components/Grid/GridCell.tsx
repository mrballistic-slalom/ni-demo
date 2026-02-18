'use client';

import React from 'react';
import Box from '@mui/material/Box';
import { TrackCategory } from '@/types';

interface GridCellProps {
  track: TrackCategory;
  step: number;
  active: boolean;
  isPlayhead: boolean;
  onToggle: (track: TrackCategory, step: number) => void;
}

const GridCell = React.memo(function GridCell({ track, step, active, isPlayhead, onToggle }: GridCellProps) {
  return (
    <Box
      component="button"
      onClick={() => onToggle(track, step)}
      sx={{
        minWidth: 44,
        minHeight: 44,
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: 1,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.1s ease',
        backgroundColor: active
          ? 'var(--genre-cell-active)'
          : 'var(--genre-cell-inactive)',
        opacity: active ? 1 : 0.8,
        boxShadow: active
          ? '0 0 8px var(--genre-cell-active), inset 0 0 4px rgba(255,255,255,0.15)'
          : 'none',
        outline: isPlayhead ? '2px solid var(--genre-accent)' : 'none',
        outlineOffset: -2,
        '&:hover': {
          opacity: 1,
          filter: 'brightness(1.2)',
        },
        '&:active': {
          transform: 'scale(0.92)',
        },
        // Beat markers (every 4th step slightly brighter)
        ...(step % 4 === 0 && !active && {
          backgroundColor: 'var(--genre-cell-inactive)',
          opacity: 1,
          border: '1px solid rgba(255,255,255,0.06)',
        }),
      }}
    />
  );
});

export default GridCell;
