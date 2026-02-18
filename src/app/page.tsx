import GenreSelect from '@/components/GenreSelect/GenreSelect';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      py: 4,
      background: 'linear-gradient(180deg, #0A0A0A 0%, #141414 100%)',
    }}>
      <Typography variant="h3" component="h1" sx={{
        fontWeight: 700,
        mb: 1,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #FF1744, #FF4081, #7C4DFF)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
      }}>
        NI Play
      </Typography>
      <Typography variant="body1" sx={{
        color: 'text.secondary',
        mb: 4,
        textAlign: 'center',
        maxWidth: 400,
      }}>
        Pick a genre. Make a beat. Share it with the world.
      </Typography>
      <GenreSelect />
    </Box>
  );
}
