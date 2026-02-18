'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#0A0A0A',
      px: 2,
      py: 3,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => router.push('/')} size="small" sx={{ color: 'text.secondary' }}>
          <ArrowBackRounded />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Your Beats</Typography>
      </Box>

      {/* Milestone Tracker */}
      <Box sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        backgroundColor: '#141414',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
          Progress
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF1744' }}>
          0 of 3 beats
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Create 3 beats to unlock all features
        </Typography>
      </Box>

      {/* Empty State */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 6,
      }}>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
          No beats yet. Let&apos;s make one!
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="contained"
          sx={{ backgroundColor: '#FF1744' }}
        >
          Create a Beat
        </Button>
      </Box>
    </Box>
  );
}
