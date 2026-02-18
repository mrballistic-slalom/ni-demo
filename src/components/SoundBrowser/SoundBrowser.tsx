'use client';

import { useCallback } from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import PlayCircleOutlineRounded from '@mui/icons-material/PlayCircleOutlineRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { TrackCategory } from '@/types';
import { useGridStore } from '@/stores/useGridStore';
import { getSounds } from '@/data/sounds';
import { swapSound } from '@/audio/soundLoader';

/** Props for {@link SoundBrowser}. */
interface SoundBrowserProps {
  /** Whether the drawer is currently visible. */
  open: boolean;
  /** Callback to close the drawer. */
  onClose: () => void;
  /** The track to browse sounds for, or `null` when inactive. */
  track: TrackCategory | null;
}

/**
 * Bottom-sheet drawer that lists available sounds for a given track and
 * genre. Selecting a sound swaps it in via the audio sound loader.
 */
export default function SoundBrowser({ open, onClose, track }: SoundBrowserProps) {
  const genre = useGridStore((s) => s.genre);
  const currentSounds = useGridStore((s) => s.sounds);
  const sounds = track ? getSounds(genre, track) : [];
  const currentSoundId = track ? currentSounds[track] : null;

  const handleSelect = useCallback(async (soundId: string) => {
    if (!track) return;
    await swapSound(track, soundId);
    onClose();
  }, [track, onClose]);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: '#141414',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '50vh',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{
          width: 40,
          height: 4,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          mx: 'auto',
          mb: 2,
        }} />
        <Typography variant="subtitle2" sx={{ color: 'var(--genre-accent)', mb: 1, fontWeight: 600 }}>
          {track ? `${track.toUpperCase()} Sounds` : 'Sounds'}
        </Typography>
        <List dense>
          {sounds.map((sound) => (
            <ListItemButton
              key={sound.id}
              onClick={() => handleSelect(sound.id)}
              selected={sound.id === currentSoundId}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'var(--genre-cell-inactive)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {sound.id === currentSoundId
                  ? <CheckCircleRounded sx={{ color: 'var(--genre-primary)', fontSize: 20 }} />
                  : <PlayCircleOutlineRounded sx={{ color: 'text.secondary', fontSize: 20 }} />
                }
              </ListItemIcon>
              <ListItemText
                primary={sound.name}
                primaryTypographyProps={{
                  variant: 'body2',
                  color: sound.id === currentSoundId ? 'var(--genre-primary)' : 'text.primary',
                  fontWeight: sound.id === currentSoundId ? 600 : 400,
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </SwipeableDrawer>
  );
}
