'use client';

import { useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { useGridStore } from '@/stores/useGridStore';
import { useProjectStore } from '@/stores/useProjectStore';

/** Props for {@link ExportModal}. */
interface ExportModalProps {
  /** Whether the modal is currently visible. */
  open: boolean;
  /** Callback to close the modal. */
  onClose: () => void;
}

/**
 * Modal dialog for exporting the current beat as an audio file.
 * Currently shows a placeholder; full offline rendering via Tone.Offline
 * is planned for a future release.
 */
export default function ExportModal({ open, onClose }: ExportModalProps) {
  const [exporting, setExporting] = useState(false);
  const genre = useGridStore((s) => s.genre);
  const bpm = useGridStore((s) => s.bpm);
  const title = useProjectStore((s) => s.currentTitle);

  const handleExport = useCallback(async (_format: 'wav') => {
    setExporting(true);
    try {
      // For MVP, create a simple notification that export is coming soon
      // Full offline rendering would use Tone.Offline
      alert('Export feature coming soon! For now, use screen recording to capture your beat.');
    } finally {
      setExporting(false);
    }
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1A1A1A',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Export Beat</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Download your beat as an audio file.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => handleExport('wav')}
            disabled={exporting}
            startIcon={exporting ? <CircularProgress size={16} /> : null}
            sx={{ backgroundColor: 'var(--genre-primary)' }}
          >
            {exporting ? 'Rendering...' : 'Export WAV'}
          </Button>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2, display: 'block' }}>
          {title} &middot; {genre} &middot; {bpm} BPM
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
