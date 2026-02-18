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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AuthModal() {
  const showAuthModal = useAuthStore((s) => s.showAuthModal);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const pendingAction = useAuthStore((s) => s.pendingAction);

  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement Supabase auth
      // For now, just close and run pending action
      closeAuthModal();
      pendingAction?.();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [tab, email, password, closeAuthModal, pendingAction]);

  return (
    <Dialog
      open={showAuthModal}
      onClose={closeAuthModal}
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
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {tab === 0 ? 'Sign Up' : 'Log In'}
        </Typography>
        <IconButton onClick={closeAuthModal} size="small" sx={{ color: 'text.secondary' }}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 2, '& .MuiTab-root': { color: 'text.secondary' }, '& .Mui-selected': { color: 'var(--genre-primary)' } }}
        >
          <Tab label="Sign Up" />
          <Tab label="Log In" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            size="small"
          />
          {error && (
            <Typography variant="caption" color="error">{error}</Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ backgroundColor: 'var(--genre-primary)' }}
          >
            {loading ? 'Loading...' : tab === 0 ? 'Create Account' : 'Sign In'}
          </Button>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'text.primary' }}
          >
            Continue with Google
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
