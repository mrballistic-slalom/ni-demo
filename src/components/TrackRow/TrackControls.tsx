'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRounded from '@mui/icons-material/VolumeOffRounded';
import { useGridStore } from '@/stores/useGridStore';
import { TrackCategory } from '@/types';
import { useCallback } from 'react';

/** Props for {@link TrackControls}. */
interface TrackControlsProps {
  /** The track category to render controls for. */
  track: TrackCategory;
  /** Callback invoked when the sound name label is clicked. */
  onSoundClick: (track: TrackCategory) => void;
}

/**
 * Per-track mixer controls including mute, solo, volume slider, and a
 * clickable sound name that opens the sound browser.
 */
export default function TrackControls({ track, onSoundClick }: TrackControlsProps) {
  const muted = useGridStore((s) => s.mutes[track]);
  const soloed = useGridStore((s) => s.solos[track]);
  const volume = useGridStore((s) => s.volumes[track]);
  const toggleMute = useGridStore((s) => s.toggleMute);
  const toggleSolo = useGridStore((s) => s.toggleSolo);
  const setVolume = useGridStore((s) => s.setVolume);
  const soundId = useGridStore((s) => s.sounds[track]);

  const handleVolumeChange = useCallback((_: Event, value: number | number[]) => {
    setVolume(track, value as number);
  }, [track, setVolume]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 200 }}>
      <IconButton
        size="small"
        onClick={() => toggleMute(track)}
        sx={{
          color: muted ? '#FF5252' : 'text.secondary',
          fontSize: '0.6rem',
          width: 28,
          height: 28,
        }}
      >
        {muted ? <VolumeOffRounded fontSize="small" /> : <VolumeUpRounded fontSize="small" />}
      </IconButton>

      <Typography
        variant="caption"
        onClick={() => toggleSolo(track)}
        sx={{
          cursor: 'pointer',
          color: soloed ? 'var(--genre-accent)' : 'text.secondary',
          fontWeight: soloed ? 700 : 400,
          fontSize: '0.6rem',
          minWidth: 14,
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        S
      </Typography>

      <Slider
        value={volume}
        min={0}
        max={1}
        step={0.01}
        onChange={handleVolumeChange}
        sx={{
          width: 60,
          color: 'var(--genre-primary)',
          '& .MuiSlider-thumb': { width: 10, height: 10 },
          '& .MuiSlider-rail': { opacity: 0.3 },
        }}
      />

      <Typography
        variant="caption"
        onClick={() => onSoundClick(track)}
        sx={{
          cursor: 'pointer',
          color: 'var(--genre-accent)',
          fontSize: '0.6rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 80,
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {soundId}
      </Typography>
    </Box>
  );
}
