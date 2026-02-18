import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';

export default function SharedBeatPage({ params }: { params: { shareId: string } }) {
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
        Shared Beat
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}>
        Beat playback coming soon. Share ID: {params.shareId}
      </Typography>
      <Button
        component={Link}
        href="/"
        variant="contained"
        sx={{ backgroundColor: '#FF1744' }}
      >
        Make Your Own Beat
      </Button>
    </Box>
  );
}
