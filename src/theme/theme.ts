import { createTheme } from '@mui/material/styles';

/** Base dark MUI theme shared across all genres, providing default palette, typography, and component overrides. */
export const baseTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0A0A0A',
      paper: '#141414',
    },
    primary: { main: '#FF1744' },
    secondary: { main: '#1E1E1E' },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255,255,255,0.6)',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif',
    h1: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: '10px 24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
