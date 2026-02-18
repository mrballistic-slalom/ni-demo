'use client';

import { useEffect } from 'react';
import Box from '@mui/material/Box';
import { useGridStore } from '@/stores/useGridStore';
import { GENRE_THEMES } from '@/theme/genreThemes';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const genre = useGridStore((s) => s.genre);
  const theme = GENRE_THEMES[genre];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--genre-primary', theme.primary);
    root.style.setProperty('--genre-secondary', theme.secondary);
    root.style.setProperty('--genre-accent', theme.accent);
    root.style.setProperty('--genre-cell-active', theme.cellActive);
    root.style.setProperty('--genre-cell-inactive', theme.cellInactive);
    root.style.setProperty('--genre-playhead', theme.playhead);
    root.style.setProperty('--genre-background', theme.background);
  }, [theme]);

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: theme.background,
      transition: 'background-color 0.3s ease',
    }}>
      {children}
    </Box>
  );
}
