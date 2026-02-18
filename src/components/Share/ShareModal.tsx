'use client';

import { useState, useCallback } from 'react';
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
import { generateShareId } from '@/lib/utils';
import { useProjectStore } from '@/stores/useProjectStore';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ShareModal({ open, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const title = useProjectStore((s) => s.currentTitle);

  // For now, generate a share URL client-side
  const shareId = generateShareId();
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/beat/${shareId}`
    : '';

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
