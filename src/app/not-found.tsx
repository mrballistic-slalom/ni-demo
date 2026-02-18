import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>404</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>Page not found</Typography>
      <Link href="/" style={{ color: '#7c4dff' }}>Back to home</Link>
    </Box>
  );
}
