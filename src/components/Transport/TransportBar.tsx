'use client';

import { useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import StopRounded from '@mui/icons-material/StopRounded';
import { useGridStore } from '@/stores/useGridStore';
import { useTransportStore } from '@/stores/useTransportStore';
import { startPlayback, stopPlayback, updateBpm, createSequence } from '@/audio/sequencer';
import { loadAllSounds } from '@/audio/soundLoader';
import { GENRES } from '@/data/genres';

export default function TransportBar() {
  const isPlaying = useTransportStore((s) => s.isPlaying);
  const genre = useGridStore((s) => s.genre);
  const bpm = useGridStore((s) => s.bpm);
  const patternLength = useGridStore((s) => s.patternLength);
  const setBpm = useGridStore((s) => s.setBpm);
  const setPatternLength = useGridStore((s) => s.setPatternLength);

  const genreDef = GENRES[genre];

  // Load sounds when genre changes
  useEffect(() => {
    loadAllSounds();
  }, [genre]);

  const handlePlayToggle = useCallback(async () => {
    if (isPlaying) {
      stopPlayback();
      useTransportStore.getState().setPlaying(false);
    } else {
      await loadAllSounds();
      createSequence();
      startPlayback();
      useTransportStore.getState().setPlaying(true);
    }
  }, [isPlaying]);

  const handleBpmChange = useCallback((_: Event, value: number | number[]) => {
    const newBpm = value as number;
    setBpm(newBpm);
    updateBpm(newBpm);
  }, [setBpm]);

  const handlePatternLengthChange = useCallback((length: 1 | 2 | 4) => {
    if (isPlaying) {
      stopPlayback();
      useTransportStore.getState().setPlaying(false);
    }
    setPatternLength(length);
  }, [isPlaying, setPatternLength]);

  return (
    <Box sx={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      px: 2,
      py: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      zIndex: 100,
    }}>
      {/* BPM Slider */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ color: 'var(--genre-accent)', fontWeight: 600, minWidth: 60 }}>
          {bpm} BPM
        </Typography>
        <Slider
          value={bpm}
          min={genreDef.bpmRange[0]}
          max={genreDef.bpmRange[1]}
          onChange={handleBpmChange}
          sx={{
            color: 'var(--genre-primary)',
            '& .MuiSlider-thumb': { width: 16, height: 16 },
          }}
        />
      </Box>

      {/* Play/Stop Button */}
      <IconButton
        onClick={handlePlayToggle}
        sx={{
          width: 56,
          height: 56,
          backgroundColor: 'var(--genre-primary)',
          color: '#fff',
          '&:hover': {
            backgroundColor: 'var(--genre-accent)',
          },
          flexShrink: 0,
        }}
      >
        {isPlaying ? <StopRounded sx={{ fontSize: 32 }} /> : <PlayArrowRounded sx={{ fontSize: 32 }} />}
      </IconButton>

      {/* Pattern Length */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
        {([1, 2, 4] as const).map((len) => (
          <Chip
            key={len}
            label={`${len} bar${len > 1 ? 's' : ''}`}
            size="small"
            onClick={() => handlePatternLengthChange(len)}
            sx={{
              backgroundColor: patternLength === len ? 'var(--genre-primary)' : 'rgba(255,255,255,0.08)',
              color: patternLength === len ? '#fff' : 'text.secondary',
              fontWeight: 600,
              fontSize: '0.7rem',
              '&:hover': { backgroundColor: patternLength === len ? 'var(--genre-accent)' : 'rgba(255,255,255,0.12)' },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
