'use client';

import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import FileDownloadRounded from '@mui/icons-material/FileDownloadRounded';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/Layout/AppShell';
import StepGrid from '@/components/Grid/StepGrid';
import TransportBar from '@/components/Transport/TransportBar';
import TrackControls from '@/components/TrackRow/TrackControls';
import SoundBrowser from '@/components/SoundBrowser/SoundBrowser';
import ShareModal from '@/components/Share/ShareModal';
import ExportModal from '@/components/Export/ExportModal';
import { useGridStore } from '@/stores/useGridStore';
import { TRACK_ORDER, TrackCategory } from '@/types';
import { GENRES } from '@/data/genres';

export default function StudioPage() {
  const router = useRouter();
  const genre = useGridStore((s) => s.genre);
  const genreDef = GENRES[genre];
  const [soundBrowserOpen, setSoundBrowserOpen] = useState(false);
  const [soundBrowserTrack, setSoundBrowserTrack] = useState<TrackCategory | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const handleSoundClick = useCallback((track: TrackCategory) => {
    setSoundBrowserTrack(track);
    setSoundBrowserOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    // TODO: implement save
  }, []);

  const handleShare = useCallback(() => {
    setShareModalOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    setExportModalOpen(true);
  }, []);

  return (
    <AppShell>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        pb: '80px', // Space for transport bar
      }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => router.push('/')} size="small" sx={{ color: 'text.secondary' }}>
              <ArrowBackRounded />
            </IconButton>
            <Typography variant="subtitle1" sx={{
              fontWeight: 700,
              color: 'var(--genre-primary)',
            }}>
              {genreDef.label}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={handleSave} sx={{ color: 'text.secondary' }}>
              <SaveRounded fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleShare} sx={{ color: 'text.secondary' }}>
              <ShareRounded fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleExport} sx={{ color: 'text.secondary' }}>
              <FileDownloadRounded fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Track Controls Row */}
        <Box sx={{
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          gap: 0.5,
          px: 2,
          py: 1,
        }}>
          {TRACK_ORDER.map((track) => (
            <TrackControls key={track} track={track} onSoundClick={handleSoundClick} />
          ))}
        </Box>

        {/* Step Grid */}
        <Box sx={{ flex: 1, px: 2, py: 1 }}>
          <StepGrid />
        </Box>

        {/* Mobile: Tap track label to open sound browser */}
        <Box sx={{
          display: { xs: 'flex', sm: 'none' },
          justifyContent: 'center',
          gap: 1,
          px: 2,
          py: 1,
          flexWrap: 'wrap',
        }}>
          {TRACK_ORDER.map((track) => (
            <Button
              key={track}
              size="small"
              variant="outlined"
              onClick={() => handleSoundClick(track)}
              sx={{
                fontSize: '0.6rem',
                color: 'var(--genre-accent)',
                borderColor: 'var(--genre-cell-inactive)',
                textTransform: 'uppercase',
                minWidth: 'auto',
                px: 1,
              }}
            >
              {track}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Transport Bar */}
      <TransportBar />

      {/* Sound Browser Drawer */}
      <SoundBrowser
        open={soundBrowserOpen}
        onClose={() => setSoundBrowserOpen(false)}
        track={soundBrowserTrack}
      />

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </AppShell>
  );
}
