'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { GENRES, GENRE_LIST } from '@/data/genres';
import { useGridStore } from '@/stores/useGridStore';
import { initAudio } from '@/audio/engine';
import { useTransportStore } from '@/stores/useTransportStore';

/**
 * Displays a grid of genre cards on the landing page. Selecting a genre
 * initializes the audio engine, sets the genre in the store, and navigates
 * to the studio view.
 */
export default function GenreSelect() {
  const router = useRouter();
  const setGenre = useGridStore((s) => s.setGenre);

  const handleGenreClick = async (genreId: typeof GENRE_LIST[number]) => {
    await initAudio();
    useTransportStore.getState().setAudioContextStarted(true);
    setGenre(genreId);
    router.push('/studio');
  };

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
      gap: 2,
      width: '100%',
      maxWidth: 600,
    }}>
      {GENRE_LIST.map((genreId) => {
        const genre = GENRES[genreId];
        return (
          <ButtonBase
            key={genreId}
            onClick={() => handleGenreClick(genreId)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${genre.colorSecondary}, ${genre.colorPrimary}20)`,
              border: `1px solid ${genre.colorPrimary}40`,
              transition: 'all 0.2s ease',
              minHeight: 120,
              '&:hover': {
                border: `1px solid ${genre.colorPrimary}`,
                transform: 'scale(1.02)',
                boxShadow: `0 0 20px ${genre.colorPrimary}30`,
              },
              '&:active': {
                transform: 'scale(0.98)',
              },
            }}
          >
            <Typography variant="h6" sx={{
              fontWeight: 700,
              color: genre.colorPrimary,
              mb: 0.5,
            }}>
              {genre.label}
            </Typography>
            <Typography variant="caption" sx={{
              color: 'text.secondary',
              textAlign: 'center',
            }}>
              {genre.description}
            </Typography>
            <Typography variant="caption" sx={{
              color: genre.colorAccent,
              mt: 0.5,
              opacity: 0.7,
              fontSize: '0.65rem',
            }}>
              {genre.bpmRange[0]}-{genre.bpmRange[1]} BPM
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
