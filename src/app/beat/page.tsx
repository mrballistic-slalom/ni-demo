'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import { decodeBeatFromUrl } from '@/lib/utils';
import { useGridStore } from '@/stores/useGridStore';

function BeatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const encoded = searchParams.get('b');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!encoded) {
      setError(true);
      setLoading(false);
      return;
    }

    const beatState = decodeBeatFromUrl(encoded);
    if (!beatState) {
      setError(true);
      setLoading(false);
      return;
    }

    // Load the decoded state into the grid store
    useGridStore.getState().loadProject({
      genre: beatState.genre,
      bpm: beatState.bpm,
      pattern_length: 1,
      swing: 0,
      grid: beatState.grid,
      sounds: beatState.sounds,
      volumes: beatState.volumes,
    });

    // Redirect to studio
    router.replace('/studio');
  }, [encoded, router]);

  if (loading && !error) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0A0A0A',
        px: 2,
        py: 4,
      }}>
        <CircularProgress sx={{ color: '#FF1744', mb: 2 }} />
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Loading shared beat...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0A0A0A',
      px: 2,
      py: 4,
    }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#FF1744' }}>
        Invalid Beat Link
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>
        This shared beat link is invalid or has expired. The URL may be incomplete or corrupted.
      </Typography>
      <Button
        component={Link}
        href="/"
        variant="contained"
        sx={{ backgroundColor: '#FF1744' }}
      >
        Go Home
      </Button>
    </Box>
  );
}

export default function SharedBeatPage() {
  return (
    <Suspense>
      <BeatContent />
    </Suspense>
  );
}
