'use client';

import { useState, useCallback, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRounded from '@mui/icons-material/CloseRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import { encodeBeatToUrl } from '@/lib/utils';
import { useGridStore } from '@/stores/useGridStore';
import { useProjectStore } from '@/stores/useProjectStore';

/** Props for {@link ShareModal}. */
interface ShareModalProps {
  /** Whether the modal is currently visible. */
  open: boolean;
  /** Callback to close the modal. */
  onClose: () => void;
}

/**
 * Modal dialog for sharing the current beat via a generated URL.
 * Supports clipboard copy, native Web Share API, and direct links
 * to X (Twitter) and WhatsApp.
 */
export default function ShareModal({ open, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const title = useProjectStore((s) => s.currentTitle);

  const genre = useGridStore((s) => s.genre);
  const bpm = useGridStore((s) => s.bpm);
  const grid = useGridStore((s) => s.grid);
  const sounds = useGridStore((s) => s.sounds);
  const volumes = useGridStore((s) => s.volumes);

  const shareUrl = useMemo(() => {
    const path = encodeBeatToUrl({ genre, bpm, grid, sounds, volumes });
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
    return path;
  }, [genre, bpm, grid, sounds, volumes]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - NI Play`,
          text: 'Check out this beat I made!',
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    }
  }, [title, shareUrl]);

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
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Share Beat</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            value={shareUrl}
            size="small"
            InputProps={{ readOnly: true, sx: { fontSize: '0.85rem' } }}
          />
          <IconButton onClick={handleCopy} sx={{ color: copied ? '#00E676' : 'text.secondary' }}>
            {copied ? <CheckRounded /> : <ContentCopyRounded />}
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button variant="contained" onClick={handleNativeShare} sx={{ backgroundColor: 'var(--genre-primary)' }}>
              Share...
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this beat I made on NI Play!`)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'text.primary' }}
          >
            Share on X
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this beat I made on NI Play! ${shareUrl}`)}`, '_blank')}
            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'text.primary' }}
          >
            Share on WhatsApp
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
